// =====================================================================
// Home view — main hub
// =====================================================================
import { useStore } from '@state/store';
import { formatNumber, todayUtc } from '@lib/format';
import { levelProgress } from '@lib/level';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { isMuted, toggleMute } from '@lib/sound';
import { useVisitorStore } from '@state/visitor-store';
import { getGuestDisplayId } from '@lib/api';
import * as api from '@lib/api';
import { difficultyForDayOfWeek } from '@engine/generator';
import { dailyNumber } from '@lib/share/text-result';
import { listGames, type GameInProgress } from '@lib/local-db';
import { ic } from '@ui/icons';
import { APP_VERSION } from '@lib/version';
import { heartsPillHTML, wireHeartsPill, refreshHearts } from '../components/hearts';

export interface HomeViewProps {
  onEnterPlayMode: () => void;
  onOpenPractice: () => void;
  onOpenQuests: () => void;
  onPlayDaily: () => void;
  onContinueDaily: (saved: GameInProgress) => void;
  onOpenDailyDetail: () => void;
  onAuthAction: () => void;
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

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function mountHomeView(root: HTMLElement, props: HomeViewProps): { unmount: () => void } {
  const state = useStore.getState();
  const visitorStats = useVisitorStore.getState();
  const isAnonymous = !!state.user?.is_anonymous;
  const isGuest = !state.user || isAnonymous;
  const displayName = state.profile?.display_name || state.profile?.username || (isGuest ? 'Guest' : 'Player');
  const equippedEmoji = (state.equipped.avatar?.emoji as string) ?? null;
  const avatarUrl = state.profile?.avatar_url ?? null;
  const userIcon = avatarUrl
    ? `<img src="${avatarUrl}" class="user-avatar-img" alt="avatar" referrerpolicy="no-referrer">`
    : equippedEmoji
      ? `<span style="font-size:20px">${equippedEmoji}</span>`
      : isGuest ? ic.guest(20) : ic.member(20);
  const lvl = levelProgress(state.level, state.xp);
  const muted = isMuted();
  const guestId = getGuestDisplayId();
  const today = todayUtc();
  const dailyNo = dailyNumber(today);
  const todayDifficulty = difficultyForDayOfWeek(new Date(today + 'T00:00:00Z').getUTCDay());

  root.innerHTML = `
    <section class="view view--home">

      <!-- Header -->
      <div class="home-header">
        <button class="home-user-btn" id="user-badge" type="button">
          <span class="home-avatar">${userIcon}</span>
          <div class="home-user-info">
            <span class="home-user-name">${displayName}</span>
            ${isGuest ? `<span class="home-user-id">${guestId}</span>` : ''}
          </div>
        </button>
        <div class="home-header-right">
          ${heartsPillHTML()}
          <span class="stat-pill">${ic.streak(13)} ${state.currentStreak}</span>
          <span class="stat-pill">${ic.coin(13)} ${formatNumber(state.coins)}</span>
          <button class="home-icon-btn" id="mute-btn" title="${muted ? 'Unmute' : 'Mute'}">
            ${muted ? ic.soundOff(16) : ic.soundOn(16)}
          </button>
        </div>
      </div>

      <!-- Level / XP -->
      <div class="home-xp">
        <div class="home-xp-label">
          <span>Level ${lvl.level}</span>
          <span>${lvl.xpIntoLevel} / ${lvl.xpIntoLevel + lvl.xpForNext} XP</span>
        </div>
        <div class="xp-bar-track">
          <div class="xp-bar-fill" style="width:${Math.round(lvl.fraction * 100)}%"></div>
        </div>
      </div>

      <!-- Guest save banner -->
      ${isGuest ? `
        <div class="home-save-banner" id="save-banner">
          <span>Playing as a guest — save so you don't lose progress.</span>
          <button class="btn btn--primary btn--small" id="save-progress">Save progress</button>
        </div>
      ` : ''}

      <!-- Daily Puzzle — the hero. Same puzzle for everyone, ranked. -->
      <div class="playmode-card-v2 daily-hero">
        <div class="daily-hero-top">
          <span class="playmode-card-v2-icon">${ic.daily(24)}</span>
          <span class="daily-hero-diff">${todayDifficulty}</span>
        </div>
        <div class="playmode-card-v2-title">Daily Puzzle${dailyNo > 0 ? ` #${dailyNo}` : ''}</div>
        <div class="playmode-card-v2-sub">Everyone plays the same puzzle today</div>

        <div class="daily-hero-stats">
          <div class="daily-hero-stat">
            <div class="daily-hero-stat-label">Your rank today</div>
            <div class="daily-hero-stat-value" id="home-daily-rank">—</div>
          </div>
          <div class="daily-hero-stat">
            <div class="daily-hero-stat-label">Resets in</div>
            <div class="daily-hero-stat-value" id="home-daily-countdown">--:--:--</div>
          </div>
        </div>

        <button class="btn playmode-card-v2-btn" id="home-daily-play">Play</button>
        <button class="daily-hero-link" id="home-daily-more">${ic.trophy(13)} Leaderboard &amp; recap</button>
      </div>

      <!-- Other modes -->
      <button class="pm-row" id="enter-play-mode">
        <span class="pm-row-icon">${ic.gamepad(22)}</span>
        <div class="pm-row-body">
          <span class="pm-row-title">Play Mode</span>
          <span class="pm-row-sub">Random Mode, Time Attack &amp; more</span>
        </div>
        <span class="pm-row-chevron">${ic.chevronRight(20)}</span>
      </button>

      <!-- Practice entry -->
      <button class="pm-row" id="open-practice">
        <span class="pm-row-icon">${ic.practice(22)}</span>
        <div class="pm-row-body">
          <span class="pm-row-title">Practice</span>
          <span class="pm-row-sub">Choose your own difficulty</span>
        </div>
        <span class="pm-row-chevron">${ic.chevronRight(20)}</span>
      </button>

      <!-- Community -->
      <div class="card live-stats-card">
        <div class="live-stats-header">
          <span class="live-dot-wrap"><span class="live-dot"></span>LIVE</span>
          <span class="live-stats-title">Community</span>
        </div>
        <div class="live-stats-grid">
          <div class="ls-block ls-block--online">
            <div class="ls-value" style="color:#10b981"><span id="vs-online">${visitorStats.loaded ? fmtCount(visitorStats.online) : '—'}</span></div>
            <div class="ls-label">online now</div>
            <div class="ls-sub">
              <span>${ic.guest(11)} <span id="vs-online-guests">${visitorStats.loaded ? fmtCount(visitorStats.online_guests) : '—'}</span></span>
              <span>${ic.member(11)} <span id="vs-online-members">${visitorStats.loaded ? fmtCount(visitorStats.online_members) : '—'}</span></span>
            </div>
          </div>
          <div class="ls-divider"></div>
          <div class="ls-block">
            <div class="ls-value"><span id="vs-today">${visitorStats.loaded ? fmtCount(visitorStats.today) : '—'}</span></div>
            <div class="ls-label">visitors today</div>
            <div class="ls-sub">
              <span>${ic.guest(11)} <span id="vs-today-guests">${visitorStats.loaded ? fmtCount(visitorStats.today_guests) : '—'}</span></span>
              <span>${ic.member(11)} <span id="vs-today-members">${visitorStats.loaded ? fmtCount(visitorStats.today_members) : '—'}</span></span>
            </div>
          </div>
          <div class="ls-divider"></div>
          <div class="ls-block">
            <div class="ls-value"><span id="vs-total">${visitorStats.loaded ? fmtCount(visitorStats.total) : '—'}</span></div>
            <div class="ls-label">all time</div>
            <div class="ls-sub"><span>visitors</span></div>
          </div>
        </div>
      </div>

      <!-- Quests entry -->
      <button class="pm-row" id="open-quests">
        <span class="pm-row-icon">${ic.quests(22)}</span>
        <div class="pm-row-body">
          <div class="pm-row-title-line">
            <span class="pm-row-title">Quests</span>
            <span class="pm-row-claim-badge" id="quests-claim-badge" style="display:none;"></span>
          </div>
          <span class="pm-row-sub" id="quests-sub">${isGuest ? 'Sign in to see daily & weekly quests' : 'Daily & weekly challenges'}</span>
          <div class="pm-row-progress" id="quests-progress" style="display:none;">
            <div class="pm-row-progress-fill" id="quests-progress-fill"></div>
          </div>
        </div>
        <span class="pm-row-chevron">${ic.chevronRight(20)}</span>
      </button>

      <div class="app-version-row">
        ${import.meta.env.VITE_APP_ENV === 'staging' ? '<span class="env-badge env-badge--staging">STAGING</span>' : ''}
        <span>v${APP_VERSION}</span>
      </div>

    </section>
    ${bottomNavHTML('home')}
  `;

  root.querySelector('#enter-play-mode')?.addEventListener('click', props.onEnterPlayMode);
  root.querySelector('#open-practice')?.addEventListener('click', props.onOpenPractice);
  root.querySelector('#open-quests')?.addEventListener('click', props.onOpenQuests);
  root.querySelector('#home-daily-more')?.addEventListener('click', props.onOpenDailyDetail);

  // --- Daily hero: countdown + rank + play/continue state ---
  const countdownEl = root.querySelector<HTMLElement>('#home-daily-countdown')!;
  const tick = () => { countdownEl.textContent = formatCountdown(msUntilNextUtcMidnight()); };
  tick();
  const countdownHandle = window.setInterval(tick, 1000);

  const playBtn = root.querySelector<HTMLButtonElement>('#home-daily-play')!;
  let savedGame: GameInProgress | null = null;
  let alreadyCompleted = false;

  playBtn.addEventListener('click', () => {
    if (alreadyCompleted) return;
    if (savedGame) props.onContinueDaily(savedGame);
    else props.onPlayDaily();
  });

  function markCompleted() {
    alreadyCompleted = true;
    playBtn.textContent = '✓ Completed today';
    playBtn.disabled = true;
    playBtn.classList.add('pm-detail-btn-primary--done');
  }

  // Members get their rank from the leaderboard; a rank existing also means
  // today's attempt is already spent (one attempt per day).
  void api.getMyDailyRank(today).then((rank) => {
    const rankEl = root.querySelector('#home-daily-rank');
    if (rank) {
      if (rankEl) rankEl.textContent = `#${rank.rank} / ${rank.total_players}`;
      markCompleted();
    } else if (rankEl) {
      rankEl.textContent = 'Not played';
    }
  }).catch(() => { });

  // Guests never reach daily_leaderboard — their completion lives in
  // guest_game_history instead.
  if (!state.user?.id) {
    void api.getGuestLeaderboard(today).then((rows) => {
      const mySessionId = api.getSessionId();
      if (rows.some((r) => r.session_id === mySessionId)) markCompleted();
    }).catch(() => { });
  }

  // A save with no moves is a phantom from opening and leaving straight away —
  // don't offer "Continue" for it.
  void listGames().then((games) => {
    const saved = games.find((g) => g.mode === 'daily' && g.date === today);
    if (!saved || alreadyCompleted || !saved.moves || saved.moves.length === 0) return;
    savedGame = saved;
    playBtn.textContent = 'Continue';
  }).catch(() => { });
  wireBottomNav(root, props.nav, 'home');
  const unwireHearts = wireHeartsPill(root);
  void refreshHearts();
  root.querySelector('#user-badge')?.addEventListener('click', props.onAuthAction);
  root.querySelector('#save-progress')?.addEventListener('click', props.onAuthAction);
  root.querySelector('#mute-btn')?.addEventListener('click', (e) => {
    const nowMuted = toggleMute();
    const btn = e.currentTarget as HTMLButtonElement;
    btn.innerHTML = nowMuted ? ic.soundOff(16) : ic.soundOn(16);
    btn.title = nowMuted ? 'Unmute' : 'Mute';
  });

  return { unmount() { window.clearInterval(countdownHandle); unwireHearts(); } };
}
