import { homeViewHTML } from './home';
import { RARE_AVATAR_CATALOG } from '@lib/rare-avatar-catalog';
import { THEME_BACKGROUNDS } from '@lib/theme-backgrounds';
import { avatarArtHTML, shopAvatarName } from '../components/avatar-art';
import { framePreviewHTML } from '../components/avatar-frame';
import { pageArtHTML } from '../components/page-art';
// =====================================================================
// Shop view — browse / purchase / equip items
// =====================================================================
import * as api from '@lib/api';
import { useStore } from '@state/store';
import { escapeHtml, formatNumber } from '@lib/format';
import { applyTheme, THEMES } from '@lib/themes';
import { countUp, floatReward } from '@lib/animate';
import { PREMIUM_THEMES, isPremium } from '@lib/premium';
import { showPaywall } from './paywall';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { sfxThemeChange, sfxCoin } from '@lib/sound';

export interface ShopProps {
  avatarItemId?: string;
  onBack: () => void;
  onToast: (msg: string) => void;
  nav: BottomNavCallbacks;
}

type Category = 'theme' | 'avatar' | 'avatar_frame';

interface ShopItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price_coin: number;
  rarity: string | null;
  unlock_type: string;
  available: boolean;
  sort_order: number;
  metadata?: Record<string, unknown>;
  catalogPending?: boolean;
}

const RARITY_LABEL: Record<string, string> = {
  common: '◯ COMMON', rare: '◉ RARE', epic: '◈ EPIC', legendary: '★ LEGENDARY',
};

function avatarPreviewIcon(id: string): string { return avatarArtHTML(id, 88); }

function themePreview(id: string): string {
  const theme = THEMES[id] ?? THEMES.theme_classic;
  const tokens = { ...THEMES.theme_classic.tokens, ...theme.tokens };
  const style = Object.entries(tokens).map(([key, value]) => key + ':' + value).join(';');
  return `<div class="shop-theme-sample" style="${escapeHtml(style)};background-image:url(&quot;${escapeHtml(THEME_BACKGROUNDS[id])}&quot;)" aria-hidden="true"><div class="shop-theme-top"></div><div class="shop-theme-board">${[1, '', 3, '', 5, '', 7, '', 9].map((value, i) => `<span class="${i === 4 ? 'selected' : ''}">${value}</span>`).join('')}</div></div>`;
}

const AVATAR_SHOP_IDS = new Set(['avatar_face_happy', 'avatar_face_cool', 'avatar_face_nerd', 'avatar_face_lion', 'avatar_hat_cap', 'avatar_pet_dog', 'avatar_pet_cat', 'avatar_pet_dragon']);

const CATEGORY_TABS: { key: Category; label: string }[] = [
  { key: 'theme', label: 'Themes' },
  { key: 'avatar', label: 'Avatars' },
  { key: 'avatar_frame', label: 'Frames' },
];

