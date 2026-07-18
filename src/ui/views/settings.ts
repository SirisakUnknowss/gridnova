// =====================================================================
// Settings view — Sound, Notifications, Board, Official Community,
// Help & About, Account.
// =====================================================================
import { useStore } from '@state/store';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { APP_VERSION } from '@lib/version';
import { getBgVolume, setBgVolume, getSfxVolume, setSfxVolume, sfxNav } from '@lib/sound';
import {
  getBoardPrefs, setBoardPref, type BoardPrefs,
  isVibrateEnabled, setVibrateEnabled,
  getPushPref, setPushPref,
} from '@lib/prefs';
import { isPushSupported, enablePushNotifications, disablePushNotifications } from '@lib/push';

// Notification.permission is synchronous; push.ts's getPushPermission()
// wraps it in a Promise, which doesn't fit this view's sync initial render.
function pushPermission(): NotificationPermission {
  return isPushSupported() ? Notification.permission : 'denied';
}
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
  onOpenHowToPlay: () => void;
  onOpenContactSupport: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenTermsOfService: () => void;
  onToast: (msg: string) => void;
  nav: BottomNavCallbacks;
}

function toggleRow(id: string, icon: string, label: string, sub: string, on: boolean): string {
  return `
    <div class="settings-row">
      <span class="settings-ic">${icon}</span>
      <span class="settings-txt">
        <div class="settings-title">${label}</div>
        <div class="settings-sub">${sub}</div>
      </span>
      <button class="toggle${on ? ' on' : ''}" id="${id}" role="switch" aria-checked="${on}" aria-label="${label}">
        <span class="toggle-knob"></span>
      </button>
    </div>
  `;
}

function sliderSubRow(id: string, value: number, enabled: boolean): string {
  const pct = Math.round(value * 100);
  return `
    <div class="settings-sub-row${enabled ? '' : ' disabled'}" id="${id}-wrap">
      <div class="settings-slider-line">
        ${ic.soundOn(15)}
        <input type="range" class="vol-slider" id="${id}" min="0" max="100" value="${pct}" aria-label="Volume">
        <span class="settings-slider-val" id="${id}-val">${pct}%</span>
      </div>
    </div>
  `;
}

function linkRow(id: string, icon: string, label: string, sub: string): string {
  return `
    <button class="settings-row" id="${id}" style="cursor:pointer;background:none;border:none;width:100%;text-align:left;font:inherit;">
      <span class="settings-ic">${icon}</span>
      <span class="settings-txt">
        <div class="settings-title">${label}</div>
        ${sub ? `<div class="settings-sub">${sub}</div>` : ''}
      </span>
      <span class="settings-chev"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg></span>
    </button>
  `;
}

