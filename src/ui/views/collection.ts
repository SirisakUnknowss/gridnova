import * as api from '@lib/api';
import { framePreviewHTML } from '../components/avatar-frame';
import { useStore, accountScope } from '@state/store';
import { applyTheme, THEMES } from '@lib/themes';
import { THEME_BACKGROUNDS } from '@lib/theme-backgrounds';
import { escapeHtml } from '@lib/format';
import { getGuestIdentity, saveGuestIdentity } from '@lib/guest-identity';
import { AVATAR_OPTIONS, PAID_AVATAR_ITEMS, avatarArtHTML, shopAvatarName } from '../components/avatar-art';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { applyBackground, BACKGROUNDS } from '@lib/backgrounds';
import { applyBoardColorFromItem, type BoardColorVars } from '@lib/board-colors';
import { ic } from '@ui/icons';
interface Item { id: string; category: string; name: string; price_coin: number; emoji?: string; metadata?: { css_vars?: Partial<BoardColorVars> } }
export function mountCollectionView(root: HTMLElement, props: { onBack: () => void; onShop: () => void; onToast: (message: string) => void; nav: BottomNavCallbacks }) {
  const currentAccount = accountScope();
  let category = 'theme';
  let items: Item[] = [];
  let alive = true;
  root.innerHTML = `<section class="view view--shop"><div class="top-bar"><button class="icon-btn" id="collection-back" aria-label="Back">${ic.back(26)}</button><h2>My Collection</h2><span></span></div><div class="shop-tabs collection-tabs"><button class="shop-tab active" data-category="theme">Themes</button><button class="shop-tab" data-category="avatar">Avatars</button><button class="shop-tab" data-category="avatar_frame">Frames</button><button class="shop-tab" data-category="background">Backgrounds</button><button class="shop-tab" data-category="board_color">Board colors</button></div><div class="shop-grid" id="collection-grid">Loading…</div><button class="btn collection-shop-button" id="collection-shop">${ic.shop(26)}<span>Visit Shop</span>${ic.chevronRight(18)}</button></section>${bottomNavHTML('profile')}`;
  wireBottomNav(root, props.nav, 'profile');
  root.querySelector('#collection-back')?.addEventListener('click', props.onBack);
  root.querySelector('#collection-shop')?.addEventListener('click', props.onShop);
  root.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.category!;
    root.querySelectorAll('[data-category]').forEach(tab => tab.classList.toggle('active', (tab as HTMLElement).dataset.category === category));
    render();
  }));
  function render() {
    if (!alive || !currentAccount()) return;
    const state = useStore.getState();
    const grid = root.querySelector<HTMLElement>('#collection-grid')!;
    const visible = items.filter(item => item.category === category);
    grid.innerHTML = visible.map(item => {
      const equipped = item.category === 'background' ? (state.equipped.background_id ?? 'bg_default') === item.id : item.category === 'board_color' ? (state.equipped.board_color_id ?? 'board_default') === item.id : item.category === 'avatar_frame' ? (state.equipped.frame_id ?? 'frame_none') === item.id : item.category === 'theme' ? (state.equipped.theme_id ?? 'theme_classic') === item.id : item.emoji ? state.equipped.avatar.emoji === item.emoji && !state.equipped.avatar.item_id : state.equipped.avatar.item_id === item.id;
      const swatchStyle = Object.entries(item.metadata?.css_vars ?? {}).filter(([key]) => ['--board-cell-bg', '--board-cell-given', '--board-highlight'].includes(key)).map(([key, value]) => `${key}:${value}`).join(';');
      const preview = item.category === 'background' ? `<div class="collection-background-preview ${BACKGROUNDS[item.id]?.className ?? 'bg-default'}"></div>` : item.category === 'board_color' ? `<div class="collection-board-preview" style="${escapeHtml(swatchStyle)}">${[1,2,3,4,5,6,7,8,9].map(n => `<span>${n}</span>`).join('')}</div>` : item.category === 'theme' ? `<img class="collection-theme-art" src="${THEME_BACKGROUNDS[item.id]}" alt="">` : item.category === 'avatar_frame' ? framePreviewHTML(item.id, state.equipped.avatar.item_id as string ?? state.equipped.avatar.emoji) : avatarArtHTML(item.emoji ?? item.id, 88);
      return `<div class="shop-card"><div class="shop-preview">${preview}</div><div class="shop-name">${escapeHtml(item.name)}</div><div class="shop-action">${equipped ? '<span class="quest-tag">✓ Equipped</span>' : `<button class="btn btn--small" data-equip="${escapeHtml(item.id)}">${item.id === 'frame_none' ? 'Remove frame' : 'Equip'}</button>`}</div></div>`;
    }).join('') || '<p>No items yet. Discover your next treasure in the Shop.</p>';
    grid.querySelectorAll<HTMLButtonElement>('[data-equip]').forEach(button => button.addEventListener('click', async () => {
      const item = items.find(candidate => candidate.id === button.dataset.equip)!;
      const avatar = item.emoji ? { emoji: item.emoji } : { item_id: item.id };
      const payload = item.category === 'background' ? { background_id: item.id } : item.category === 'board_color' ? { board_color_id: item.id } : item.category === 'avatar_frame' ? { frame_id: item.id === 'frame_none' ? null : item.id } : item.category === 'theme' ? { theme_id: item.id } : { avatar };
      button.disabled = true;
      try {
        if (state.user && !state.user.is_anonymous) {
          const { error } = await api.equipItem(payload);
          if (!currentAccount()) return;
          if (error) throw error;
          if (item.category === 'avatar') {
            await api.updateProfile({ avatar_url: null });
            if (!currentAccount()) return;
            useStore.setState({ profile: { ...useStore.getState().profile, avatar_url: undefined } });
          }
        } else if (item.category === 'avatar') {
          if (!item.emoji) return;
          saveGuestIdentity({ ...getGuestIdentity(), emoji: item.emoji });
        }
        if (!alive || !currentAccount()) return;
        useStore.getState().setEquipped(payload);
        if (item.category === 'theme') applyTheme(item.id);
        if (item.category === 'background') applyBackground(item.id);
        if (item.category === 'board_color') applyBoardColorFromItem(item);
        props.onToast(item.id === 'frame_none' ? 'Frame removed' : `${item.name} equipped`);
        render();
      } catch { if (alive && currentAccount()) { props.onToast('Could not equip item'); button.disabled = false; } }
    }));
  }
  void (async () => {
    try {
      const state = useStore.getState();
      const member = !!state.user && !state.user.is_anonymous;
      const inventory = member ? await api.getInventory() : [];
      if (!alive || !currentAccount()) return;
      const catalog = await api.getCollectionItems(inventory.map((row: { item_id: string }) => row.item_id));
      if (!alive || !currentAccount()) return;
      if (member) state.setInventory((inventory ?? []).map((row: { item_id: string }) => row.item_id));
      items = (catalog as Item[]).filter(item => ['theme', 'avatar', 'avatar_frame', 'background', 'board_color'].includes(item.category) && (item.price_coin === 0 || (member && useStore.getState().inventory.includes(item.id)))).map(item => ({ ...item, emoji: item.id === 'avatar_face_happy' ? 'space_orbit-bunny' : undefined, name: item.category === 'avatar' ? shopAvatarName(item.id) ?? item.name : item.id === 'theme_neon' ? 'Sky Citadel' : item.name }));
      if (member) items.unshift({ id: 'frame_none', category: 'avatar_frame', name: 'No frame', price_coin: 0 });
      for (const option of AVATAR_OPTIONS.filter(option => !PAID_AVATAR_ITEMS[option.id] && option.id !== 'space_orbit-bunny')) items.push({ id: option.id, emoji: option.id, category: 'avatar', name: option.name, price_coin: 0 });
      items = items.filter(item => item.category !== 'theme' || THEMES[item.id]);
      render();
    } catch { if (alive && currentAccount()) root.querySelector('#collection-grid')!.textContent = 'Could not load your collection. Please try again.'; }
  })();
  return { unmount() { alive = false; } };
}
