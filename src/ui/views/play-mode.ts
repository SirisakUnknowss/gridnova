// =====================================================================
// Play Mode Hub — Daily Puzzle (live) + Time Attack / Random Mode (soon)
// =====================================================================
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { todayUtc } from '@lib/format';
import { difficultyForDayOfWeek } from '@engine/generator';

export interface PlayModeViewProps {
  onBack: () => void;
  onPlayDaily: () => void;
  onLeaderboard: () => void;
  nav: BottomNavCallbacks;
}

export function mountPlayModeView(root: HTMLElement, props: PlayModeViewProps): { unmount: () => void } {
  const today = todayUtc();
  const dow = new Date(today + 'T00:00:00Z').getUTCDay();
  const todayDifficulty = difficultyForDayOfWeek(dow);

  root.innerHTML = `
    <section class="view view--play-mode">
      <div class="ach-sticky">
        <div class="ach-topbar">
          <button class="ach-back" id="pm-back" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 class="ach-title">${ic.gamepad(20)} Play Mode</h1>
          <div style="width:40px;flex:none"></div>
        </div>
      </div>

      <div class="pm-list">
        <div class="pm-row" id="pm-daily">
          <span class="pm-row-icon pm-row-icon--daily">${ic.daily(22)}</span>
          <div class="pm-row-body">
            <span class="pm-row-title">Daily Puzzle</span>
            <span class="pm-row-sub">Today's difficulty: ${todayDifficulty} — 1 attempt/day</span>
          </div>
          <button class="pm-row-ranks" id="pm-daily-ranks" aria-label="View leaderboard">${ic.trophy(16)}</button>
          <span class="pm-row-chevron">${ic.chevronRight(20)}</span>
        </div>

        <div class="pm-row pm-row--soon">
          <span class="pm-row-icon pm-row-icon--soon">${ic.clock(22)}</span>
          <div class="pm-row-body">
            <span class="pm-row-title">Time Attack</span>
            <span class="pm-row-sub">Race the clock — pick a tier</span>
          </div>
          <span class="pm-soon-badge">Soon</span>
        </div>

        <div class="pm-row pm-row--soon">
          <span class="pm-row-icon pm-row-icon--soon">${ic.dice(22)}</span>
          <div class="pm-row-body">
            <span class="pm-row-title">Random Mode</span>
            <span class="pm-row-sub">One tap — random difficulty</span>
          </div>
          <span class="pm-soon-badge">Soon</span>
        </div>
      </div>
    </section>
    ${bottomNavHTML('home')}
  `;

  root.querySelector('#pm-back')?.addEventListener('click', props.onBack);
  root.querySelector('#pm-daily')?.addEventListener('click', props.onPlayDaily);
  root.querySelector('#pm-daily-ranks')?.addEventListener('click', (e) => {
    e.stopPropagation();
    props.onLeaderboard();
  });
  wireBottomNav(root, props.nav, 'home');

  return { unmount() {} };
}
