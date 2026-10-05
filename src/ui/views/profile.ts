import { RARE_AVATAR_CATALOG } from '@lib/rare-avatar-catalog';
import { AVATAR_OPTIONS, PAID_AVATAR_ITEMS, avatarArtHTML } from '../components/avatar-art';
import { getGuestIdentity, saveGuestIdentity } from '@lib/guest-identity';
// =====================================================================
// Profile view — avatar picker, editable display name, stats summary
// =====================================================================
import { useStore } from '@state/store';
import * as api from '@lib/api';
import { showShareModal } from './share-modal';
import { escapeHtml, formatNumber } from '@lib/format';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { APP_VERSION } from '@lib/version';
import { isPremium } from '@lib/premium';

export interface ProfileProps {
  onOpenCollection: () => void;
  onShopAvatar: (itemId: string) => void;
  onBack: () => void;
  onOpenStats: () => void;
  onOpenAchievements: () => void;
  onOpenRecap: () => void;
  onOpenLedger: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  onUpgradeAccount: () => void;
  onToast: (msg: string) => void;
  nav: BottomNavCallbacks;
}


export function mountProfileView(root: HTMLElement, props: ProfileProps): { unmount: () => void } {
  const state = useStore.getState();
  const user = state.user;
  const profile = state.profile ?? {};
  const isAnonymous = !!user?.is_anonymous;
  // A real (signed-in) user has an email and is not anonymous.
  // Anonymous Supabase users + offline-demo guests both lack a real account.
  const isSignedIn = !!user && !isAnonymous;
  const isGuest = !isSignedIn;
  const currentEmoji = (state.equipped.avatar?.item_id as string) ?? (state.equipped.avatar?.emoji as string) ?? '👤';
  const avatarLocked = (id: string) => {
    const itemId = PAID_AVATAR_ITEMS[id] ?? (id.startsWith('avatar_rare_') ? id : null);
    return !!itemId && (isGuest || !state.inventory.includes(itemId));
  };
  const displayName = profile.display_name || profile.username || (isGuest ? 'Guest' : 'Player');

  root.innerHTML = `
    <section class="view">
      <div class="top-bar">
        <button class="icon-btn" id="prof-back" aria-label="Back">
          ${ic.back(26)}
        </button>
        <h2 style="margin:0;font-size:16px;color:var(--app-text);">
          ${ic.profile(24)} Profile
        </h2>
        <span style="width:38px;"></span>
      </div>
      <div class="profile-hero">
        <button class="profile-avatar" id="prof-avatar-btn" title="Change avatar" style="padding:0; overflow:hidden; display:inline-flex; align-items:center; justify-content:center;">
          ${profile.avatar_url && !state.equipped.avatar?.item_id ? `<img src="${profile.avatar_url}" style="width:100%; height:100%; object-fit:cover;" />` : avatarArtHTML(currentEmoji, 76)}
        </button>
        <input type="file" id="prof-file-input" style="display:none;" accept="image/*" />
        <div class="profile-name">
          <span id="prof-name">${escapeHtml(displayName)}</span>
          <button class="icon-btn--ghost" id="prof-edit-name" title="Edit name">
${ic.notes(26)}
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
          ${ic.share(14)} Share Profile
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
        <button class="profile-row" id="prof-collection"><span>${ic.shop(24)} My Collection<br><small>Themes and avatars you own</small></span><span>›</span></button>
        <button class="profile-row" id="prof-stats">
          <span style="display:flex;align-items:center;gap:10px;">
            ${ic.stats(16)}
            <span><span style="color:var(--app-text)">Stats</span><br><small>Detailed game history</small></span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="profile-row" id="prof-ach">
          <span style="display:flex;align-items:center;gap:10px;">
            ${ic.badge(16)}
            <span><span style="color:var(--app-text)">Medals</span><br><small>Unlock badges</small></span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="profile-row" id="prof-recap">
          <span style="display:flex;align-items:center;gap:10px;">
            ${ic.daily(16)}
            <span><span style="color:var(--app-text)">Weekly Recap</span><br><small>This week's highlights</small></span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="profile-row" id="prof-ledger">
          <span style="display:flex;align-items:center;gap:10px;">
            ${ic.coin(16)}
            <span><span style="color:var(--app-text)">Coin Ledger</span><br><small>Earned and spent</small></span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="profile-row" id="prof-settings">
          <span style="display:flex;align-items:center;gap:10px;">
            ${ic.puzzle(16)}
            <span><span style="color:var(--app-text)">Settings</span><br><small>Game options, community, help</small></span>
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

    </section>


    <div id="avatar-picker-bg" class="modal-bg">
      <div class="modal profile-picker" role="dialog" aria-modal="true" aria-labelledby="avatar-picker-title">
        <button class="modal-close" id="avatar-picker-close" aria-label="Close avatar picker">${ic.close(24)}</button>
        <h2 id="avatar-picker-title">Choose your avatar</h2>
      <div id="avatar-grid" class="avatar-grid">
        ${[...AVATAR_OPTIONS, ...RARE_AVATAR_CATALOG.map(item => ({ id: item.id, name: item.name, art: (size = 48) => avatarArtHTML(item.id, size) }))].sort((a, b) => Number(avatarLocked(a.id)) - Number(avatarLocked(b.id))).map(option => {
          const itemId = PAID_AVATAR_ITEMS[option.id] ?? (option.id.startsWith('avatar_rare_') ? option.id : null);
          const locked = !!itemId && (isGuest || !state.inventory.includes(itemId));
          return `<button class="avatar-cell${(option.id === currentEmoji || itemId === currentEmoji) ? ' selected' : ''}${locked ? ' avatar-cell--locked' : ''}" data-emoji="${option.id}" ${itemId ? `data-item-id="${itemId}"` : ''} aria-label="${option.name}${locked ? ' — Locked, available in Shop' : ''}"><span class="avatar-cell-art">${option.art(48)}</span>${locked ? `<span class="avatar-cell-lock" aria-hidden="true">${ic.lock(14)}</span>` : ''}</button>`;
        }).join('')}
      </div>

      </div>
    </div>
    <div id="rename-bg" class="modal-bg">
      <form class="modal profile-rename" role="dialog" aria-modal="true" aria-labelledby="rename-title" id="rename-form">
        <button type="button" class="modal-close" id="rename-close" aria-label="Close rename">${ic.close(24)}</button>
        <h2 id="rename-title">Choose your name</h2>
        <label for="rename-input">Display name</label>
        <input id="rename-input" name="display-name" maxlength="20" required autocomplete="nickname">
        <p id="rename-error" role="alert"></p>
        <button class="btn btn--primary" type="submit">Save name</button>
      </form>
    </div>
    <!-- Modal Options Dialog for Avatar -->
    <div id="avatar-modal-bg" class="modal-bg">
      <div class="modal" style="position: relative;">
        <button class="modal-close" id="avatar-modal-close" aria-label="Close">${ic.close(24)}</button>
        <h2 style="margin: 0 0 16px 0; font-size: 18px; text-align: center;">Edit Profile Picture</h2>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="btn btn--primary" id="avatar-opt-upload" style="width: 100%;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Photo
          </button>
          <button class="btn btn--secondary" id="avatar-opt-emoji" style="width: 100%;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:6px"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            Choose Avatar
          </button>
          <button class="btn btn--danger" id="avatar-opt-remove" style="width: 100%; display: ${profile.avatar_url && !state.equipped.avatar?.item_id ? 'block' : 'none'};">
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

  const picker = root.querySelector<HTMLElement>('#avatar-picker-bg')!;
  const openPicker = () => { picker.classList.add('active'); picker.querySelector<HTMLButtonElement>('.avatar-cell.selected')?.focus(); };
  const closePicker = () => { picker.classList.remove('active'); avatarBtn.focus(); };
  root.querySelector('#avatar-picker-close')?.addEventListener('click', closePicker);
  picker.addEventListener('click', e => { if (e.target === picker) closePicker(); });

  avatarBtn.addEventListener('click', () => {
    if (isGuest) {
      openPicker();
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
      openPicker();
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
        avatarBtn.innerHTML = avatarArtHTML(emoji, 76);
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
      const itemId = cell.dataset.itemId;
      if (cell.disabled) return;
      if (itemId && (isGuest || !useStore.getState().inventory.includes(itemId))) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-bg active';
        overlay.innerHTML = `<div class="modal avatar-unlock-dialog" role="dialog" aria-modal="true" aria-labelledby="avatar-unlock-title"><button class="modal-close" aria-label="Close">${ic.close(24)}</button>${avatarArtHTML(emoji, 80)}<h2 id="avatar-unlock-title">Unlock this avatar</h2><p>Purchase this avatar in the Shop to use it.</p><button class="btn btn--primary" data-open-shop>Go to Shop</button></div>`;
        root.appendChild(overlay);
        const dismiss = () => { overlay.remove(); cell.focus(); };
        overlay.querySelector('.modal-close')?.addEventListener('click', dismiss);
        overlay.addEventListener('click', event => { if (event.target === overlay) dismiss(); });
        overlay.querySelector<HTMLButtonElement>('[data-open-shop]')?.addEventListener('click', () => {
          overlay.remove();
          closePicker();
          props.onShopAvatar(itemId);
        });
        overlay.querySelector<HTMLButtonElement>('[data-open-shop]')?.focus();
        return;
      }
      if (itemId) {
        cell.disabled = true;
        try {
          const { error } = await api.equipItem({ avatar: { item_id: itemId } });
          if (error) throw error;
        } catch {
          props.onToast('Unable to equip avatar');
          return;
        } finally {
          cell.disabled = false;
        }
      }
      avatarGrid.querySelectorAll('.avatar-cell').forEach((c) => c.classList.remove('selected'));
      cell.classList.add('selected');
      avatarBtn.innerHTML = avatarArtHTML(emoji, 76);
      const newAvatar = itemId ? { item_id: itemId } : { emoji };
      if (isGuest) saveGuestIdentity({ ...getGuestIdentity(), emoji });
      closePicker();
      useStore.getState().setEquipped({ avatar: newAvatar });

      try {
        if (!isGuest) {
          await api.updateProfile({ avatar_url: null });
          useStore.setState({
            profile: { ...(useStore.getState().profile ?? {}), avatar_url: undefined }
          });
          if (optRemove) optRemove.style.display = 'none';
        }
        if (!isGuest && !itemId) await api.equipItem({ avatar: newAvatar });
      } catch {
        // local-only fallback
      }
      props.onToast('Avatar updated');
    });
  });


  const rename = root.querySelector<HTMLElement>('#rename-bg')!;
  const nameInput = root.querySelector<HTMLInputElement>('#rename-input')!;
  const nameError = root.querySelector<HTMLElement>('#rename-error')!;
  const editName = root.querySelector<HTMLButtonElement>('#prof-edit-name')!;
  const closeRename = () => { rename.classList.remove('active'); editName.focus(); };
  editName.addEventListener('click', () => {
    nameInput.value = useStore.getState().profile?.display_name || displayName;
    nameError.textContent = '';
    rename.classList.add('active');
    nameInput.focus();
    nameInput.select();
  });
  root.querySelector('#rename-close')?.addEventListener('click', closeRename);
  rename.addEventListener('click', e => { if (e.target === rename) closeRename(); });
  root.querySelector('#rename-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const trimmed = nameInput.value.trim().slice(0, 20);
    if (!trimmed) { nameError.textContent = 'Please enter a name.'; return; }
    const submit = root.querySelector<HTMLButtonElement>('#rename-form button[type="submit"]')!;
    submit.disabled = true;
    try {
      if (isGuest) saveGuestIdentity({ ...getGuestIdentity(), name: trimmed, generated: false });
      else await api.updateProfile({ display_name: trimmed });
      useStore.setState({ profile: { ...(useStore.getState().profile ?? {}), display_name: trimmed } });
      root.querySelector('#prof-name')!.textContent = trimmed;
      closeRename();
      props.onToast('Name updated');
    } catch {
      nameError.textContent = 'Could not update name. Please try again.';
    } finally { submit.disabled = false; }
  });
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (picker.classList.contains('active')) closePicker();
      if (rename.classList.contains('active')) closeRename();
      avatarModal.classList.remove('active');
    }
  };
  root.addEventListener('keydown', onKey);

  root.querySelector('#prof-back')?.addEventListener('click', props.onBack);
  root.querySelector('#prof-collection')?.addEventListener('click', props.onOpenCollection);
  root.querySelector('#prof-stats')?.addEventListener('click', props.onOpenStats);
  root.querySelector('#prof-ach')?.addEventListener('click', props.onOpenAchievements);
  root.querySelector('#prof-recap')?.addEventListener('click', props.onOpenRecap);
  root.querySelector('#prof-ledger')?.addEventListener('click', props.onOpenLedger);
  root.querySelector('#prof-settings')?.addEventListener('click', props.onOpenSettings);
  root.querySelector('#prof-signout')?.addEventListener('click', props.onSignOut);
  root.querySelector('#prof-upgrade')?.addEventListener('click', props.onUpgradeAccount);

  root.querySelector('#prof-share-card')?.addEventListener('click', async () => {
    const st = useStore.getState();
    const uid = st.user?.id;
    let referralCode = '';
    try { if (uid) referralCode = await api.getReferralCode(uid); } catch { /* ignore */ }

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
      onToast: props.onToast,
    });
  });

  return { unmount() { root.removeEventListener('keydown', onKey); } };
}
