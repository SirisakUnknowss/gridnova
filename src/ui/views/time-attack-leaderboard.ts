// =====================================================================
// Time Attack leaderboard — one board per tier, best run per player
// =====================================================================
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { formatTime, escapeHtml } from '@lib/format';
import { TIME_ATTACK_TIERS, type TimeAttackTier } from '@engine/scoring';
import * as api from '@lib/api';
import { useStore } from '@state/store';
import img1st from '@images/1st-prize.png';
import img2nd from '@images/2nd-place.png';
import img3rd from '@images/3rd-place.png';
import imgTrophy from '@images/trophy-2.png';

export interface TimeAttackLeaderboardProps {
  onBack: () => void;
  initialTier: TimeAttackTier;
  nav: BottomNavCallbacks;
}

const TIER_LABEL: Record<TimeAttackTier, string> = {
  sprint: 'Sprint',
  rush: 'Rush',
  marathon: 'Marathon',
};

function rankBadgeHtml(rank: number): string {
  if (rank === 1) return `<img src="${img1st}" class="lb-rank-img" alt="1st">`;
  if (rank === 2) return `<img src="${img2nd}" class="lb-rank-img" alt="2nd">`;
  if (rank === 3) return `<img src="${img3rd}" class="lb-rank-img" alt="3rd">`;
  return `<span class="lb-rank-other-wrap"><img src="${imgTrophy}" class="lb-rank-img lb-rank-img--sm" alt="">${rank}</span>`;
}

export function mountTimeAttackLeaderboardView(
  root: HTMLElement,
  props: TimeAttackLeaderboardProps,
): { unmount: () => void } {
  let tier: TimeAttackTier = props.initialTier;
  let rows: api.TimeAttackRow[] = [];
  let loading = true;
  let errorMsg: string | null = null;

  const myId = useStore.getState().user?.id ?? null;
  const tiers = Object.keys(TIME_ATTACK_TIERS) as TimeAttackTier[];

  root.innerHTML = `
    <section class="view">
      <div class="top-bar">
        <button class="icon-btn" id="tal-back" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 style="margin:0;font-size:16px;color:var(--app-text);">
          ${ic.timeAttack(13)} Time Attack
        </h2>
        <span style="width:38px;"></span>
      </div>

      <div class="ta-tiers ta-tiers--lb" id="tal-tiers">
        ${tiers.map((t) => `
          <button class="ta-tier${t === tier ? ' active' : ''}" data-tier="${t}">
            <span class="ta-tier-name">${TIER_LABEL[t]}</span>
            <span class="ta-tier-time">${Math.round(TIME_ATTACK_TIERS[t].seconds / 60)} min</span>
          </button>
        `).join('')}
      </div>

      <div class="lb-meta" id="tal-meta"></div>
      <div class="lb-list" id="tal-list"></div>
    </section>
    ${bottomNavHTML('home')}
  `;
  wireBottomNav(root, props.nav, 'home');

  const listEl = root.querySelector<HTMLElement>('#tal-list')!;
  const metaEl = root.querySelector<HTMLElement>('#tal-meta')!;

  function render() {
    const meta = TIME_ATTACK_TIERS[tier];
    metaEl.textContent = `${TIER_LABEL[tier]} · ${meta.difficulty.replace('-', ' ')} · best run per player`;

    if (loading) {
      listEl.innerHTML = `<div class="lb-skeleton">${
        Array.from({ length: 6 }).map(() => `<div class="lb-skeleton-row"></div>`).join('')
      }</div>`;
      return;
    }
    if (errorMsg) {
      listEl.innerHTML = `
        <div class="lb-empty">
          <p>${ic.warning(16)} ${escapeHtml(errorMsg)}</p>
          <button class="btn btn--small" id="tal-retry">Retry</button>
        </div>`;
      listEl.querySelector('#tal-retry')?.addEventListener('click', () => void load());
      return;
    }
    if (rows.length === 0) {
      listEl.innerHTML = `
        <div class="lb-empty">
          <p>${ic.empty(20)} No runs yet for ${TIER_LABEL[tier]}.</p>
          <p style="opacity:0.75;font-size:13px;">Be the first to beat the clock.</p>
        </div>`;
      return;
    }

    listEl.innerHTML = rows.map((r) => {
      const isMe = r.user_id === myId;
      const name = escapeHtml(r.display_name || r.username || 'Player');
      return `
        <div class="lb-row lb-row--guest${isMe ? ' is-me' : ''}">
          <span class="lb-rank">${rankBadgeHtml(r.rank)}</span>
          <span class="lb-name">${name}${isMe ? ' <span class="lb-you">you</span>' : ''}</span>
          <span class="lb-score">
            <strong>${r.score.toLocaleString()}</strong>
            <small>${formatTime(r.seconds_left)} left</small>
          </span>
        </div>`;
    }).join('');
  }

  async function load() {
    loading = true;
    errorMsg = null;
    render();
    try {
      rows = await api.getTimeAttackLeaderboard(tier, 50);
      loading = false;
    } catch (err) {
      loading = false;
      errorMsg = (err as Error).message || 'Could not load the leaderboard.';
    }
    render();
  }

  root.querySelectorAll<HTMLButtonElement>('[data-tier]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.tier as TimeAttackTier;
      if (next === tier) return;
      tier = next;
      root.querySelectorAll<HTMLButtonElement>('[data-tier]').forEach((b) =>
        b.classList.toggle('active', b.dataset.tier === tier)
      );
      void load();
    });
  });

  root.querySelector('#tal-back')?.addEventListener('click', props.onBack);

  void load();

  return { unmount() { } };
}
