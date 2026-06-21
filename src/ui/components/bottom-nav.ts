// =====================================================================
// Shared bottom-nav — single source of truth for the 4-tab navigation
// =====================================================================
import { sfxNav } from '@lib/sound';

export type NavTab = 'home' | 'achievements' | 'shop' | 'profile';

export interface BottomNavCallbacks {
  onHome: () => void;
  onAchievements: () => void;
  onShop: () => void;
  onProfile: () => void;
}

function svgHome(s = 22) {
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>`;
}
function svgAchievements(s = 22) {
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`;
}
function svgShop(s = 22) {
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
}
function svgProfile(s = 22) {
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
}

const TABS: { key: NavTab; icon: (s?: number) => string; label: string }[] = [
  { key: 'home',         icon: svgHome,         label: 'Home'    },
  { key: 'achievements', icon: svgAchievements, label: 'Medals'  },
  { key: 'shop',         icon: svgShop,         label: 'Shop'    },
  { key: 'profile',      icon: svgProfile,      label: 'Profile' },
];

export function bottomNavHTML(active: NavTab): string {
  return `
    <nav class="bottom-nav" data-nav>
      ${TABS.map((t) => `
        <button data-nav-tab="${t.key}" class="${t.key === active ? 'active' : ''}">
          <span class="icon">${t.icon(22)}</span>
          <span>${t.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

export function wireBottomNav(root: ParentNode, cb: BottomNavCallbacks, active: NavTab): void {
  root.querySelectorAll<HTMLButtonElement>('[data-nav-tab]').forEach((btn) => {
    const tab = btn.dataset.navTab as NavTab;
    if (tab === active) return;
    btn.addEventListener('click', () => {
      sfxNav();
      if (tab === 'home') cb.onHome();
      else if (tab === 'achievements') cb.onAchievements();
      else if (tab === 'shop') cb.onShop();
      else if (tab === 'profile') cb.onProfile();
    });
  });
}
