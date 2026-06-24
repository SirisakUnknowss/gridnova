// =====================================================================
// Shared bottom-nav — single source of truth for the 4-tab navigation
// =====================================================================
import { sfxNav } from '@lib/sound';

export type NavTab = 'home' | 'achievements' | 'season' | 'profile';

export interface BottomNavCallbacks {
  onHome: () => void;
  onAchievements: () => void;
  onProfile: () => void;
}

function svgHome(s = 22) {
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>`;
}
function svgAchievements(s = 22) {
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`;
}
function svgSeason(s = 22) {
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
}
function svgProfile(s = 22) {
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
}

const TABS: { key: NavTab; icon: (s?: number) => string; label: string; comingSoon?: boolean }[] = [
  { key: 'home',         icon: svgHome,         label: 'Home'    },
  { key: 'achievements', icon: svgAchievements, label: 'Medals'  },
  { key: 'season',       icon: svgSeason,       label: 'Season', comingSoon: true },
  { key: 'profile',      icon: svgProfile,      label: 'Profile' },
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

export function wireBottomNav(root: ParentNode, cb: BottomNavCallbacks, active: NavTab): void {
  root.querySelectorAll<HTMLButtonElement>('[data-nav-tab]').forEach((btn) => {
    const tab = btn.dataset.navTab as NavTab;
    if (tab === active || btn.disabled) return;
    btn.addEventListener('click', () => {
      sfxNav();
      if (tab === 'home') cb.onHome();
      else if (tab === 'achievements') cb.onAchievements();
      else if (tab === 'profile') cb.onProfile();
    });
  });
}
