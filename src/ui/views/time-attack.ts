// =====================================================================
// Time Attack detail — pick a tier, see your best, start the run
// =====================================================================
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { formatTime } from '@lib/format';
import { TIME_ATTACK_TIERS, type TimeAttackTier } from '@engine/scoring';
import { getMyTimeAttackBest } from '@lib/api';
import { useStore } from '@state/store';

export interface TimeAttackViewProps {
  onBack: () => void;
  onStart: (tier: TimeAttackTier) => void;
  onLeaderboard: (tier: TimeAttackTier) => void;
  onRequireLogin: () => void;
  nav: BottomNavCallbacks;
}

const TIER_LABEL: Record<TimeAttackTier, string> = {
  sprint: 'Sprint',
  rush: 'Rush',
  marathon: 'Marathon',
};

function minutesLabel(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

export function mountTimeAttackView(root: HTMLElement, props: TimeAttackViewProps): { unmount: () => void } {
  let tier: TimeAttackTier = 'rush';
  const tiers = Object.keys(TIME_ATTACK_TIERS) as TimeAttackTier[];

  root.innerHTML = `
    <section class="view view--play-mode">
      <div class="ach-sticky">
        <div class="ach-topbar">
          <button class="ach-back" id="ta-back" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 class="ach-title">${ic.timeAttack(20)} Time Attack</h1>
          <div style="width:40px;flex:none"></div>
        </div>
      </div>

      <div class="ta-hero">
        <span class="ta-hero-icon">${ic.timeAttack(26)}</span>
        <div class="ta-hero-body">
          <span class="ta-hero-title">Beat the clock</span>
          <span class="ta-hero-sub">Pick a tier and go — the difficulty is set by the tier.</span>
        </div>
      </div>

      <div class="ta-tiers" id="ta-tiers">
        ${tiers.map((t) => `
          <button class="ta-tier${t === tier ? ' active' : ''}" data-tier="${t}">
            <span class="ta-tier-name">${TIER_LABEL[t]}</span>
            <span class="ta-tier-time">${minutesLabel(TIME_ATTACK_TIERS[t].seconds)}</span>
          </button>
        `).join('')}
      </div>

      <div class="ta-stats">
        <div class="ta-stat">
          <span class="ta-stat-value" id="ta-difficulty">—</span>
          <span class="ta-stat-label">Difficulty</span>
        </div>
        <div class="ta-stat">
          <span class="ta-stat-value" id="ta-best">—</span>
          <span class="ta-stat-label" id="ta-best-label">Your best</span>
        </div>
      </div>

      <div class="ta-actions">
        <button class="btn btn--secondary" id="ta-leaderboard">View Leaderboard</button>
        <button class="btn btn--primary" id="ta-start">Start ${TIER_LABEL[tier]}</button>
      </div>

      <p class="ta-note">Run out of time and the round ends with no score — the clock keeps running even if you leave the app.</p>
    </section>
    ${bottomNavHTML('home')}
  `;
  wireBottomNav(root, props.nav, 'home');

  const diffEl = root.querySelector<HTMLElement>('#ta-difficulty')!;
  const bestEl = root.querySelector<HTMLElement>('#ta-best')!;
  const bestLabelEl = root.querySelector<HTMLElement>('#ta-best-label')!;
  const startBtn = root.querySelector<HTMLButtonElement>('#ta-start')!;

  function renderTier() {
    const meta = TIME_ATTACK_TIERS[tier];
    diffEl.textContent = meta.difficulty.replace('-', ' ');
    startBtn.textContent = `Start ${TIER_LABEL[tier]}`;
    root.querySelectorAll<HTMLButtonElement>('[data-tier]').forEach((b) =>
      b.classList.toggle('active', b.dataset.tier === tier)
    );

    bestEl.textContent = '—';
    bestLabelEl.textContent = `Your best (${TIER_LABEL[tier]})`;
    if (!useStore.getState().user) { bestEl.textContent = 'Sign in'; return; }
    const forTier = tier;
    void getMyTimeAttackBest(forTier).then((best) => {
      if (forTier !== tier) return; // tier changed while the request was in flight
      bestEl.textContent = best ? best.score.toLocaleString() : 'No run yet';
    }).catch(() => { /* leave the dash */ });
  }

  root.querySelectorAll<HTMLButtonElement>('[data-tier]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.tier as TimeAttackTier;
      if (next === tier) return;
      tier = next;
      renderTier();
    });
  });

  root.querySelector('#ta-back')?.addEventListener('click', props.onBack);
  root.querySelector('#ta-leaderboard')?.addEventListener('click', () => props.onLeaderboard(tier));
  startBtn.addEventListener('click', () => {
    // The run is validated server-side against a ticket tied to an account, so
    // there is nothing a guest run could be scored against.
    if (!useStore.getState().user) { props.onRequireLogin(); return; }
    props.onStart(tier);
  });

  renderTier();

  return { unmount() { } };
}

export { TIER_LABEL, minutesLabel, formatTime };
