// =====================================================================
// Daily Puzzle detail — info, rank today, Play/Continue, leaderboard inline
// =====================================================================
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { todayUtc, formatTime, escapeHtml } from '@lib/format';
import { difficultyForDayOfWeek } from '@engine/generator';
import * as api from '@lib/api';
import { useStore } from '@state/store';
import { listGames, deleteGame, type GameInProgress } from '@lib/local-db';

export interface DailyDetailProps {
  onBack: () => void;
  onPlayDaily: () => void;
  onContinueDaily: (saved: GameInProgress) => void;
  onLeaderboard: () => void;
  onOpenCalendar: () => void;
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
  const currentUserId = useStore.getState().user?.id ?? null;
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

      <button class="btn pm-detail-btn-primary" id="dd-play" style="width:100%">Play</button>
      <button class="btn btn--secondary" id="dd-calendar" style="width:100%">${ic.daily(15)} Daily Recap</button>

      <div class="dd-lb-head">
        <span class="dd-lb-title">${ic.trophy(15)} Leaderboard Today</span>
      </div>
      <div id="dd-lb-list"><div class="ach-loading">Loading…</div></div>
      <button class="dd-lb-more" id="dd-lb-more">See full leaderboard →</button>
    </section>
    ${bottomNavHTML('home')}
  `;

  root.querySelector('#dd-back')?.addEventListener('click', props.onBack);
  root.querySelector('#dd-lb-more')?.addEventListener('click', props.onLeaderboard);
  root.querySelector('#dd-calendar')?.addEventListener('click', props.onOpenCalendar);

  let alreadyCompleted = false;

  const playBtn = root.querySelector<HTMLButtonElement>('#dd-play')!;
  playBtn.addEventListener('click', () => {
    if (alreadyCompleted) return;
    if (savedGame) props.onContinueDaily(savedGame);
    else props.onPlayDaily();
  });

  wireBottomNav(root, props.nav, 'home');

  // Countdown
  const countdownEl = root.querySelector<HTMLElement>('#dd-countdown')!;
  const tick = () => { countdownEl.textContent = formatCountdown(msUntilNextUtcMidnight()); };
  tick();
  const countdownHandle = window.setInterval(tick, 1000);

  function markCompleted() {
    alreadyCompleted = true;
    playBtn.textContent = '✓ Completed today';
    playBtn.disabled = true;
    playBtn.classList.add('pm-detail-btn-primary--done');
  }

  // Daily Puzzle allows exactly one attempt per day — once a score is on
  // the board, disable Play entirely instead of letting the client start a
  // fresh attempt that would just fail (or worse, resubmit) server-side.
  void api.getMyDailyRank(today).then((rank) => {
    const rankEl = root.querySelector('#dd-rank');
    if (rankEl && rank) rankEl.textContent = `#${rank.rank} / ${rank.total_players}`;
    if (rank) markCompleted();
  }).catch(() => { });

  if (currentUserId === null) {
    // Guest — completion lives in guest_game_history, not daily_leaderboard.
    void api.getGuestLeaderboard(today).then((rows) => {
      const mySessionId = api.getSessionId();
      if (rows.some((r) => r.session_id === mySessionId)) markCompleted();
    }).catch(() => { });
  }

  // Embedded leaderboard (top 10 today)
  const lbList = root.querySelector<HTMLElement>('#dd-lb-list')!;
  void api.getLeaderboard(today, 10).then((rows) => {
    if (!rows || rows.length === 0) {
      lbList.innerHTML = `<div class="ach-empty">No scores yet — be the first!</div>`;
      return;
    }
    lbList.innerHTML = `<div class="pm-list">${rows.map((r: any) => {
      const isMe = r.user_id === currentUserId;
      const name = escapeHtml(r.display_name || r.username || 'Player');
      return `
        <div class="pm-row" style="cursor:default">
          <span class="pm-row-rank">#${r.rank}</span>
          <div class="pm-row-body">
            <span class="pm-row-title">${name}${isMe ? ' <span class="lb-you">you</span>' : ''}</span>
            <span class="pm-row-sub">${formatTime(r.time_seconds)}</span>
          </div>
          <span class="pm-streak-badge" style="color:var(--brand-primary);background:#ede9fe">${r.score.toLocaleString()}</span>
        </div>
      `;
    }).join('')}</div>`;
  }).catch(() => {
    lbList.innerHTML = `<div class="ach-empty">Could not load leaderboard.</div>`;
  });

  // Check for a resumable daily save — only counts as "in progress" if the
  // player actually made a move; a save with 0 moves is a phantom from
  // opening then leaving immediately, so treat that as fresh instead.
  void listGames().then(async (games) => {
    const saved = games.find((g) => g.mode === 'daily' && g.date === today);
    if (!saved) return;
    if (alreadyCompleted || !saved.moves || saved.moves.length === 0) {
      await deleteGame(saved.game_id);
      return;
    }
    savedGame = saved;
    playBtn.textContent = 'Continue';
  });

  return { unmount() { window.clearInterval(countdownHandle); } };
}
