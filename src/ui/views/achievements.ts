// =====================================================================
// Achievements view — grouped list with progress summary
// =====================================================================
import * as api from '@lib/api';
import { supabase } from '@lib/supabase';
import { useStore } from '@state/store';
import { escapeHtml } from '@lib/format';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  tier: string;
  category: string;
  reward_coin: number;
  reward_xp: number;
  hidden: boolean;
  icon: string | null;
  sort_order: number;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

// Map DB category → display label + emoji
const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  play_volume:  { label: 'Puzzle',   emoji: '🧩' },
  daily:        { label: 'Daily',    emoji: '📅' },
  skill:        { label: 'Mastery',  emoji: '💎' },
  leaderboard:  { label: 'Social',   emoji: '🏆' },
  progression:  { label: 'Streak',   emoji: '🔥' },
  special:      { label: 'Special',  emoji: '✨' },
};

// Map tier → rarity class + stripe color
const TIER_RARITY: Record<string, { cls: string; color: string }> = {
  bronze:   { cls: 'common',  color: '#10b981' },
  silver:   { cls: 'rare',    color: '#8b7bf0' },
  gold:     { cls: 'epic',    color: '#f5a623' },
  platinum: { cls: 'rare',    color: '#8b7bf0' },
  diamond:  { cls: 'epic',    color: '#f5a623' },
};

interface ProgressInputs {
  gameCount: number;
  dailyCount: number;
  perfectCount: number;
  currentStreak: number;
  level: number;
  coins: number;
  themesOwned: number;
}

function computeProgress(id: string, i: ProgressInputs): { progress: number; target: number } | null {
  const COUNTERS: Record<string, [keyof ProgressInputs, number]> = {
    ACH_PLAY_10:       ['gameCount',       10],
    ACH_PLAY_50:       ['gameCount',       50],
    ACH_PLAY_100:      ['gameCount',      100],
    ACH_PLAY_500:      ['gameCount',      500],
    ACH_PLAY_1000:     ['gameCount',     1000],
    ACH_PLAY_5000:     ['gameCount',     5000],
    ACH_DAILY_10:      ['dailyCount',      10],
    ACH_DAILY_50:      ['dailyCount',      50],
    ACH_STREAK_3:      ['currentStreak',    3],
    ACH_STREAK_7:      ['currentStreak',    7],
    ACH_STREAK_14:     ['currentStreak',   14],
    ACH_STREAK_30:     ['currentStreak',   30],
    ACH_STREAK_60:     ['currentStreak',   60],
    ACH_STREAK_100:    ['currentStreak',  100],
    ACH_STREAK_365:    ['currentStreak',  365],
    ACH_PERFECT_5:     ['perfectCount',     5],
    ACH_PERFECT_25:    ['perfectCount',    25],
    ACH_LEVEL_10:      ['level',           10],
    ACH_LEVEL_25:      ['level',           25],
    ACH_LEVEL_50:      ['level',           50],
    ACH_LEVEL_100:     ['level',          100],
    ACH_RICH:          ['coins',        10000],
    ACH_THEME_COLLECT: ['themesOwned',      5],
  };
  const entry = COUNTERS[id];
  if (!entry) return null;
  const [field, target] = entry;
  const progress = Math.min(i[field] as number, target);
  return { progress, target };
}

const SVG_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;
const SVG_LOCK  = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const SVG_COIN  = `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6" fill="rgba(255,255,255,.4)"/></svg>`;

export interface AchievementsProps {
  onBack: () => void;
  nav: BottomNavCallbacks;
}