export function mountShopView(root: HTMLElement, props: ShopProps): { unmount: () => void } {
  let activeCat: Category = props.avatarItemId ? 'avatar' : 'theme';
  let pendingAvatar = props.avatarItemId;
  let items: ShopItem[] = [];
  let loading = true;
  let errorMsg: string | null = null;
  let framePreview: HTMLElement | null = null;
  let dismissThemePreview: (() => void) | null = null;

  function showThemePreview(item: ShopItem, trigger: HTMLButtonElement) {
    dismissThemePreview?.();
    const overlay = document.createElement('div');
    overlay.className = 'modal-bg active';
    overlay.innerHTML = `<div class="modal theme-preview-modal" role="dialog" aria-modal="true" aria-labelledby="theme-preview-title"><button class="modal-close" aria-label="Close preview">${ic.close(24)}</button><h2 id="theme-preview-title">${escapeHtml(item.name)}</h2><div class="theme-preview-viewport"><div class="theme-preview-home"><div class="theme-preview-content"></div></div></div></div>`;
    const scene = overlay.querySelector<HTMLElement>('.theme-preview-home')!;
    applyTheme(item.id, scene);
    const content = scene.querySelector<HTMLElement>('.theme-preview-content')!;
    content.innerHTML = homeViewHTML();
    content.inert = true;
    const viewport = overlay.querySelector<HTMLElement>('.theme-preview-viewport')!;
    const fitScene = () => {
      const height = content.offsetHeight;
      if (!height) return;
      const scale = Math.min(viewport.clientWidth / 390, viewport.clientHeight / height, 1);
      scene.style.width = `${390 * scale}px`;
      scene.style.height = `${height * scale}px`;
      content.style.transform = `scale(${scale})`;
    };
    const resize = new ResizeObserver(fitScene);
    resize.observe(viewport);
    resize.observe(content);
    const close = () => {
      resize.disconnect();
      overlay.remove();
      dismissThemePreview = null;
      if (trigger.isConnected) trigger.focus();
    };
    dismissThemePreview = close;
    overlay.querySelector('button')?.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { e.preventDefault(); overlay.querySelector<HTMLButtonElement>('button')?.focus(); }
    });
    document.body.appendChild(overlay);
    fitScene();
    overlay.querySelector<HTMLButtonElement>('button')?.focus();
  }

  root.innerHTML = `
    <section class="view view--shop">
      <div class="top-bar">
        <button class="icon-btn" id="shop-back" aria-label="Back">
          ${ic.back(26)}
        </button>
        <h2 style="margin:0;font-size:16px;color:var(--app-text);">
          ${ic.shop(26)} Shop
        </h2>
        <span class="stat-pill">${ic.coin(12)} <span id="shop-coin-balance">${formatNumber(useStore.getState().coins)}</span></span>
      </div>
      ${pageArtHTML('shop')}

      <div class="shop-tabs">
        ${CATEGORY_TABS.map((t) => `
          <button class="shop-tab${t.key === activeCat ? ' active' : ''}" data-cat="${t.key}">${escapeHtml(t.label)}</button>
        `).join('')}
      </div>

      <div class="shop-grid" id="shop-grid"></div>
    </section>
    ${bottomNavHTML('shop')}
  `;
  wireBottomNav(root, props.nav, 'shop');

  const gridEl = root.querySelector<HTMLElement>('#shop-grid')!;

  function refreshCoinBadge(prev?: number) {
    const pill = root.querySelector<HTMLElement>('#shop-coin-balance');
    if (!pill) return;
    const now = useStore.getState().coins;
    if (typeof prev === 'number') {
      countUp(pill, prev, now, 600, (n) => formatNumber(Math.round(n)));
    } else {
      pill.textContent = formatNumber(now);
    }
  }

  function render() {
    if (loading) {
      gridEl.innerHTML = `<div class="shop-loading">Loading items…</div>`;
      return;
    }
    if (errorMsg) {
      gridEl.innerHTML = `<div class="lb-empty"><p>${ic.warning(16)} ${escapeHtml(errorMsg)}</p>
        <button class="btn btn--small" id="shop-retry">Retry</button></div>`;
      gridEl.querySelector('#shop-retry')?.addEventListener('click', () => void load());
      return;
    }
    const filtered = items.filter((item) => item.category === activeCat);
    if (!filtered.length) {
      gridEl.innerHTML = `<div class="lb-empty"><p>${ic.empty(20)} No items here.</p></div>`;
      return;
    }

    const state = useStore.getState();
    const owned = new Set(state.inventory);
    const equipped = state.equipped;

    gridEl.innerHTML = filtered.map((item) => {
      const isOwned = owned.has(item.id) || item.price_coin === 0;
      const isEquipped =
        (item.category === 'theme' && equipped.theme_id === item.id) ||
        (item.category === 'avatar' && equipped.avatar?.item_id === item.id) ||
        (item.category === 'avatar_frame' && equipped.frame_id === item.id);
      const canAfford = state.coins >= item.price_coin;
      const rarity = item.rarity ?? 'common';
      const requiredTheme = item.category === 'avatar' && typeof item.metadata?.theme_id === 'string' ? item.metadata.theme_id : null;
      const themeLocked = !!requiredTheme && !owned.has(requiredTheme) && !items.some(theme => theme.id === requiredTheme && theme.price_coin === 0);

      const isPremiumGated = PREMIUM_THEMES.has(item.id) && !isOwned && !isPremium();
      let action = '';
      if ((!state.user || state.user.is_anonymous) && item.category === 'theme') {
        action = isEquipped ? '<span class="quest-tag">✓ Equipped</span>' : `<button class="btn btn--small" data-equip="${escapeHtml(item.id)}">Try theme</button>`;
      } else if (!isOwned && themeLocked) {
        action = `<button class="btn btn--small" disabled>${ic.lock(14)} Unlock theme first</button>`;
      } else if (!state.user || state.user.is_anonymous) {
        action = '<button class="btn btn--small" data-signin>Sign in</button>';
      } else if (isEquipped) {
        action = `<span class="quest-tag">✓ Equipped</span>`;
      } else if (isOwned) {
        action = `<button class="btn btn--small" data-equip="${escapeHtml(item.id)}">Equip</button>`;
      } else if (item.catalogPending) {
        action = '<button class="btn btn--small" disabled>Coming soon</button>';
      } else if (isPremiumGated) {
        action = `<button class="btn btn--small" data-premium="${escapeHtml(item.id)}">${ic.sparkle(13)} Premium</button>`;
      } else {
        action = `<button class="btn btn--small" data-buy="${escapeHtml(item.id)}" ${canAfford ? '' : 'disabled'}>${ic.coin(12)} ${item.price_coin}</button>`;
      }

      let preview = ic.gift(48);
      if (item.category === 'theme') preview = themePreview(item.id);
      else if (item.category === 'avatar') preview = avatarPreviewIcon(item.id);
      else if (item.category === 'avatar_frame') preview = framePreviewHTML(item.id, state.equipped.avatar.item_id as string ?? state.equipped.avatar.emoji);

      const previewable = item.category === 'theme';
      const matchedTheme = previewable ? item.id : typeof item.metadata?.theme_id === 'string' ? item.metadata.theme_id : null;
      return `
        <div class="shop-card shop-rarity-${rarity}${previewable ? ' shop-card--theme' : ''}" data-shop-item="${escapeHtml(item.id)}" data-preview="${previewable ? escapeHtml(item.id) : ''}" ${matchedTheme ? `style="--shop-card-image:url(&quot;${escapeHtml(THEME_BACKGROUNDS[matchedTheme])}&quot;)"` : ''}>
          ${isPremiumGated ? `<div class="shop-premium-badge" title="Premium-only">${ic.sparkle(12)}</div>` : ''}
          <div class="shop-preview">${preview}</div>
          <div class="shop-name">${escapeHtml(item.name)}</div>
          ${item.description ? `<div class="shop-desc">${escapeHtml(item.description)}</div>` : ''}
          <div class="shop-price">${item.price_coin === 0 ? 'Free' : ic.coin(16) + ' ' + formatNumber(item.price_coin)}</div><div class="shop-rarity">${RARITY_LABEL[rarity] ?? escapeHtml(rarity)}</div>
          ${item.category === 'theme' ? `<button class="theme-preview-button" data-theme-preview="${escapeHtml(item.id)}" aria-label="Preview ${escapeHtml(item.name)}">${ic.search(20)}</button>` : ''}
          ${item.category === 'avatar_frame' ? `<button class="frame-preview-button" data-frame-preview="${escapeHtml(item.id)}">Preview</button>` : ''}
          <div class="shop-action">${action}</div>
        </div>
      `;
    }).join('');

    if (pendingAvatar) {
      const target = Array.from(gridEl.querySelectorAll<HTMLElement>('[data-shop-item]')).find(card => card.dataset.shopItem === pendingAvatar);
      if (target) {
        target.scrollIntoView({ block: 'center', behavior: 'instant' });
        target.classList.add('shop-card--target');
        pendingAvatar = undefined;
      }
    }

    gridEl.querySelectorAll('[data-signin]').forEach(btn => btn.addEventListener('click', props.nav.onProfile));
    gridEl.querySelectorAll<HTMLButtonElement>('[data-frame-preview]').forEach(btn => btn.addEventListener('click', () => {
      const item = items.find(candidate => candidate.id === btn.dataset.framePreview)!;
      const avatar = useStore.getState().equipped.avatar;
      const overlay = document.createElement('div');
      framePreview?.remove();
      framePreview = overlay;
      overlay.className = 'modal-bg active';
      overlay.innerHTML = `<div class="modal frame-preview-modal" role="dialog" aria-modal="true" aria-label="Frame preview"><button class="modal-close" aria-label="Close preview">${ic.close(24)}</button><div class="frame-preview-large">${framePreviewHTML(item.id, avatar.item_id as string ?? avatar.emoji)}</div><h2>${escapeHtml(item.name)}</h2><p>Preview only — your equipped frame stays unchanged.</p></div>`;
      overlay.querySelector('button')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
      overlay.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.remove(); });
      document.body.appendChild(overlay);
      overlay.querySelector<HTMLButtonElement>('button')?.focus();
    }));

    // Wire actions
    gridEl.querySelectorAll<HTMLButtonElement>('[data-buy]').forEach((btn) => {
      btn.addEventListener('click', () => void buy(btn.dataset.buy!, btn));
    });
    gridEl.querySelectorAll<HTMLButtonElement>('[data-equip]').forEach((btn) => {
      btn.addEventListener('click', () => void equip(btn.dataset.equip!, btn));
    });
    gridEl.querySelectorAll<HTMLButtonElement>('[data-premium]').forEach((btn) => {
      btn.addEventListener('click', () => {
        showPaywall({ source: `shop_premium_item:${btn.dataset.premium}`, onClose: () => {} });
      });
    });
    gridEl.querySelectorAll<HTMLButtonElement>('[data-theme-preview]').forEach(btn => btn.addEventListener('click', () => {
      const item = items.find(candidate => candidate.id === btn.dataset.themePreview);
      if (item) showThemePreview(item, btn);
    }));
  }

  let dismissPurchase: (() => void) | null = null;
  function confirmPurchase(item: ShopItem): Promise<boolean> {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-bg active';
      overlay.innerHTML = `
        <div class="modal shop-confirm" role="dialog" aria-modal="true" aria-labelledby="shop-confirm-title">
          <button class="modal-close" aria-label="Close purchase">${ic.close(24)}</button>
          <div class="shop-preview">${item.category === 'avatar' ? avatarPreviewIcon(item.id) : item.category === 'avatar_frame' ? framePreviewHTML(item.id, useStore.getState().equipped.avatar.item_id as string ?? useStore.getState().equipped.avatar.emoji) : themePreview(item.id)}</div>
          <h2 id="shop-confirm-title">Unlock ${escapeHtml(item.name)}?</h2>
          <p>${ic.coin(20)} ${formatNumber(item.price_coin)} coins</p>
          <div class="modal-buttons"><button class="btn btn--secondary" data-cancel>Cancel</button><button class="btn btn--primary" data-confirm>Buy</button></div>
        </div>`;
      const finish = (confirmed: boolean) => {
        overlay.remove();
        dismissPurchase = null;
        resolve(confirmed);
      };
      dismissPurchase = () => finish(false);
      overlay.querySelector('[data-confirm]')?.addEventListener('click', () => finish(true));
      overlay.querySelector('[data-cancel]')?.addEventListener('click', () => finish(false));
      overlay.querySelector('.modal-close')?.addEventListener('click', () => finish(false));
      overlay.addEventListener('click', e => { if (e.target === overlay) finish(false); });
      overlay.addEventListener('keydown', e => { if (e.key === 'Escape') finish(false); });
      document.body.appendChild(overlay);
      overlay.querySelector<HTMLButtonElement>('[data-cancel]')?.focus();
    });
  }

  async function buy(itemId: string, btn: HTMLButtonElement) {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.catalogPending) return;
    const requiredTheme = item.category === 'avatar' && typeof item.metadata?.theme_id === 'string' ? item.metadata.theme_id : null;
    if (requiredTheme && !useStore.getState().inventory.includes(requiredTheme) && !items.some(theme => theme.id === requiredTheme && theme.price_coin === 0)) {
      props.onToast('Unlock the matching theme first');
      return;
    }
    if (!useStore.getState().user || useStore.getState().user?.is_anonymous) { props.nav.onProfile(); return; }
    btn.disabled = true;
    if (!await confirmPurchase(item)) { btn.disabled = false; return; }
    btn.disabled = true; btn.textContent = '…';
    try {
      const { data, error } = await api.purchaseItem(itemId);
      if (error || !data?.success || typeof data.new_balance !== 'number') throw error ?? new Error('Purchase failed');
      const prevCoins = useStore.getState().coins;
      useStore.setState({ coins: data.new_balance });
      useStore.getState().addToInventory(itemId);
      sfxCoin();
      props.onToast(`${item.name} purchased!`);
      floatReward(btn, `−${item.price_coin}`);
      refreshCoinBadge(prevCoins);
      render();
    } catch (err) {
      console.warn('Purchase failed:', err);
      props.onToast('Purchase failed');
      btn.disabled = false; btn.innerHTML = `${ic.coin(12)} ${item.price_coin}`;
    }
  }

  async function equip(itemId: string, btn: HTMLButtonElement) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const state = useStore.getState();
    if (!state.user || state.user.is_anonymous) {
      if (item.category !== 'theme' || !THEMES[itemId]) return;
      state.setEquipped({ theme_id: itemId });
      applyTheme(itemId);
      sfxThemeChange();
      props.onToast(`${item.name} equipped`);
      render();
      return;
    }
    btn.disabled = true; btn.textContent = '…';
    const payload: { theme_id?: string; frame_id?: string; avatar?: { item_id: string } } = {};
    if (item.category === 'theme') payload.theme_id = itemId;

    if (item.category === 'avatar') payload.avatar = { item_id: itemId };
    if (item.category === 'avatar_frame') payload.frame_id = itemId;

    try {
      const { error } = await api.equipItem(payload);
      if (error) throw error;
      useStore.getState().setEquipped(payload);
      if (item.category === 'theme' && THEMES[itemId]) { applyTheme(itemId); sfxThemeChange(); }
      props.onToast(`✓ ${item.name} equipped`);
      render();
    } catch (err) {
      props.onToast('Could not equip item. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Equip';
    }
  }

  async function load() {
    loading = true; errorMsg = null; render();
    try {
      const [shopItems, inventory, equipped] = await Promise.all([
        api.getShopItems(),
        api.getInventory().catch(() => []),
        api.getEquipped().catch(() => null),
      ]);
      items = ((shopItems ?? []) as ShopItem[]).filter(item => item.category === 'theme' || item.category === 'avatar_frame' || (item.category === 'avatar' && (AVATAR_SHOP_IDS.has(item.id) || item.id.startsWith('avatar_rare_')))).map(item => item.category === 'avatar' ? { ...item, name: shopAvatarName(item.id) ?? item.name } : item.id === 'theme_neon' ? { ...item, name: 'Sky Citadel', description: 'A serene city above the clouds' } : item);
      useStore.getState().setInventory((inventory ?? []).map((r: { item_id: string }) => r.item_id));
      if (equipped) {
        useStore.getState().setEquipped({
          theme_id: equipped.theme_id ?? null,
          background_id: equipped.background_id ?? null,
          board_color_id: equipped.board_color_id ?? null,
          avatar: equipped.avatar ?? { emoji: '👤' },
          frame_id: equipped.frame_id ?? null,
        });
        if (equipped.theme_id) applyTheme(equipped.theme_id);
      }
      if (import.meta.env.DEV) {
        items = items.map(item => item.category === 'theme' && item.price_coin > 0 && item.price_coin !== 5000 ? { ...item, price_coin: 5000, catalogPending: true } : item);
        for (const rare of RARE_AVATAR_CATALOG) {
          if (!items.some(item => item.id === rare.id)) items.push({ ...rare, catalogPending: true });
        }
      }
      loading = false;
      render();
    } catch (err) {
      loading = false;
      errorMsg = (err as Error).message || 'Could not load shop.';
      render();
    }
  }

  // Tabs
  root.querySelectorAll<HTMLButtonElement>('.shop-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCat = btn.dataset.cat as Category;
      root.querySelectorAll<HTMLButtonElement>('.shop-tab').forEach((b) =>
        b.classList.toggle('active', b.dataset.cat === activeCat),
      );
      render();
    });
  });

  root.querySelector('#shop-back')?.addEventListener('click', props.onBack);

  void load();

  return {
    unmount() {
      dismissPurchase?.();
      framePreview?.remove();
      dismissThemePreview?.();
    },
  };
}
