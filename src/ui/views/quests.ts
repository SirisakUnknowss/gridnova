// =====================================================================
// Quest renderers — drop-in for the #quest-list / #weekly-quest-list
// elements on home. Daily and Weekly share the same generic engine
// (trigger_type/progress/target/claimed_at), so one internal renderer
// backs both public functions.
// =====================================================================
import * as api from '@lib/api';
import { useStore } from '@state/store';
import { todayUtc, weekStartUtc, escapeHtml } from '@lib/format';
import { sfxQuestClaim, sfxNav } from '@lib/sound';
import { ic } from '@ui/icons';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';

interface Quest {
  quest_id: string;
  tier: number;
  target: number;
  progress: number;
  reward_coin: number;
  reward_xp: number;
  trigger_type: string | null;
  description: string | null;
  completed_at: string | null;
  claimed_at: string | null;
}

// Icon is chosen by what the quest measures (trigger_type), so any quest_id in
// the catalog renders correctly without a per-id lookup.
const TRIGGER_ICON: Record<string, () => string> = {
  play_daily:       () => ic.daily(16),
  play_any:         () => ic.gamepad(16),
  play_practice:    () => ic.gamepad(16),
  play_level:       () => ic.gamepad(16),
  win_no_hint:      () => ic.brain(16),
  win_no_mistake:   () => ic.target(16),
  win_fast:         () => ic.zap(16),
  leaderboard_rank: () => ic.trophy(16),
  login:            () => ic.star(16),
};

function questTitle(q: Quest): string {
  return q.description || q.quest_id.replace(/_/g, ' ');
}

function questIcon(q: Quest): string {
  return (q.trigger_type && TRIGGER_ICON[q.trigger_type]?.()) || ic.star(16);
}

export interface RenderQuestsOptions {
  /** called with a toast message after claim/refresh */
  onToast?: (msg: string) => void;
}

interface QuestKindConfig {
  emptyMessage: string;
  fetchQuests: () => Promise<Quest[]>;
  claimQuest: (questId: string) => Promise<{ error?: unknown }>;
}