export function mountSettingsView(root: HTMLElement, props: SettingsProps): { unmount: () => void } {
  const state = useStore.getState();
  const isSignedIn = !!state.user && !state.user.is_anonymous;
  const prefs = getBoardPrefs();
  const bgOn = getBgVolume() > 0;
  const sfxOn = getSfxVolume() > 0;
  const pushSupported = isPushSupported();
  const pushOn = pushSupported && getPushPref() && pushPermission() === 'granted';

  root.innerHTML = `
    <section class="view">
      <div class="top-bar">
        <button class="icon-btn" id="settings-back" aria-label="Back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <h2 style="margin:0;">Settings</h2>
        <span style="width:38px;"></span>
      </div>

      <div class="settings-group">
        <div class="settings-group-label">Sound</div>
        <div class="card settings-card">
          ${toggleRow('set-bg-on', ic.soundOn(18), 'Background Music', 'Calm music while you play', bgOn)}
          ${sliderSubRow('set-bg-vol', getBgVolume(), bgOn)}
          ${toggleRow('set-sfx-on', ic.zap(18), 'Sound Effects', 'Taps, wins, and rewards', sfxOn)}
          ${sliderSubRow('set-sfx-vol', getSfxVolume(), sfxOn)}
          ${toggleRow('set-vibrate', ic.gamepad(18), 'Vibration', 'Haptic feedback on input', isVibrateEnabled())}
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-label">Notifications</div>
        <div class="card settings-card">
          ${toggleRow('set-push', ic.bell(18), 'Daily Puzzle Reminder', 'Get notified before it resets', pushOn)}
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-label">Board</div>
        <div class="card settings-card">
          ${toggleRow('set-same', ic.target(18), 'Highlight Same Numbers', 'Show all cells matching the selected digit', prefs.highlightSame)}
          ${toggleRow('set-related', ic.chart(18), 'Highlight Row & Column', 'Shade the selected cell’s row, column, and box', prefs.highlightRelated)}
          ${toggleRow('set-conflict', ic.warning(18), 'Show Conflicts', 'Mark digits that break Sudoku rules', prefs.showConflict)}
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-label">Official Community</div>
        <div class="card settings-card">
          ${linkRow('set-fb-group', ic.globe(18), 'Sudoku Thailand', 'Facebook group — daily battles with Thai players')}
          ${linkRow('set-fb-page', ic.star(18), 'GridNova', 'Official Facebook page — news and events')}
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-label">Help & About</div>
        <div class="card settings-card">
          ${linkRow('set-how-to-play', ic.brain(18), 'How to Play', 'Rules & tips for Sudoku')}
          ${linkRow('set-contact', ic.bell(18), 'Contact Support', 'We usually reply within a day')}
          ${linkRow('set-privacy', ic.lock(18), 'Privacy Policy', '')}
          ${linkRow('set-terms', ic.puzzle(18), 'Terms of Service', '')}
          ${linkRow('set-whatsnew', ic.sparkle(18), 'What’s New', 'See what changed in the latest update')}
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-label">Account</div>
        <div class="card settings-card">
          ${isSignedIn
            ? `<button class="settings-row danger" id="set-signout" style="cursor:pointer;background:none;border:none;width:100%;text-align:left;font:inherit;">
                <span class="settings-ic">${ic.member(18)}</span>
                <span class="settings-txt"><div class="settings-title">Sign Out</div></span>
              </button>`
            : linkRow('set-signin', ic.member(18), 'Sign In / Create Account', 'Keep your streak, coins, and medals safe')}
        </div>
      </div>

      <div class="settings-version">GridNova <b>v${APP_VERSION}</b></div>

      ${bottomNavHTML('profile')}
    </section>
  `;

  function wireToggle(id: string, isOn: () => boolean, flip: () => Promise<boolean> | boolean) {
    const btn = root.querySelector<HTMLButtonElement>(`#${id}`);
    btn?.addEventListener('click', async () => {
      const result = await flip();
      const on = result ?? isOn();
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-checked', String(on));
      return on;
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

  function setSliderEnabled(sliderId: string, enabled: boolean) {
    root.querySelector(`#${sliderId}-wrap`)?.classList.toggle('disabled', !enabled);
  }

  // Background music toggle — flips volume between 0 and the last non-zero value.
  let lastBgVol = getBgVolume() || 0.45;
  wireToggle('set-bg-on', () => getBgVolume() > 0, () => {
    const nowOn = getBgVolume() === 0;
    if (nowOn) {
      setBgVolume(lastBgVol);
      const slider = root.querySelector<HTMLInputElement>('#set-bg-vol');
      const val = root.querySelector<HTMLElement>('#set-bg-vol-val');
      if (slider) slider.value = String(Math.round(lastBgVol * 100));
      if (val) val.textContent = `${Math.round(lastBgVol * 100)}%`;
    } else {
      lastBgVol = getBgVolume();
      setBgVolume(0);
    }
    setSliderEnabled('set-bg-vol', nowOn);
    return nowOn;
  });
  wireSlider('set-bg-vol', setBgVolume);

  let lastSfxVol = getSfxVolume() || 1;
  wireToggle('set-sfx-on', () => getSfxVolume() > 0, () => {
    const nowOn = getSfxVolume() === 0;
    if (nowOn) {
      setSfxVolume(lastSfxVol);
      const slider = root.querySelector<HTMLInputElement>('#set-sfx-vol');
      const val = root.querySelector<HTMLElement>('#set-sfx-vol-val');
      if (slider) slider.value = String(Math.round(lastSfxVol * 100));
      if (val) val.textContent = `${Math.round(lastSfxVol * 100)}%`;
      sfxNav();
    } else {
      lastSfxVol = getSfxVolume();
      setSfxVolume(0);
    }
    setSliderEnabled('set-sfx-vol', nowOn);
    return nowOn;
  });
  wireSlider('set-sfx-vol', setSfxVolume, true);

  wireToggle('set-vibrate', isVibrateEnabled, () => {
    const next = !isVibrateEnabled();
    setVibrateEnabled(next);
    if (next) navigator.vibrate?.(10);
    return next;
  });

  wireToggle('set-push', () => pushSupported && getPushPref(), async () => {
    if (!pushSupported) {
      props.onToast('Notifications aren’t supported on this device');
      return false;
    }
    const turningOn = !getPushPref() || pushPermission() !== 'granted';
    if (turningOn) {
      const ok = await enablePushNotifications();
      setPushPref(ok);
      if (!ok) props.onToast('Enable notifications in your browser/device settings to turn this on');
      return ok;
    } else {
      await disablePushNotifications();
      setPushPref(false);
      return false;
    }
  });

  const wireBoardPref = (id: string, key: keyof BoardPrefs) =>
    wireToggle(id, () => getBoardPrefs()[key], () => { const v = !getBoardPrefs()[key]; setBoardPref(key, v); return v; });
  wireBoardPref('set-same', 'highlightSame');
  wireBoardPref('set-related', 'highlightRelated');
  wireBoardPref('set-conflict', 'showConflict');

  root.querySelector('#settings-back')?.addEventListener('click', props.onBack);
  root.querySelector('#set-signout')?.addEventListener('click', props.onSignOut);
  root.querySelector('#set-signin')?.addEventListener('click', props.onUpgradeAccount);
  root.querySelector('#set-fb-group')?.addEventListener('click', () => window.open(COMMUNITY_LINKS.fbGroup, '_blank', 'noopener'));
  root.querySelector('#set-fb-page')?.addEventListener('click', () => window.open(COMMUNITY_LINKS.fbPage, '_blank', 'noopener'));
  root.querySelector('#set-how-to-play')?.addEventListener('click', props.onOpenHowToPlay);
  root.querySelector('#set-contact')?.addEventListener('click', props.onOpenContactSupport);
  root.querySelector('#set-privacy')?.addEventListener('click', props.onOpenPrivacyPolicy);
  root.querySelector('#set-terms')?.addEventListener('click', props.onOpenTermsOfService);
  root.querySelector('#set-whatsnew')?.addEventListener('click', () => showWhatsNew());

  wireBottomNav(root, props.nav, 'profile');

  return { unmount() { /* nothing to clean up */ } };
}
