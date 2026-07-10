// =====================================================================
// Random Mode detail — current streak, empty state, Play Random
// =====================================================================
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { getRandomModeStats } from '@lib/api';

export interface RandomModeDetailProps {
  onBack: () => void;
  onPlayRandom: () => void;
  onLeaderboard: () => void;
  nav: BottomNavCallbacks;
}

export function mountRandomModeDetailView(root: HTMLElement, props: RandomModeDetailProps): { unmount: () => void } {
  root.innerHTML = `
    <section class="view view--play-mode">
      <div class="ach-sticky">
        <div class="ach-topbar">
          <button class="ach-back" id="rm-back" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 class="ach-title">${ic.dice(20)} Random Mode</h1>
          <div style="width:40px;flex:none"></div>
        </div>
      </div>

      <div id="rm-body" class="pm-detail-body"><div class="ach-loading">Loading…</div></div>
    </section>
    ${bottomNavHTML('home')}
  `;

  root.querySelector('#rm-back')?.addEventListener('click', props.onBack);
  wireBottomNav(root, props.nav, 'home');

  const body = root.querySelector<HTMLElement>('#rm-body')!;

  function renderEmptyState() {
    body.innerHTML = `
      <div class="rm-empty-icon">0</div>
      <div class="rm-empty-title">Start your streak</div>
      <div class="rm-empty-sub">You haven't played this mode yet — win your first game to start a streak.</div>

      <div class="pm-tip-row">
        <span class="pm-tip-icon">${ic.target(18)}</span>
        <span>Random difficulty picked for you automatically — just tap and play.</span>
      </div>
      <div class="pm-tip-row">
        <span class="pm-tip-icon">${ic.warning(18)}</span>
        <span>Lose 1 game = streak resets to 0. Consistency matters more than raw count.</span>
      </div>
      <div class="pm-tip-row">
        <span class="pm-tip-icon">${ic.gift(18)}</span>
        <span>Bonus coins every 5-win streak — the longer you go, the more you earn.</span>
      </div>

      <button class="btn pm-detail-btn-primary pm-random-cta" id="rm-play">${ic.play(16)} Play Random</button>
    `;
    root.querySelector('#rm-play')?.addEventListener('click', props.onPlayRandom);
  }

  function renderStreakState(current: number, longest: number) {
    body.innerHTML = `
      <div class="rm-streak-card">
        <div class="rm-streak-left">
          <span class="rm-streak-icon">${ic.streak(22)}</span>
          <div>
            <div class="rm-streak-num">${current}</div>
            <div class="rm-streak-label">Current streak</div>
          </div>
        </div>
        <div class="rm-streak-best">
          <div class="rm-streak-best-num">${longest}</div>
          <div class="rm-streak-label">Best</div>
        </div>
      </div>

      <div class="pm-tip-row pm-tip-row--warning">
        <span class="pm-tip-icon">${ic.warning(16)}</span>
        <span>Lose 1 game = streak resets to 0 immediately.</span>
      </div>

      <div class="pm-detail-actions">
        <button class="btn btn--secondary pm-detail-btn-secondary" id="rm-leaderboard">${ic.trophy(15)} View Leaderboard</button>
        <button class="btn pm-detail-btn-primary pm-random-cta" id="rm-play">${ic.play(16)} Play Random</button>
      </div>
    `;
    root.querySelector('#rm-play')?.addEventListener('click', props.onPlayRandom);
    root.querySelector('#rm-leaderboard')?.addEventListener('click', props.onLeaderboard);
  }

  void getRandomModeStats().then((stats) => {
    if (!stats || stats.total_played === 0) {
      renderEmptyState();
    } else {
      renderStreakState(stats.current_win_streak, stats.longest_win_streak);
    }
  }).catch(() => renderEmptyState());

  return { unmount() {} };
}
