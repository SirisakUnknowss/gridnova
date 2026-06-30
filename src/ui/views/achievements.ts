// =====================================================================
// Achievements view — tiered badge groups + special one-off achievements
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
  category: string;    // badge_group
  badge_level: number; // 1-5 (or 1-10 for legacy groups), 0 for special
  badge_mission: number; // 1-5 for multi-mission groups, 1 for single-mission
  mission_name: string | null;
  reward_coin: number;
  reward_xp: number;
  sort_order: number;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

const BADGE_GROUP_META: Record<string, { label: string; emoji: string }> = {
  play:        { label: 'เล่นเกม',     emoji: '🎮' },
  player:      { label: 'เล่นเกม',     emoji: '🎮' }, // legacy fallback
  daily:       { label: 'Daily',       emoji: '📅' },
  streak:      { label: 'Streak',      emoji: '🔥' },
  flawless:    { label: 'ไม่ผิด',      emoji: '⭐' },
  speedster:   { label: 'เล่นเร็ว',    emoji: '⚡' },
  pure:        { label: 'ไม่ใช้ Hint', emoji: '🧠' },
  leaderboard: { label: 'Leaderboard', emoji: '🏆' },
  progression: { label: 'Level',       emoji: '📈' },
  quest:       { label: 'Quest',       emoji: '📋' },
  special:     { label: 'พิเศษ',       emoji: '✨' },
};

const TIER_COLOR: Record<string, string> = {
  bronze:   '#cd7f32',
  silver:   '#8b7bf0',
  gold:     '#f5a623',
  platinum: '#4fc3f7',
  diamond:  '#e040fb',
};

interface ProgressInputs {
  gameCount: number;
  dailyCount: number;
  perfectCount: number;
  currentStreak: number;
  longestStreak: number;
  distinctDays: number;
  level: number;
  coins: number;
  themesOwned: number;
  questCount: number;
  inventoryCount: number;
  // Play missions
  practiceCount: number;
  easyCount: number;
  hardCount: number;
  expertCount: number;
  // Daily missions
  dailyEasyCount: number;
  dailyHardCount: number;
  dailyPerfectCount: number;
  dailyNoHintCount: number;
  // Streak missions
  maxPerfectRun: number;
  maxPureRun: number;
  // Flawless missions
  perfectPractice: number;
  perfectEasy: number;
  perfectHard: number;
  perfectExpert: number;
}

