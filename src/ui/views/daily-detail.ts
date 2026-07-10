// =====================================================================
// Daily Puzzle detail — info, rank today, Play/Continue, view leaderboard
// =====================================================================
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { todayUtc } from '@lib/format';
import { difficultyForDayOfWeek } from '@engine/generator';
import { getMyDailyRank } from '@lib/api';
import { listGames, type GameInProgress } from '@lib/local-db';

export interface DailyDetailProps {
  onBack: () => void;
  onPlayDaily: () => void;
  onContinueDaily: (saved: GameInProgress) => void;
  onLeaderboard: () => void;
  nav: BottomNavCallbacks;
}

function msUntilNextUtcMidnight(): number {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
  return next - now.getTime();
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function mountDailyDetailView(root: HTMLElement, props: DailyDetailProps): { unmount: () => void } {
  const today = todayUtc();
  const dow = new Date(today + 'T00:00:00Z').getUTCDay();
  const todayDifficulty = difficultyForDayOfWeek(dow);
  let savedGame: GameInProgress | null = null;

  root.innerHTML = `
    <section class="view view--play-mode">
      <div class="ach-sticky">
        <div class="ach-topbar">
          <button class="ach-back" id="dd-back" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 class="ach-title">${ic.daily(20)} Daily Puzzle</h1>
          <div style="width:40px;flex:none"></div>
        </div>
      </div>

      <div class="pm-detail-head">
        <span class="pm-detail-icon">${ic.daily(24)}</span>
        <div>
          <div class="pm-detail-title" id="dd-date">${today}</div>
          <div class="pm-detail-sub">Today's difficulty: ${todayDifficulty}</div>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-tile">
          <div class="stat-label">Resets in (UTC)</div>
          <div class="stat-value" id="dd-countdown">--:--:--</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Your rank today</div>
          <div class="stat-value" id="dd-rank">—</div>
        </div>
      </div>

      <div class="pm-detail-actions">
        <button class="btn btn--secondary pm-detail-btn-secondary" id="dd-leaderboard">${ic.trophy(15)} View Leaderboard</button>
        <button class="btn pm-detail-btn-primary" id="dd-play">${ic.play(16)} Play</button>
      </div>
    </section>
    ${bottomNavHTML('home')}
  `;

  root.querySelector('#dd-back')?.addEventListener('click', props.onBack);
  root.querySelector('#dd-leaderboard')?.addEventListener('click', props.onLeaderboard);

  const playBtn = root.querySelector<HTMLButtonElement>('#dd-play')!;
  playBtn.addEventListener('click', () => {
    if (savedGame) props.onContinueDaily(savedGame);
    else props.onPlayDaily();
  });

  wireBottomNav(root, props.nav, 'home');

  // Countdown
  const countdownEl = root.querySelector<HTMLElement>('#dd-countdown')!;
  const tick = () => { countdownEl.textContent = formatCountdown(msUntilNextUtcMidnight()); };
  tick();
  const countdownHandle = window.setInterval(tick, 1000);

  // Rank today (best-effort)
  void getMyDailyRank(today).then((rank) => {
    const rankEl = root.querySelector('#dd-rank');
    if (rankEl && rank) rankEl.textContent = `#${rank.rank} / ${rank.total_players}`;
  }).catch(() => {});

  // Check for a resumable daily save
  void listGames().then((games) => {
    const saved = games.find((g) => g.mode === 'daily' && g.date === today);
    if (saved) {
      savedGame = saved;
      playBtn.innerHTML = `${ic.play(16)} Continue`;
    }
  });

  return { unmount() { window.clearInterval(countdownHandle); } };
}