export function mountAchievementsView(root: HTMLElement, props: AchievementsProps): { unmount: () => void } {
  let defs: AchievementDef[] = [];
  let unlocked: Set<string> = new Set();
  let newlyUnlocked: Set<string> = new Set();
  let loading = true;
  let activeCategory = 'all';
  let progressInputs: ProgressInputs = {
    gameCount: 0, dailyCount: 0, perfectCount: 0,
    currentStreak: 0, level: 1, coins: 0, themesOwned: 0,
  };

  root.innerHTML = `
    <section class="view view--ach">
      <div class="ach-scroll" id="ach-scroll">
        <div class="ach-topbar">
          <button class="ach-back" id="ach-back" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 class="ach-title">
            <svg class="ach-title-ic" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="9" r="5.2"/><path d="M9 13.5 7.5 21l4.5-2.5L16.5 21 15 13.5"/></svg>
            Achievements
          </h1>
        </div>
        <div id="ach-summary"></div>
        <div class="ach-filter" id="ach-filter"></div>
        <div id="ach-body"></div>
      </div>
    </section>
    ${bottomNavHTML('achievements')}
  `;
  wireBottomNav(root, props.nav, 'achievements');

  const summaryEl = root.querySelector<HTMLElement>('#ach-summary')!;
  const filterEl  = root.querySelector<HTMLElement>('#ach-filter')!;
  const bodyEl    = root.querySelector<HTMLElement>('#ach-body')!;

  function renderSummary() {
    const total = defs.length;
    const done  = unlocked.size;
    const pct   = total ? Math.round((done / total) * 100) : 0;
    // SVG circle: r=28, circumference=175.9
    const circ = 175.9;
    const offset = circ - (circ * pct / 100);
    summaryEl.innerHTML = `
      <div class="ach-summary">
        <div class="ach-sum-ring">
          <svg viewBox="0 0 68 68" width="68" height="68">
            <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="7"/>
            <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="7"
              stroke-dasharray="${circ}" stroke-dashoffset="${offset.toFixed(1)}"
              stroke-linecap="round" transform="rotate(-90 34 34)"/>
          </svg>
          <div class="ach-sum-center">
            <div class="ach-sum-pct">${done}</div>
            <div class="ach-sum-sub">/ ${total}</div>
          </div>
        </div>
        <div class="ach-sum-text">
          <div class="ach-sum-title">${done} Unlocked</div>
          <div class="ach-sum-desc">${total - done} more to go, keep playing!</div>
          <div class="ach-sum-bar-wrap"><div class="ach-sum-bar" style="width:${pct}%"></div></div>
        </div>
      </div>
    `;
  }

  function renderFilter() {
    const categories = Array.from(new Set(defs.map((d) => d.category)));
    filterEl.innerHTML = [
      `<button class="ach-chip${activeCategory === 'all' ? ' on' : ''}" data-cat="all">All</button>`,
      ...categories.map((c) => {
        const m = CATEGORY_META[c] ?? { label: c, emoji: '📌' };
        return `<button class="ach-chip${activeCategory === c ? ' on' : ''}" data-cat="${escapeHtml(c)}">${m.emoji} ${m.label}</button>`;
      }),
    ].join('');
    filterEl.querySelectorAll<HTMLButtonElement>('.ach-chip').forEach((btn) => {
      btn.addEventListener('click', () => { activeCategory = btn.dataset.cat!; render(); });
    });
  }

  function renderBody() {
    if (loading) {
      bodyEl.innerHTML = `<div class="ach-loading">Loading…</div>`;
      return;
    }

    const filtered = activeCategory === 'all'
      ? defs
      : defs.filter((d) => d.category === activeCategory);
    const visible = filtered.filter((d) => !d.hidden || unlocked.has(d.id));

    if (!visible.length) {
      bodyEl.innerHTML = `<div class="ach-empty">No achievements here yet.</div>`;
      return;
    }

    // Group by category
    const groups: Record<string, AchievementDef[]> = {};
    for (const d of visible) {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    }

    bodyEl.innerHTML = Object.entries(groups).map(([cat, items]) => {
      const m = CATEGORY_META[cat] ?? { label: cat, emoji: '📌' };
      const doneInGroup = items.filter((d) => unlocked.has(d.id)).length;
      const allDone = doneInGroup === items.length;

      const cards = items.map((d) => {
        const isUnlocked = unlocked.has(d.id);
        const isNew = newlyUnlocked.has(d.id);
        const rarity = TIER_RARITY[d.tier ?? 'bronze'] ?? { cls: 'common', color: '#10b981' };
        const prog = !isUnlocked ? computeProgress(d.id, progressInputs) : null;
        const icon = d.icon || (isUnlocked ? '🏅' : '🔒');

        return `
          <div class="ach-row ${isUnlocked ? 'unlocked' : 'locked'} ${rarity.cls}${isNew ? ' new-unlock' : ''}">
            <div class="ach-row-ic${isUnlocked ? '' : ' ach-row-ic--locked'}">${icon}</div>
            <div class="ach-row-body">
              <div class="ach-row-name">${escapeHtml(d.name)}</div>
              <div class="ach-row-desc">${escapeHtml(d.description)}</div>
              ${prog ? `
                <div class="ach-row-prog">
                  <div class="ach-row-prog-bar"><div class="ach-row-prog-fill" style="width:${Math.round((prog.progress / prog.target) * 100)}%"></div></div>
                  <div class="ach-row-prog-label">${prog.progress} / ${prog.target}</div>
                </div>
              ` : ''}
            </div>
            <div class="ach-row-right">
              ${isUnlocked
                ? `<span class="ach-row-check">${SVG_CHECK}</span>`
                : `<span class="ach-row-lock">${SVG_LOCK}</span>`}
              ${d.reward_coin ? `<span class="ach-row-pts">${SVG_COIN}${d.reward_coin}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="ach-group-head">
          <span class="ach-group-label">${m.emoji} ${m.label}</span>
          <span class="ach-group-count${allDone ? ' done' : ''}">${doneInGroup} / ${items.length}</span>
        </div>
        <div class="ach-list">${cards}</div>
      `;
    }).join('');
  }

  function render() {
    renderSummary();
    renderFilter();
    renderBody();
  }

  async function load() {
    loading = true; bodyEl.innerHTML = `<div class="ach-loading">Loading…</div>`;
    try {
      const state = useStore.getState();
      const userId = state.user?.id;
      const [defList, userList, history, daily, perfect, inventory] = await Promise.all([
        api.getAchievementDefinitions(),
        api.getUserAchievements().catch(() => []),
        userId
          ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId)
          : Promise.resolve({ count: 0 } as any),
        userId
          ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('mode', 'daily')
          : Promise.resolve({ count: 0 } as any),
        userId
          ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('mistakes', 0)
          : Promise.resolve({ count: 0 } as any),
        api.getInventory().catch(() => []),
      ]);
      defs = (defList ?? []) as AchievementDef[];
      const userAchs = (userList ?? []) as UserAchievement[];
      unlocked = new Set(userAchs.map((u) => u.achievement_id));
      // Mark recently unlocked (last 24h) as "new"
      const oneDayAgo = Date.now() - 86400_000;
      newlyUnlocked = new Set(userAchs.filter((u) => new Date(u.unlocked_at).getTime() > oneDayAgo).map((u) => u.achievement_id));
      const ownedIds = ((inventory ?? []) as any[]).map((r) => r.item_id as string);
      progressInputs = {
        gameCount:     (history as any)?.count ?? 0,
        dailyCount:    (daily as any)?.count ?? 0,
        perfectCount:  (perfect as any)?.count ?? 0,
        currentStreak: state.currentStreak,
        level:         state.level,
        coins:         state.coins,
        themesOwned:   ownedIds.filter((id) => id.startsWith('theme_')).length,
      };
      loading = false;
      render();
    } catch {
      loading = false;
      bodyEl.innerHTML = `<div class="ach-empty">Could not load achievements.</div>`;
    }
  }

  root.querySelector('#ach-back')?.addEventListener('click', props.onBack);
  void load();
  return { unmount() {} };
}