const COUNTERS: Record<string, [keyof ProgressInputs, number]> = {
  // Play M1: total games
  ACH_PLAY_M1_L1: ['gameCount',    1],
  ACH_PLAY_M1_L2: ['gameCount',   10],
  ACH_PLAY_M1_L3: ['gameCount',   50],
  ACH_PLAY_M1_L4: ['gameCount',  200],
  ACH_PLAY_M1_L5: ['gameCount',  500],
  // Play M2: practice
  ACH_PLAY_M2_L1: ['practiceCount',    1],
  ACH_PLAY_M2_L2: ['practiceCount',   10],
  ACH_PLAY_M2_L3: ['practiceCount',   50],
  ACH_PLAY_M2_L4: ['practiceCount',  200],
  ACH_PLAY_M2_L5: ['practiceCount',  500],
  // Play M3: easy
  ACH_PLAY_M3_L1: ['easyCount',   1],
  ACH_PLAY_M3_L2: ['easyCount',   5],
  ACH_PLAY_M3_L3: ['easyCount',  20],
  ACH_PLAY_M3_L4: ['easyCount', 100],
  ACH_PLAY_M3_L5: ['easyCount', 300],
  // Play M4: hard
  ACH_PLAY_M4_L1: ['hardCount',   1],
  ACH_PLAY_M4_L2: ['hardCount',   5],
  ACH_PLAY_M4_L3: ['hardCount',  20],
  ACH_PLAY_M4_L4: ['hardCount', 100],
  ACH_PLAY_M4_L5: ['hardCount', 300],
  // Play M5: expert
  ACH_PLAY_M5_L1: ['expertCount',   1],
  ACH_PLAY_M5_L2: ['expertCount',   5],
  ACH_PLAY_M5_L3: ['expertCount',  20],
  ACH_PLAY_M5_L4: ['expertCount', 100],
  ACH_PLAY_M5_L5: ['expertCount', 300],
  // Daily M1: total daily
  ACH_DAILY_M1_L1: ['dailyCount',   1],
  ACH_DAILY_M1_L2: ['dailyCount',  10],
  ACH_DAILY_M1_L3: ['dailyCount',  30],
  ACH_DAILY_M1_L4: ['dailyCount', 100],
  ACH_DAILY_M1_L5: ['dailyCount', 365],
  // Daily M2: daily easy
  ACH_DAILY_M2_L1: ['dailyEasyCount',   1],
  ACH_DAILY_M2_L2: ['dailyEasyCount',   5],
  ACH_DAILY_M2_L3: ['dailyEasyCount',  20],
  ACH_DAILY_M2_L4: ['dailyEasyCount',  50],
  ACH_DAILY_M2_L5: ['dailyEasyCount', 200],
  // Daily M3: daily hard
  ACH_DAILY_M3_L1: ['dailyHardCount',   1],
  ACH_DAILY_M3_L2: ['dailyHardCount',   5],
  ACH_DAILY_M3_L3: ['dailyHardCount',  20],
  ACH_DAILY_M3_L4: ['dailyHardCount',  50],
  ACH_DAILY_M3_L5: ['dailyHardCount', 200],
  // Daily M4: daily no mistakes
  ACH_DAILY_M4_L1: ['dailyPerfectCount',   1],
  ACH_DAILY_M4_L2: ['dailyPerfectCount',   5],
  ACH_DAILY_M4_L3: ['dailyPerfectCount',  20],
  ACH_DAILY_M4_L4: ['dailyPerfectCount',  50],
  ACH_DAILY_M4_L5: ['dailyPerfectCount', 100],
  // Daily M5: daily no hints
  ACH_DAILY_M5_L1: ['dailyNoHintCount',   1],
  ACH_DAILY_M5_L2: ['dailyNoHintCount',   5],
  ACH_DAILY_M5_L3: ['dailyNoHintCount',  20],
  ACH_DAILY_M5_L4: ['dailyNoHintCount',  50],
  ACH_DAILY_M5_L5: ['dailyNoHintCount', 100],
  // Streak M1: current streak
  ACH_STREAK_M1_L1: ['currentStreak',  3],
  ACH_STREAK_M1_L2: ['currentStreak',  7],
  ACH_STREAK_M1_L3: ['currentStreak', 14],
  ACH_STREAK_M1_L4: ['currentStreak', 30],
  ACH_STREAK_M1_L5: ['currentStreak', 60],
  // Streak M2: longest streak
  ACH_STREAK_M2_L1: ['longestStreak',   7],
  ACH_STREAK_M2_L2: ['longestStreak',  14],
  ACH_STREAK_M2_L3: ['longestStreak',  30],
  ACH_STREAK_M2_L4: ['longestStreak', 100],
  ACH_STREAK_M2_L5: ['longestStreak', 365],
  // Streak M3: distinct days
  ACH_STREAK_M3_L1: ['distinctDays',   7],
  ACH_STREAK_M3_L2: ['distinctDays',  30],
  ACH_STREAK_M3_L3: ['distinctDays',  90],
  ACH_STREAK_M3_L4: ['distinctDays', 180],
  ACH_STREAK_M3_L5: ['distinctDays', 365],
  // Streak M4: max perfect run
  ACH_STREAK_M4_L1: ['maxPerfectRun',  2],
  ACH_STREAK_M4_L2: ['maxPerfectRun',  5],
  ACH_STREAK_M4_L3: ['maxPerfectRun', 10],
  ACH_STREAK_M4_L4: ['maxPerfectRun', 20],
  ACH_STREAK_M4_L5: ['maxPerfectRun', 50],
  // Streak M5: max pure run
  ACH_STREAK_M5_L1: ['maxPureRun',  2],
  ACH_STREAK_M5_L2: ['maxPureRun',  5],
  ACH_STREAK_M5_L3: ['maxPureRun', 10],
  ACH_STREAK_M5_L4: ['maxPureRun', 20],
  ACH_STREAK_M5_L5: ['maxPureRun', 50],
  // Flawless M1: total no-mistake wins
  ACH_FLAWLESS_M1_L1: ['perfectCount',  1],
  ACH_FLAWLESS_M1_L2: ['perfectCount',  5],
  ACH_FLAWLESS_M1_L3: ['perfectCount', 10],
  ACH_FLAWLESS_M1_L4: ['perfectCount', 20],
  ACH_FLAWLESS_M1_L5: ['perfectCount', 50],
  // Flawless M2: practice no-mistake
  ACH_FLAWLESS_M2_L1: ['perfectPractice',  1],
  ACH_FLAWLESS_M2_L2: ['perfectPractice',  5],
  ACH_FLAWLESS_M2_L3: ['perfectPractice', 10],
  ACH_FLAWLESS_M2_L4: ['perfectPractice', 20],
  ACH_FLAWLESS_M2_L5: ['perfectPractice', 50],
  // Flawless M3: easy no-mistake
  ACH_FLAWLESS_M3_L1: ['perfectEasy',  1],
  ACH_FLAWLESS_M3_L2: ['perfectEasy',  5],
  ACH_FLAWLESS_M3_L3: ['perfectEasy', 10],
  ACH_FLAWLESS_M3_L4: ['perfectEasy', 20],
  ACH_FLAWLESS_M3_L5: ['perfectEasy', 50],
  // Flawless M4: hard no-mistake
  ACH_FLAWLESS_M4_L1: ['perfectHard',  1],
  ACH_FLAWLESS_M4_L2: ['perfectHard',  3],
  ACH_FLAWLESS_M4_L3: ['perfectHard',  5],
  ACH_FLAWLESS_M4_L4: ['perfectHard', 10],
  ACH_FLAWLESS_M4_L5: ['perfectHard', 20],
  // Flawless M5: expert no-mistake
  ACH_FLAWLESS_M5_L1: ['perfectExpert',  1],
  ACH_FLAWLESS_M5_L2: ['perfectExpert',  3],
  ACH_FLAWLESS_M5_L3: ['perfectExpert',  5],
  ACH_FLAWLESS_M5_L4: ['perfectExpert', 10],
  ACH_FLAWLESS_M5_L5: ['perfectExpert', 15],
  // Legacy progression
  ACH_PROG_L1:  ['level',   3],
  ACH_PROG_L2:  ['level',   5],
  ACH_PROG_L3:  ['level',  10],
  ACH_PROG_L4:  ['level',  20],
  ACH_PROG_L5:  ['level',  30],
  ACH_PROG_L6:  ['level',  40],
  ACH_PROG_L7:  ['level',  50],
  ACH_PROG_L8:  ['level',  60],
  ACH_PROG_L9:  ['level',  75],
  ACH_PROG_L10: ['level', 100],
  // Legacy quest
  ACH_QUEST_L1:  ['questCount',   1],
  ACH_QUEST_L2:  ['questCount',   5],
  ACH_QUEST_L3:  ['questCount',  10],
  ACH_QUEST_L4:  ['questCount',  20],
  ACH_QUEST_L5:  ['questCount',  30],
  ACH_QUEST_L6:  ['questCount',  50],
  ACH_QUEST_L7:  ['questCount',  75],
  ACH_QUEST_L8:  ['questCount', 100],
  ACH_QUEST_L9:  ['questCount', 150],
  ACH_QUEST_L10: ['questCount', 200],
  // Special
  ACH_RICH:          ['coins',          10000],
  ACH_THEME_COLLECT: ['themesOwned',        5],
  ACH_SHOPAHOLIC:    ['inventoryCount',    10],
};

