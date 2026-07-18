// =====================================================================
// Quest renderers — drop-in for the #quest-list / #weekly-quest-list
// elements on home. Daily and Weekly share the same generic engine
// (trigger_type/progress/target/claimed_at), so one internal renderer
// backs both public functions.
// =====================================================================
import * as api from '@lib/api';
import { useStore } from '@state/store';
import { todayUtc, weekStartUtc, escapeHtml } from '@lib/format';
import { sfxQuestClaim } from '@lib/sound';
import { ic } from '@ui/icons';

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
