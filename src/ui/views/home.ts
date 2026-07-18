// =====================================================================
// Home view — main hub
// =====================================================================
import { useStore } from '@state/store';
import { formatNumber } from '@lib/format';
import { levelProgress } from '@lib/level';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { isMuted, toggleMute } from '@lib/sound';
import { useVisitorStore } from '@state/visitor-store';
import { getGuestDisplayId } from '@lib/api';
import { ic } from '@ui/icons';
import { APP_VERSION } from '@lib/version';

export interface HomeViewProps {
  onEnterPlayMode: () => void;
  onOpenPractice: () => void;
  onAuthAction: () => void;
  nav: BottomNavCallbacks;
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

      <!-- Play Mode entry -->
      <div class="playmode-card-v2">
        <span class="playmode-card-v2-icon">${ic.gamepad(24)}</span>
        <div class="playmode-card-v2-title">Play Mode</div>
        <div class="playmode-card-v2-sub">Choose a mode to play</div>
        <button class="btn playmode-card-v2-btn" id="enter-play-mode">Enter Play Mode</button>
      </div>

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

      <!-- Quests -->
      <div class="card quests-card">
        <h3>${ic.quests(16)} Quests</h3>
        <div id="quest-list" style="font-size:13px;color:var(--app-text-secondary);">
          ${isGuest ? '<span style="color:var(--brand-primary);cursor:pointer;" id="quest-signin">Sign in</span> to see daily quests.' : 'Loading…'}
        </div>
      </div>

      <!-- Weekly Quests -->
      <div class="card quests-card">
        <h3>${ic.trophy(16)} Weekly Quests</h3>
        <div id="weekly-quest-list" style="font-size:13px;color:var(--app-text-secondary);">
          ${isGuest ? '<span style="color:var(--brand-primary);cursor:pointer;" id="weekly-quest-signin">Sign in</span> to see weekly quests.' : 'Loading…'}
        </div>
      </div>

      <div class="app-version-row">
        ${import.meta.env.VITE_APP_ENV === 'staging' ? '<span class="env-badge env-badge--staging">STAGING</span>' : ''}
        <span>v${APP_VERSION}</span>
      </div>

    </section>
    ${bottomNavHTML('home')}
  `;

  root.querySelector('#enter-play-mode')?.addEventListener('click', props.onEnterPlayMode);
  root.querySelector('#open-practice')?.addEventListener('click', props.onOpenPractice);
  wireBottomNav(root, props.nav, 'home');
  root.querySelector('#user-badge')?.addEventListener('click', props.onAuthAction);
  root.querySelector('#save-progress')?.addEventListener('click', props.onAuthAction);
  root.querySelector('#quest-signin')?.addEventListener('click', props.onAuthAction);
  root.querySelector('#weekly-quest-signin')?.addEventListener('click', props.onAuthAction);
  root.querySelector('#mute-btn')?.addEventListener('click', (e) => {
    const nowMuted = toggleMute();
    const btn = e.currentTarget as HTMLButtonElement;
    btn.innerHTML = nowMuted ? ic.soundOff(16) : ic.soundOn(16);
    btn.title = nowMuted ? 'Unmute' : 'Mute';
  });

  return { unmount() { } };
}