function computeProgress(id: string, i: ProgressInputs): { progress: number; target: number } | null {
  const entry = COUNTERS[id];
  if (!entry) return null;
  const [field, target] = entry;
  return { progress: Math.min(i[field] as number, target), target };
}

const SVG_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;
const SVG_LOCK  = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const SVG_COIN  = `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6" fill="rgba(255,255,255,.4)"/></svg>`;

function enableDragScroll(el: HTMLElement): void {
  let down = false, startX = 0, startScroll = 0, moved = false;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false;
    startX = e.clientX; startScroll = el.scrollLeft;
  });
  el.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) { moved = true; el.classList.add('dragging'); }
    el.scrollLeft = startScroll - dx;
  });
  const end = () => { down = false; el.classList.remove('dragging'); };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointerleave', end);
  el.addEventListener('click', (e) => {
    if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
  }, true);
}

export interface AchievementsProps {
  onBack: () => void;
  nav: BottomNavCallbacks;
}

export function mountAchievementsView(root: HTMLElement, props: AchievementsProps): { unmount: () => void } {
  let defs: AchievementDef[] = [];
  let unlocked: Set<string> = new Set();
  let newlyUnlocked: Set<string> = new Set();
  let loading = true;
  let activeGroup = 'all';
  let progressInputs: ProgressInputs = {
    gameCount: 0, dailyCount: 0, perfectCount: 0,
    currentStreak: 0, longestStreak: 0, distinctDays: 0,
    level: 1, coins: 0, themesOwned: 0,
    questCount: 0, inventoryCount: 0,
    practiceCount: 0, easyCount: 0, hardCount: 0, expertCount: 0,
    dailyEasyCount: 0, dailyHardCount: 0, dailyPerfectCount: 0, dailyNoHintCount: 0,
    maxPerfectRun: 0, maxPureRun: 0,
    perfectPractice: 0, perfectEasy: 0, perfectHard: 0, perfectExpert: 0,
  };

  root.innerHTML = `
    <section class="view view--ach">
      <div class="ach-sticky">
        <div class="ach-topbar">
          <button class="ach-back" id="ach-back" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 class="ach-title">
            <span class="ach-title-ic">🏅</span>
            Medals
          </h1>
          <div style="width:40px;flex:none"></div>
        </div>
        <div id="ach-summary"></div>
        <div class="ach-filter" id="ach-filter"></div>
      </div>
      <div id="ach-body" style="width:99%"></div>
    </section>
    ${bottomNavHTML('achievements')}
  `;
  wireBottomNav(root, props.nav, 'achievements');

  const summaryEl = root.querySelector<HTMLElement>('#ach-summary')!;
  const filterEl  = root.querySelector<HTMLElement>('#ach-filter')!;
  const bodyEl    = root.querySelector<HTMLElement>('#ach-body')!;

  enableDragScroll(filterEl);

  function renderSummary() {
    const total = defs.length;
    const done  = unlocked.size;
    const pct   = total ? Math.round((done / total) * 100) : 0;
    const circ  = 175.9;
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
    const groups = Array.from(new Set(defs.map((d) => d.category)));
    filterEl.innerHTML = [
      `<button class="ach-chip${activeGroup === 'all' ? ' on' : ''}" data-cat="all">All</button>`,
      ...groups.map((g) => {
        const m = BADGE_GROUP_META[g] ?? { label: g, emoji: '📌' };
        return `<button class="ach-chip${activeGroup === g ? ' on' : ''}" data-cat="${escapeHtml(g)}">${m.emoji} ${m.label}</button>`;
      }),
    ].join('');
    filterEl.querySelectorAll<HTMLButtonElement>('.ach-chip').forEach((btn) => {
      btn.addEventListener('click', () => { activeGroup = btn.dataset.cat!; render(); });
    });
  }

  function renderTieredBadge(tiered: AchievementDef[], missionLabel: string | null): string {
    const maxLevel = tiered.length;
    const currentLevel = tiered.filter((d) => unlocked.has(d.id)).length;
    const nextItem = tiered.find((d) => !unlocked.has(d.id));
    const isNew = tiered.some((d) => newlyUnlocked.has(d.id));
    const allDone = currentLevel === maxLevel;

    const dots = tiered.map((d) => {
      const on = unlocked.has(d.id);
      const color = TIER_COLOR[d.tier] ?? '#888';
      return `<span class="ach-dot${on ? ' on' : ''}" style="${on ? `background:${color};box-shadow:0 0 6px ${color}80` : ''}"></span>`;
    }).join('');

    let progressHtml = '';
    if (nextItem) {
      const prog = computeProgress(nextItem.id, progressInputs);
      if (prog) {
        const pct = Math.round((prog.progress / prog.target) * 100);
        progressHtml = `
          <div class="ach-row-prog" style="margin-top:6px">
            <div class="ach-row-prog-bar"><div class="ach-row-prog-fill" style="width:${pct}%"></div></div>
            <div class="ach-row-prog-label">${prog.progress} / ${prog.target}</div>
          </div>`;
      }
    }

    const lastUnlocked = currentLevel > 0 ? tiered[currentLevel - 1] : null;

    return `
      <div class="ach-badge-card${allDone ? ' all-done' : ''}${isNew ? ' new-unlock' : ''}">
        ${missionLabel ? `<div class="ach-mission-label">${escapeHtml(missionLabel)}</div>` : ''}
        <div class="ach-badge-dots">${dots}<span class="ach-badge-lvl">${currentLevel}/${maxLevel}</span></div>
        ${lastUnlocked ? `
          <div class="ach-badge-current">
            <span class="ach-badge-check">${SVG_CHECK}</span>
            <span class="ach-badge-cname">L${lastUnlocked.badge_level} ${escapeHtml(lastUnlocked.name)}</span>
            <span class="ach-badge-coin">${SVG_COIN}${lastUnlocked.reward_coin}</span>
          </div>` : ''}
        ${nextItem ? `
          <div class="ach-badge-next">
            <span class="ach-badge-lock">${SVG_LOCK}</span>
            <div class="ach-badge-next-body">
              <div class="ach-badge-next-name">L${nextItem.badge_level} ${escapeHtml(nextItem.name)}</div>
              <div class="ach-badge-next-desc">${escapeHtml(nextItem.description)}</div>
              ${progressHtml}
            </div>
            <span class="ach-badge-coin next">${SVG_COIN}${nextItem.reward_coin}</span>
          </div>` : `<div class="ach-badge-maxed">🏆 Max level!</div>`}
      </div>
    `;
  }

  function renderFlatCard(d: AchievementDef): string {
    const isUnlocked = unlocked.has(d.id);
    const isNew = newlyUnlocked.has(d.id);
    const color = TIER_COLOR[d.tier] ?? '#888';
    return `
      <div class="ach-row ${isUnlocked ? 'unlocked' : 'locked'}${isNew ? ' new-unlock' : ''}">
        <div class="ach-row-ic${isUnlocked ? '' : ' ach-row-ic--locked'}"
             style="${isUnlocked ? `color:${color}` : ''}">
          ${isUnlocked ? '🏅' : '🔒'}
        </div>
        <div class="ach-row-body">
          <div class="ach-row-name">${escapeHtml(d.name)}</div>
          <div class="ach-row-desc">${escapeHtml(d.description)}</div>
        </div>
        <div class="ach-row-right">
          ${isUnlocked
            ? `<span class="ach-row-check">${SVG_CHECK}</span>`
            : `<span class="ach-row-lock">${SVG_LOCK}</span>`}
          ${d.reward_coin ? `<span class="ach-row-pts">${SVG_COIN}${d.reward_coin}</span>` : ''}
        </div>
      </div>
    `;
  }

  function renderBody() {
    if (loading) {
      bodyEl.innerHTML = `<div class="ach-loading">Loading…</div>`;
      return;
    }

    const filtered = activeGroup === 'all'
      ? defs
      : defs.filter((d) => d.category === activeGroup);

    if (!filtered.length) {
      bodyEl.innerHTML = `<div class="ach-empty">No achievements here yet.</div>`;
      return;
    }

    // Group by category
    const groups: Record<string, AchievementDef[]> = {};
    for (const d of filtered) {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    }

    bodyEl.innerHTML = Object.entries(groups).map(([group, items]) => {
      const meta = BADGE_GROUP_META[group] ?? { label: group, emoji: '📌' };
      const doneInGroup = items.filter((d) => unlocked.has(d.id)).length;
      const allDone = doneInGroup === items.length;

      const tiered = items.filter((d) => d.badge_level > 0)
                          .sort((a, b) => {
                            const mA = a.badge_mission ?? 1;
                            const mB = b.badge_mission ?? 1;
                            if (mA !== mB) return mA - mB;
                            return a.badge_level - b.badge_level;
                          });
      const oneoff = items.filter((d) => d.badge_level === 0);

      // Group tiered items by badge_mission
      const missionMap: Record<number, AchievementDef[]> = {};
      for (const d of tiered) {
        const m = d.badge_mission ?? 1;
        if (!missionMap[m]) missionMap[m] = [];
        missionMap[m].push(d);
      }
      const missions = Object.entries(missionMap).sort(([a], [b]) => Number(a) - Number(b));
      const isMultiMission = missions.length > 1;

      const tieredHtml = missions.map(([, mItems]) => {
        const label = isMultiMission ? (mItems[0].mission_name ?? null) : null;
        return renderTieredBadge(mItems, label);
      }).join('');

      const flatHtml = oneoff.map((d) => renderFlatCard(d)).join('');

      return `
        <div class="ach-group-head">
          <span class="ach-group-label">${meta.emoji} ${meta.label}</span>
          <span class="ach-group-count${allDone ? ' done' : ''}">${doneInGroup} / ${items.length}</span>
        </div>
        <div class="ach-list">${tieredHtml}${flatHtml}</div>
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
      const P0 = Promise.resolve({ count: 0 } as any);

      const [
        defList, userList,
        history, daily, perfect, inventory, quests,
        practice, easyGames, hardGames, expertGames,
        dailyEasy, dailyHard, dailyPerfect, dailyNoHint,
        streakStats, distinctDaysRes,
      ] = await Promise.all([
        api.getAchievementDefinitions(),
        api.getUserAchievements().catch(() => []),
        userId ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId) : P0,
        userId ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('mode', 'daily') : P0,
        userId ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('mistakes', 0) : P0,
        api.getInventory().catch(() => []),
        userId ? supabase.from('user_daily_quests').select('id', { count: 'exact', head: true }).eq('user_id', userId).not('claimed_at', 'is', null) : P0,
        // Play missions
        userId ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('mode', 'practice') : P0,
        userId ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('level', 'easy') : P0,
        userId ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).in('level', ['hard', 'hard-expert']) : P0,
        userId ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('level', 'expert') : P0,
        // Daily missions
        userId ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('mode', 'daily').eq('level', 'easy') : P0,
        userId ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('mode', 'daily').in('level', ['hard', 'hard-expert']) : P0,
        userId ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('mode', 'daily').eq('mistakes', 0) : P0,
        userId ? supabase.from('user_game_history').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('mode', 'daily').eq('hints_used', 0) : P0,
        // Streak/Flawless stats via RPC
        userId ? supabase.rpc('get_game_streak_stats', { p_user_id: userId }).single() : Promise.resolve({ data: null }),
        userId ? supabase.from('user_game_history').select('completed_at').eq('user_id', userId) : Promise.resolve({ data: [] }),
      ]);

      defs = (defList ?? []) as AchievementDef[];
      const userAchs = (userList ?? []) as UserAchievement[];
      unlocked = new Set(userAchs.map((u) => u.achievement_id));
      const oneDayAgo = Date.now() - 86400_000;
      newlyUnlocked = new Set(
        userAchs
          .filter((u) => new Date(u.unlocked_at).getTime() > oneDayAgo)
          .map((u) => u.achievement_id),
      );
      const ownedIds = ((inventory ?? []) as any[]).map((r) => r.item_id as string);
      const statsData = (streakStats as any)?.data ?? {};
      const distinctDays = new Set(
        ((distinctDaysRes as any)?.data ?? []).map((r: any) => r.completed_at?.slice(0, 10))
      ).size;
      progressInputs = {
        gameCount:        (history as any)?.count      ?? 0,
        dailyCount:       (daily as any)?.count        ?? 0,
        perfectCount:     (perfect as any)?.count      ?? 0,
        currentStreak:    state.currentStreak,
        longestStreak:    state.longestStreak,
        distinctDays,
        level:            state.level,
        coins:            state.coins,
        themesOwned:      ownedIds.filter((id) => id.startsWith('theme_')).length,
        questCount:       (quests as any)?.count       ?? 0,
        inventoryCount:   ownedIds.length,
        practiceCount:    (practice as any)?.count     ?? 0,
        easyCount:        (easyGames as any)?.count    ?? 0,
        hardCount:        (hardGames as any)?.count    ?? 0,
        expertCount:      (expertGames as any)?.count  ?? 0,
        dailyEasyCount:   (dailyEasy as any)?.count    ?? 0,
        dailyHardCount:   (dailyHard as any)?.count    ?? 0,
        dailyPerfectCount:(dailyPerfect as any)?.count ?? 0,
        dailyNoHintCount: (dailyNoHint as any)?.count  ?? 0,
        maxPerfectRun:    statsData.max_perfect_run    ?? 0,
        maxPureRun:       statsData.max_pure_run       ?? 0,
        perfectPractice:  statsData.perfect_practice   ?? 0,
        perfectEasy:      statsData.perfect_easy       ?? 0,
        perfectHard:      statsData.perfect_hard       ?? 0,
        perfectExpert:    statsData.perfect_expert     ?? 0,
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
