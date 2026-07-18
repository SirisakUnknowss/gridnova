// =====================================================================
// Settings view — game options, account, official community, help/about
// =====================================================================
import { useStore } from '@state/store';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { APP_VERSION } from '@lib/version';
import { getBgVolume, setBgVolume, getSfxVolume, setSfxVolume, sfxNav } from '@lib/sound';
import { getBoardPrefs, setBoardPref, type BoardPrefs } from '@lib/prefs';
import { showWhatsNew } from './whats-new';

// Official community links — the canonical home for these across the app.
export const COMMUNITY_LINKS = {
  fbGroup: 'https://www.facebook.com/groups/926777207089534',
  fbPage: 'https://www.facebook.com/profile.php?id=61591484931870',
};

export interface SettingsProps {
  onBack: () => void;
  onSignOut: () => void;
  onUpgradeAccount: () => void;
  nav: BottomNavCallbacks;
}

function toggleRow(id: string, label: string, sub: string, on: boolean): string {
  return `
    <div class="profile-row" style="cursor:default;">
      <span style="display:flex;align-items:center;gap:10px;">
        <span><span style="color:var(--app-text)">${label}</span><br><small>${sub}</small></span>
      </span>
      <button class="toggle${on ? ' on' : ''}" id="${id}" role="switch" aria-checked="${on}" aria-label="${label}">
        <span class="toggle-knob"></span>
      </button>
    </div>
  `;
}

function sliderRow(id: string, label: string, sub: string, value: number): string {
  const pct = Math.round(value * 100);
  return `
    <div class="profile-row" style="cursor:default;flex-direction:column;align-items:stretch;gap:8px;">
      <span style="display:flex;justify-content:space-between;align-items:baseline;">
        <span><span style="color:var(--app-text)">${label}</span><br><small>${sub}</small></span>
        <small id="${id}-val" style="color:var(--brand-primary);font-weight:600;">${pct}%</small>
      </span>
      <input type="range" class="vol-slider" id="${id}" min="0" max="100" value="${pct}" aria-label="${label}">
    </div>
  `;
}

function linkRow(id: string, icon: string, label: string, sub: string): string {
  return `
    <button class="profile-row" id="${id}">
      <span style="display:flex;align-items:center;gap:10px;">
        ${icon}
        <span><span style="color:var(--app-text)">${label}</span><br><small>${sub}</small></span>
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  `;
}

export function mountSettingsView(root: HTMLElement, props: SettingsProps): { unmount: () => void } {
  const state = useStore.getState();
  const isSignedIn = !!state.user && !state.user.is_anonymous;
  const prefs = getBoardPrefs();

  root.innerHTML = `
    <section class="view">
      <div class="top-bar">
        <button class="icon-btn" id="settings-back" aria-label="Back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <h2 style="margin:0;">Settings</h2>
        <span style="width:38px;"></span>
      </div>

      <div class="card">
        <h3>Sound</h3>
        ${sliderRow('set-bg-vol', 'Background music', 'Calm music while you play', getBgVolume())}
        ${sliderRow('set-sfx-vol', 'Sound effects', 'Taps, wins, and rewards', getSfxVolume())}
      </div>

      <div class="card">
        <h3>Board</h3>
        ${toggleRow('set-same', 'Highlight same numbers', 'Show all cells matching the selected digit', prefs.highlightSame)}
        ${toggleRow('set-related', 'Highlight row & column', 'Shade the selected cell’s row, column, and box', prefs.highlightRelated)}
        ${toggleRow('set-conflict', 'Show conflicts', 'Mark digits that break Sudoku rules', prefs.showConflict)}
      </div>

      <div class="card">
        <h3>Account</h3>
        ${isSignedIn
          ? `${linkRow('set-signout', ic.member(16), 'Sign out', 'Signed in — progress is synced')}`
          : `${linkRow('set-signin', ic.member(16), 'Sign in / Create account', 'Keep your streak, coins, and medals safe')}`}
      </div>

      <div class="card">
        <h3>Official Community</h3>
        ${linkRow('set-fb-group', ic.globe(16), 'Sudoku Thailand', 'Facebook group — daily battles with Thai players')}
        ${linkRow('set-fb-page', ic.star(16), 'GridNova', 'Official Facebook page — news and events')}
      </div>

      <div class="card">
        <h3>Help & About</h3>
        ${linkRow('set-whatsnew', ic.sparkle(16), 'What’s New', 'See what changed in the latest update')}
        ${linkRow('set-help', ic.bell(16), 'Help & contact', 'Message us on the GridNova page')}
        <div class="profile-row" style="cursor:default;">
          <span style="display:flex;align-items:center;gap:10px;">
            ${ic.puzzle(16)}
            <span><span style="color:var(--app-text)">Version</span><br><small>GridNova v${APP_VERSION}</small></span>
          </span>
        </div>
      </div>

      ${bottomNavHTML('profile')}
    </section>
  `;

  function wireToggle(id: string, isOn: () => boolean, flip: () => void) {
    const btn = root.querySelector<HTMLButtonElement>(`#${id}`);
    btn?.addEventListener('click', () => {
      flip();
      const on = isOn();
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-checked', String(on));
    });
  }

  function wireSlider(id: string, apply: (v: number) => void, sfxOnRelease = false) {
    const el = root.querySelector<HTMLInputElement>(`#${id}`);
    const valEl = root.querySelector<HTMLElement>(`#${id}-val`);
    el?.addEventListener('input', () => {
      const pct = Number(el.value);
      apply(pct / 100);
      if (valEl) valEl.textContent = `${pct}%`;
    });
    // A short blip on release lets the user hear the new sfx level.
    if (sfxOnRelease) el?.addEventListener('change', () => sfxNav());
  }

  wireSlider('set-bg-vol', setBgVolume);
  wireSlider('set-sfx-vol', setSfxVolume, true);

  const wireBoardPref = (id: string, key: keyof BoardPrefs) =>
    wireToggle(id, () => getBoardPrefs()[key], () => setBoardPref(key, !getBoardPrefs()[key]));
  wireBoardPref('set-same', 'highlightSame');
  wireBoardPref('set-related', 'highlightRelated');
  wireBoardPref('set-conflict', 'showConflict');

  root.querySelector('#settings-back')?.addEventListener('click', props.onBack);
  root.querySelector('#set-signout')?.addEventListener('click', props.onSignOut);
  root.querySelector('#set-signin')?.addEventListener('click', props.onUpgradeAccount);
  root.querySelector('#set-fb-group')?.addEventListener('click', () => window.open(COMMUNITY_LINKS.fbGroup, '_blank', 'noopener'));
  root.querySelector('#set-fb-page')?.addEventListener('click', () => window.open(COMMUNITY_LINKS.fbPage, '_blank', 'noopener'));
  root.querySelector('#set-whatsnew')?.addEventListener('click', () => showWhatsNew());
  root.querySelector('#set-help')?.addEventListener('click', () => window.open(COMMUNITY_LINKS.fbPage, '_blank', 'noopener'));

  wireBottomNav(root, props.nav, 'profile');

  return { unmount() { /* nothing to clean up */ } };
}
