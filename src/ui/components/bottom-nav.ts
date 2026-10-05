import { ic } from '@ui/icons';
// =====================================================================
// Shared bottom-nav — single source of truth for the 4-tab navigation
// =====================================================================
import { sfxNav } from '@lib/sound';

export type NavTab = 'home' | 'achievements' | 'shop' | 'profile';

export interface BottomNavCallbacks {
  onHome: () => void;
  onAchievements: () => void;
  onProfile: () => void;
  onShop: () => void;
}


const TABS: { key: NavTab; icon: (s?: number) => string; label: string; comingSoon?: boolean }[] = [
  { key: 'home',         icon: ic.home,         label: 'Home'    },
  { key: 'achievements', icon: ic.achievements, label: 'Medals'  },
  { key: 'shop',       icon: ic.shop,          label: 'Shop' },
  { key: 'profile',      icon: ic.profile,      label: 'Profile' },
];

export function bottomNavHTML(active: NavTab): string {
  return `
    <nav class="bottom-nav" data-nav>
      ${TABS.map((t) => `
        <button data-nav-tab="${t.key}" class="${t.key === active ? 'active' : ''}${t.comingSoon ? ' nav-coming-soon' : ''}" ${t.comingSoon ? 'disabled' : ''}>
          <span class="icon">${t.icon(22)}</span>
          <span>${t.label}${t.comingSoon ? '<span class="nav-soon-badge">Soon</span>' : ''}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

// `_active` is unused here (highlighting is bottomNavHTML's job) but kept in
// the signature so every call site still reads `wireBottomNav(root, nav,
// 'home')` right under its matching `bottomNavHTML('home')` — that pairing
// is the whole point of "single source of truth" for this component.
export function wireBottomNav(root: ParentNode, cb: BottomNavCallbacks, _active: NavTab): void {
  root.querySelectorAll<HTMLButtonElement>('[data-nav-tab]').forEach((btn) => {
    const tab = btn.dataset.navTab as NavTab;
    if (btn.disabled) return;
    // Always wire, even for the tab marked `active`: most callers pass
    // 'home'/'profile' just to highlight the right icon from a sub-page
    // (Play Mode, Shop, Settings, ...) that isn't literally that screen, so
    // skipping the tap there left Home/Profile dead on most of the app.
    btn.addEventListener('click', () => {
      sfxNav();
      if (tab === 'home') cb.onHome();
      else if (tab === 'achievements') cb.onAchievements();
      else if (tab === 'shop') cb.onShop();
      else if (tab === 'profile') cb.onProfile();
    });
  });
}
