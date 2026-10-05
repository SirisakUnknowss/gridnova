import * as api from '@lib/api';
import { useStore } from '@state/store';
import { applyTheme, THEMES } from '@lib/themes';
import { THEME_BACKGROUNDS } from '@lib/theme-backgrounds';
import { escapeHtml } from '@lib/format';
import { getGuestIdentity, saveGuestIdentity } from '@lib/guest-identity';
import { AVATAR_OPTIONS, PAID_AVATAR_ITEMS, avatarArtHTML, shopAvatarName } from '../components/avatar-art';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
interface Item { id: string; category: string; name: string; price_coin: number; emoji?: string }
export function mountCollectionView(root: HTMLElement, props: { onBack: () => void; onShop: () => void; onToast: (message: string) => void; nav: BottomNavCallbacks }) {
  let category = 'theme';
  let items: Item[] = [];
  let alive = true;
  root.innerHTML = `<section class="view view--shop"><div class="top-bar"><button class="icon-btn" id="collection-back" aria-label="Back">${ic.back(26)}</button><h2>My Collection</h2><span></span></div><div class="shop-tabs"><button class="shop-tab active" data-category="theme">Themes</button><button class="shop-tab" data-category="avatar">Avatars</button></div><div class="shop-grid" id="collection-grid">Loading…</div><button class="btn collection-shop-button" id="collection-shop">${ic.shop(26)}<span>Visit Shop</span>${ic.chevronRight(18)}</button></section>${bottomNavHTML('profile')}`;
  wireBottomNav(root, props.nav, 'profile');
  root.querySelector('#collection-back')?.addEventListener('click', props.onBack);
  root.querySelector('#collection-shop')?.addEventListener('click', props.onShop);
  root.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.category!;
    root.querySelectorAll('[data-category]').forEach(tab => tab.classList.toggle('active', (tab as HTMLElement).dataset.category === category));
    render();
  }));
  function render() {
    if (!alive) return;
    const state = useStore.getState();
    const grid = root.querySelector<HTMLElement>('#collection-grid')!;
    const visible = items.filter(item => item.category === category);
    grid.innerHTML = visible.map(item => {
      const equipped = item.category === 'theme' ? (state.equipped.theme_id ?? 'theme_classic') === item.id : item.emoji ? state.equipped.avatar.emoji === item.emoji && !state.equipped.avatar.item_id : state.equipped.avatar.item_id === item.id;
      return `<div class="shop-card"><div class="shop-preview">${item.category === 'theme' ? `<img class="collection-theme-art" src="${THEME_BACKGROUNDS[item.id]}" alt="">` : avatarArtHTML(item.emoji ?? item.id, 88)}</div><div class="shop-name">${escapeHtml(item.name)}</div><div class="shop-action">${equipped ? '<span class="quest-tag">✓ Equipped</span>' : `<button class="btn btn--small" data-equip="${escapeHtml(item.id)}">Equip</button>`}</div></div>`;
    }).join('') || '<p>No items yet. Discover your next treasure in the Shop.</p>';
    grid.querySelectorAll<HTMLButtonElement>('[data-equip]').forEach(button => button.addEventListener('click', async () => {
      const item = items.find(candidate => candidate.id === button.dataset.equip)!;
      const avatar = item.emoji ? { emoji: item.emoji } : { item_id: item.id };
      const payload = item.category === 'theme' ? { theme_id: item.id } : { avatar };
      button.disabled = true;
      try {
        if (state.user && !state.user.is_anonymous) {
          const { error } = await api.equipItem(payload);
          if (error) throw error;
          if (item.category === 'avatar') {
            await api.updateProfile({ avatar_url: null });
            useStore.setState({ profile: { ...useStore.getState().profile, avatar_url: undefined } });
          }
        } else if (item.category === 'avatar') {
          if (!item.emoji) return;
          saveGuestIdentity({ ...getGuestIdentity(), emoji: item.emoji });
        }
        if (!alive) return;
        useStore.getState().setEquipped(payload);
        if (item.category === 'theme') applyTheme(item.id);
        props.onToast(`${item.name} equipped`);
        render();
      } catch { props.onToast('Could not equip item'); button.disabled = false; }
    }));
  }
  void (async () => {
    try {
      const state = useStore.getState();
      const member = !!state.user && !state.user.is_anonymous;
      const [catalog, inventory] = await Promise.all([api.getShopItems(), member ? api.getInventory() : Promise.resolve([])]);
      if (!alive) return;
      if (member) state.setInventory((inventory ?? []).map((row: { item_id: string }) => row.item_id));
      items = (catalog as Item[]).filter(item => ['theme', 'avatar'].includes(item.category) && (item.price_coin === 0 || (member && useStore.getState().inventory.includes(item.id)))).map(item => ({ ...item, emoji: item.id === 'avatar_face_happy' ? 'space_orbit-bunny' : undefined, name: item.category === 'avatar' ? shopAvatarName(item.id) ?? item.name : item.id === 'theme_neon' ? 'Sky Citadel' : item.name }));
      for (const option of AVATAR_OPTIONS.filter(option => !PAID_AVATAR_ITEMS[option.id] && option.id !== 'space_orbit-bunny')) items.push({ id: option.id, emoji: option.id, category: 'avatar', name: option.name, price_coin: 0 });
      items = items.filter(item => item.category !== 'theme' || THEMES[item.id]);
      render();
    } catch { if (alive) root.querySelector('#collection-grid')!.textContent = 'Could not load your collection. Please try again.'; }
  })();
  return { unmount() { alive = false; } };
}