async function renderQuests(container: HTMLElement, opts: RenderQuestsOptions, cfg: QuestKindConfig): Promise<void> {
  if (!useStore.getState().user) {
    container.innerHTML = `<p style="opacity:0.7;font-size:13px;">Sign in to see quests.</p>`;
    return;
  }

  container.innerHTML = `<p style="opacity:0.7;font-size:13px;">Loading quests…</p>`;

  let quests: Quest[];
  try {
    quests = await cfg.fetchQuests();
  } catch (err) {
    container.innerHTML = `<p style="opacity:0.7;font-size:13px;">${ic.warning(13)} Could not load quests.</p>`;
    console.warn('Quest load failed:', err);
    return;
  }

  if (!quests.length) {
    container.innerHTML = `<p style="opacity:0.7;font-size:13px;">${cfg.emptyMessage}</p>`;
    return;
  }

  container.innerHTML = quests.map((q) => {
    const pct = Math.min(100, Math.round((q.progress / Math.max(1, q.target)) * 100));
    const done = !!q.completed_at;
    const claimed = !!q.claimed_at;
    const state = claimed ? 'claimed' : done ? 'claimable' : 'progress';
    return `
      <div class="quest-row quest-${state}" data-quest="${escapeHtml(q.quest_id)}">
        <div class="quest-icon">${questIcon(q)}</div>
        <div class="quest-body">
          <div class="quest-title">${escapeHtml(questTitle(q))}</div>
          <div class="quest-bar">
            <div class="quest-bar-fill" style="width:${pct}%"></div>
          </div>
          <div class="quest-meta">
            <span>${q.progress}/${q.target}</span>
            <span>${ic.coin(12)} ${q.reward_coin}${q.reward_xp ? ` · ${ic.star(12)} ${q.reward_xp}` : ''}</span>
          </div>
        </div>
        <div class="quest-action">
          ${claimed
            ? `<span class="quest-tag">✓ Claimed</span>`
            : done
              ? `<button class="btn btn--small" data-claim="${escapeHtml(q.quest_id)}">Claim</button>`
              : `<span class="quest-tag muted">${pct}%</span>`}
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll<HTMLButtonElement>('[data-claim]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const questId = btn.dataset.claim!;
      btn.disabled = true;
      btn.textContent = '…';
      try {
        const { error } = await cfg.claimQuest(questId);
        if (error) throw error;
        sfxQuestClaim();
        opts.onToast?.('Quest reward claimed!');
        // Optimistically refresh
        await renderQuests(container, opts, cfg);
      } catch (err) {
        console.warn('Claim failed:', err);
        opts.onToast?.('Could not claim — try again');
        btn.disabled = false;
        btn.textContent = 'Claim';
      }
    });
  });
}

export async function renderDailyQuests(container: HTMLElement, opts: RenderQuestsOptions = {}): Promise<void> {
  return renderQuests(container, opts, {
    emptyMessage: 'No quests yet — play today\'s daily to unlock them.',
    fetchQuests: () => api.getDailyQuests(todayUtc()) as Promise<Quest[]>,
    claimQuest: (questId) => api.claimQuestReward(todayUtc(), questId),
  });
}

export async function renderWeeklyQuests(container: HTMLElement, opts: RenderQuestsOptions = {}): Promise<void> {
  return renderQuests(container, opts, {
    emptyMessage: 'No weekly quests yet — play a game to unlock them.',
    fetchQuests: () => api.getWeeklyQuests(weekStartUtc()) as Promise<Quest[]>,
    claimQuest: (questId) => api.claimWeeklyQuestReward(weekStartUtc(), questId),
  });
}

// =====================================================================
// Home-row summary — "3/8 done today · 2 to claim" style progress, so
// the Quests row on home hints at what's waiting without opening it.
// =====================================================================
export interface QuestsSummary {
  total: number;
  completed: number;
  claimable: number;
}

function summarize(quests: Quest[]): QuestsSummary {
  return {
    total: quests.length,
    completed: quests.filter((q) => q.completed_at).length,
    claimable: quests.filter((q) => q.completed_at && !q.claimed_at).length,
  };
}

export async function getQuestsSummary(): Promise<QuestsSummary | null> {
  if (!useStore.getState().user) return null;
  try {
    const [daily, weekly] = await Promise.all([
      api.getDailyQuests(todayUtc()) as Promise<Quest[]>,
      api.getWeeklyQuests(weekStartUtc()) as Promise<Quest[]>,
    ]);
    const d = summarize(daily);
    const w = summarize(weekly);
    return { total: d.total + w.total, completed: d.completed + w.completed, claimable: d.claimable + w.claimable };
  } catch {
    return null;
  }
}

// =====================================================================
// Full Quests page — Daily / Weekly as swipeable-feel left/right tabs,
// replacing the two stacked cards that used to live on home.
// =====================================================================
export interface QuestsPageProps {
  onBack: () => void;
  nav: BottomNavCallbacks;
  onToast?: (msg: string) => void;
}

type QuestTab = 'daily' | 'weekly';

export function mountQuestsView(root: HTMLElement, props: QuestsPageProps): { unmount: () => void } {
  root.innerHTML = `
    <section class="view view--ach">
      <div class="ach-sticky">
        <div class="ach-topbar">
          <button class="ach-back" id="q-back" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 class="ach-title">${ic.quests(20)} Quests</h1>
          <div style="width:40px;flex:none"></div>
        </div>
        <div class="lb-tabs lb-tabs--main">
          <button class="lb-tab active" data-tab="daily">Daily</button>
          <button class="lb-tab" data-tab="weekly">Weekly</button>
        </div>
      </div>
      <div id="q-body" style="width:99%"></div>
    </section>
    ${bottomNavHTML('home')}
  `;

  root.querySelector('#q-back')?.addEventListener('click', props.onBack);
  wireBottomNav(root, props.nav, 'home');

  const bodyEl = root.querySelector<HTMLElement>('#q-body')!;
  const tabBtns = root.querySelectorAll<HTMLButtonElement>('[data-tab]');

  function loadTab(tab: QuestTab) {
    bodyEl.innerHTML = `<div class="ach-loading">Loading…</div>`;
    const opts = { onToast: props.onToast };
    if (tab === 'daily') void renderDailyQuests(bodyEl, opts);
    else void renderWeeklyQuests(bodyEl, opts);
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab as QuestTab;
      if (btn.classList.contains('active')) return;
      sfxNav();
      tabBtns.forEach((b) => b.classList.toggle('active', b === btn));
      loadTab(tab);
    });
  });

  loadTab('daily');

  return { unmount() { } };
}
