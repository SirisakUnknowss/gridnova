// =====================================================================
// Profile view — avatar picker, editable display name, stats summary
// =====================================================================
import { useStore } from '@state/store';
import * as api from '@lib/api';
import { showShareModal } from './share-modal';
import { escapeHtml, formatNumber } from '@lib/format';
import { track } from '@lib/analytics';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { APP_VERSION } from '@lib/version';
import { isPremium } from '@lib/premium';

export interface ProfileProps {
  onBack: () => void;
  onOpenStats: () => void;
  onOpenAchievements: () => void;
  onOpenRecap: () => void;
  onOpenLedger: () => void;
  onSignOut: () => void;
  onUpgradeAccount: () => void;
  onToast: (msg: string) => void;
  nav: BottomNavCallbacks;
}

const DEFAULT_AVATARS = [
  '👤','🧑','👩','👨','🧒','👵','👴',
  '🦸','🧙','🥷','🤖','👻','🐱','🦊',
  '🐼','🐯','🦁','🐸','🐧','🦉','🐙',
];

export function mountProfileView(root: HTMLElement, props: ProfileProps): { unmount: () => void } {
  const state = useStore.getState();
  const user = state.user;
  const profile = state.profile ?? {};
  const isAnonymous = !!user?.is_anonymous;
  // A real (signed-in) user has an email and is not anonymous.
  // Anonymous Supabase users + offline-demo guests both lack a real account.
  const isSignedIn = !!user && !isAnonymous;
  const isGuest = !isSignedIn;
  const currentEmoji = (state.equipped.avatar?.emoji as string) ?? '👤';
  const displayName = profile.display_name || profile.username || (isGuest ? 'Guest' : 'Player');

  root.innerHTML = `
    <section class="view">
      <div class="top-bar">
        <button class="icon-btn" id="prof-back" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 style="margin:0;font-size:16px;color:var(--app-text);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Profile
        </h2>
        <span style="width:38px;"></span>
      </div>
      <div class="profile-hero">
        <button class="profile-avatar" id="prof-avatar-btn" title="Change avatar" style="padding:0; overflow:hidden; display:inline-flex; align-items:center; justify-content:center;">
          ${profile.avatar_url ? `<img src="${profile.avatar_url}" style="width:100%; height:100%; object-fit:cover;" />` : currentEmoji}
        </button>
        <input type="file" id="prof-file-input" style="display:none;" accept="image/*" />
        <div class="profile-name">
          <span id="prof-name">${escapeHtml(displayName)}</span>
          <button class="icon-btn--ghost" id="prof-edit-name" title="Edit name">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        <div style="display:flex;gap:6px;justify-content:center;margin-top:6px;flex-wrap:wrap;">
          <div class="badge-tag">${isGuest ? 'GUEST' : 'MEMBER'}</div>
          ${!isGuest && isPremium() ? '<div class="badge-tag badge-tag--premium">✨ PREMIUM</div>' : ''}
        </div>
        ${isGuest ? `
          <button class="btn btn--primary btn--small" id="prof-upgrade" style="margin-top:10px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Save progress
          </button>
        ` : `
          <div style="font-size:12px;color:var(--app-text-secondary);margin-top:4px;">${escapeHtml(user?.email ?? '')}</div>
          <button class="btn btn--secondary btn--small" id="prof-share-card" style="margin-top:10px;">
            📤 Share Profile
          </button>
        `}
      </div>

      <div class="profile-stats">
        <div class="stat-tile">
          <div class="stat-label">STREAK</div>
          <div class="stat-value">${ic.streak(14)} ${state.currentStreak}</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">LEVEL</div>
          <div class="stat-value">${ic.star(14)} ${state.level}</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">COINS</div>
          <div class="stat-value">${ic.coin(14)} ${formatNumber(state.coins)}</div>
        </div>
      </div>

      <div class="card">
        <button class="profile-row" id="prof-stats">
          <span style="display:flex;align-items:center;gap:10px;">
            <svg class="row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span><span style="color:var(--app-text)">Stats</span><br><small>Detailed game history</small></span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="profile-row" id="prof-ach">
          <span style="display:flex;align-items:center;gap:10px;">
            <svg class="row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            <span><span style="color:var(--app-text)">Achievements</span><br><small>Unlock badges</small></span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="profile-row" id="prof-recap">
          <span style="display:flex;align-items:center;gap:10px;">
            <svg class="row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span><span style="color:var(--app-text)">Weekly Recap</span><br><small>This week's highlights</small></span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="profile-row" id="prof-ledger">
          <span style="display:flex;align-items:center;gap:10px;">
            <svg class="row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>
            <span><span style="color:var(--app-text)">Coin Ledger</span><br><small>Earned and spent</small></span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        ${isSignedIn ? `
          <button class="profile-row danger" id="prof-signout">
            <span style="display:flex;align-items:center;gap:10px;">
              <svg class="row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span style="color:#ef4444">Sign out</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ` : ''}
      </div>

      <div class="app-version">v${APP_VERSION}</div>

      <div id="avatar-grid" class="avatar-grid hidden">
        ${DEFAULT_AVATARS.map((e) => `
          <button class="avatar-cell${e === currentEmoji ? ' selected' : ''}" data-emoji="${e}">${e}</button>
        `).join('')}
      </div>
    </section>

    <!-- Modal Options Dialog for Avatar -->
    <div id="avatar-modal-bg" class="modal-bg">
      <div class="modal" style="position: relative;">
        <button class="modal-close" id="avatar-modal-close" aria-label="Close">×</button>
        <h2 style="margin: 0 0 16px 0; font-size: 18px; text-align: center;">Edit Profile Picture</h2>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="btn btn--primary" id="avatar-opt-upload" style="width: 100%;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Photo
          </button>
          <button class="btn btn--secondary" id="avatar-opt-emoji" style="width: 100%;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:6px"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            Choose Emoji
          </button>
          <button class="btn btn--danger" id="avatar-opt-remove" style="width: 100%; display: ${profile.avatar_url ? 'block' : 'none'};">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:6px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Remove Photo
          </button>
          <button class="btn btn--ghost" id="avatar-opt-cancel" style="width: 100%; border: 1px solid var(--app-border);">Cancel</button>
        </div>
      </div>
    </div>

    ${bottomNavHTML('profile')}
  `;
  wireBottomNav(root, props.nav, 'profile');

  const avatarGrid = root.querySelector<HTMLElement>('#avatar-grid')!;
  const avatarBtn = root.querySelector<HTMLElement>('#prof-avatar-btn')!;
  const fileInput = root.querySelector<HTMLInputElement>('#prof-file-input')!;
  const avatarModal = root.querySelector<HTMLElement>('#avatar-modal-bg')!;
  const optRemove = root.querySelector<HTMLElement>('#avatar-opt-remove')!;

  avatarBtn.addEventListener('click', () => {
    if (isGuest) {
      avatarGrid.classList.toggle('hidden');
    } else {
      avatarModal.classList.add('active');
    }
  });

  if (!isGuest) {
    root.querySelector('#avatar-modal-close')?.addEventListener('click', () => {
      avatarModal.classList.remove('active');
    });
    root.querySelector('#avatar-opt-cancel')?.addEventListener('click', () => {
      avatarModal.classList.remove('active');
    });
    avatarModal.addEventListener('click', (e) => {
      if (e.target === avatarModal) {
        avatarModal.classList.remove('active');
      }
    });

    root.querySelector('#avatar-opt-upload')?.addEventListener('click', () => {
      avatarModal.classList.remove('active');
      fileInput.click();
    });

    root.querySelector('#avatar-opt-emoji')?.addEventListener('click', () => {
      avatarModal.classList.remove('active');
      avatarGrid.classList.remove('hidden');
    });

    optRemove?.addEventListener('click', async () => {
      avatarModal.classList.remove('active');
      const oldHtml = avatarBtn.innerHTML;
      avatarBtn.innerHTML = `
        <div class="spinner" style="width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3); border-left-color: white;"></div>
      `;
      try {
        await api.updateProfile({ avatar_url: null });
        useStore.setState({
          profile: { ...(useStore.getState().profile ?? {}), avatar_url: undefined }
        });
        const emoji = (useStore.getState().equipped.avatar?.emoji as string) ?? '👤';
        avatarBtn.textContent = emoji;
        if (optRemove) optRemove.style.display = 'none';
        props.onToast('Photo removed');
      } catch (err) {
        avatarBtn.innerHTML = oldHtml;
        props.onToast('Could not remove photo');
        console.error(err);
      }
    });

    fileInput.addEventListener('change', async () => {
      if (!fileInput.files || fileInput.files.length === 0) return;
      const file = fileInput.files[0];
      
      if (!file.type.startsWith('image/')) {
        props.onToast('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        props.onToast('File is too large (max 5MB)');
        return;
      }

      const oldHtml = avatarBtn.innerHTML;
      avatarBtn.innerHTML = `
        <div class="spinner" style="width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3); border-left-color: white;"></div>
      `;

      try {
        const publicUrl = await api.uploadAvatar(file);
        await api.updateProfile({ avatar_url: publicUrl });
        useStore.setState({
          profile: { ...(useStore.getState().profile ?? {}), avatar_url: publicUrl }
        });
        avatarBtn.innerHTML = `<img src="${publicUrl}" style="width:100%; height:100%; object-fit:cover;" />`;
        if (optRemove) optRemove.style.display = 'block';
        props.onToast('Profile photo updated');
      } catch (err) {
        avatarBtn.innerHTML = oldHtml;
        props.onToast('Could not upload photo');
        console.error(err);
      } finally {
        fileInput.value = '';
      }
    });
  }

  avatarGrid.querySelectorAll<HTMLButtonElement>('.avatar-cell').forEach((cell) => {
    cell.addEventListener('click', async () => {
      const emoji = cell.dataset.emoji!;
      avatarGrid.querySelectorAll('.avatar-cell').forEach((c) => c.classList.remove('selected'));
      cell.classList.add('selected');
      avatarBtn.textContent = emoji;
      const newAvatar = { emoji };
      useStore.getState().setEquipped({ avatar: newAvatar });
      track('avatar_changed', { emoji });
      
      try {
        if (!isGuest) {
          await api.updateProfile({ avatar_url: null });
          useStore.setState({
            profile: { ...(useStore.getState().profile ?? {}), avatar_url: undefined }
          });
          if (optRemove) optRemove.style.display = 'none';
        }
        await api.equipItem({ avatar: newAvatar });
      } catch {
        // local-only fallback
      }
      props.onToast('Avatar updated');
    });
  });

  root.querySelector('#prof-edit-name')?.addEventListener('click', async () => {
    const next = prompt('Display name:', displayName);
    if (next == null) return;
    const trimmed = next.trim().slice(0, 20);
    if (!trimmed) return;
    try {
      await api.updateProfile({ display_name: trimmed });
      useStore.setState({
        profile: { ...(useStore.getState().profile ?? {}), display_name: trimmed },
      });
      const nameEl = root.querySelector<HTMLElement>('#prof-name');
      if (nameEl) nameEl.textContent = trimmed;
      props.onToast('Name updated');
    } catch (err) {
      props.onToast('Could not update name');
      console.warn(err);
    }
  });

  root.querySelector('#prof-back')?.addEventListener('click', props.onBack);
  root.querySelector('#prof-stats')?.addEventListener('click', props.onOpenStats);
  root.querySelector('#prof-ach')?.addEventListener('click', props.onOpenAchievements);
  root.querySelector('#prof-recap')?.addEventListener('click', props.onOpenRecap);
  root.querySelector('#prof-ledger')?.addEventListener('click', props.onOpenLedger);
  root.querySelector('#prof-signout')?.addEventListener('click', props.onSignOut);
  root.querySelector('#prof-upgrade')?.addEventListener('click', props.onUpgradeAccount);

  root.querySelector('#prof-share-card')?.addEventListener('click', async () => {
    const st = useStore.getState();
    const uid = st.user?.id;
    let referralCode = '';
    try { if (uid) referralCode = await api.getReferralCode(uid); } catch { /* ignore */ }

    let recapData;
    if (uid) {
      try {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth() + 1;
        const recap = await api.getMonthlyRecap(uid, y, m);
        recapData = { ...recap, year: y, month: m, displayName: profile.display_name || profile.username };
      } catch { /* ignore */ }
    }

    showShareModal({
      profile: {
        displayName: profile.display_name || profile.username || 'Player',
        avatarUrl: profile.avatar_url,
        avatarEmoji: (st.equipped.avatar?.emoji as string) || '👤',
        level: st.level,
        bestStreak: st.currentStreak,
        longestStreak: st.longestStreak,
        coins: st.coins,
        referralCode: referralCode || 'GRIDNOVA',
      },
      recap: recapData,
      onToast: props.onToast,
    });
  });

  return { unmount() { /* no listeners to clean */ } };
}
