export type FunctionalIconRole = 'home' | 'profile' | 'medals' | 'shop' | 'daily' | 'practice' | 'mode' | 'quests' | 'clock';

const shapes: Record<FunctionalIconRole, string> = {
  home: '<path class="functional-icon-surface" d="M5 10v11h5v-6h4v6h5V10"/><path d="m3 11 9-8 9 8"/>',
  medals: '<path class="functional-icon-accent" d="M7 3h10v6a5 5 0 0 1-10 0V3Z"/><path d="M7 5H3v3a4 4 0 0 0 5 4m9-7h4v3a4 4 0 0 1-5 4m-4 2v6m-4 1h8"/>',
  shop: '<path class="functional-icon-surface" d="M5 7h14l2 14H3L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  profile: '<circle class="functional-icon-accent" cx="12" cy="7" r="4"/><path class="functional-icon-surface" d="M4 21v-2a8 8 0 0 1 16 0v2H4Z"/>',
  daily: '<rect class="functional-icon-surface" x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/><path class="functional-icon-dots" d="M7 13h3v2H7zm7 0h3v2h-3zm-7 4h3v2H7zm7 0h3v2h-3z"/>',
  practice: '<rect class="functional-icon-surface" x="3" y="3" width="15" height="18" rx="2"/><path d="M8 3v18M3 9h15M3 15h9"/><path class="functional-icon-accent" d="m12 18 7-7 3 3-7 7-4 1 1-4Z"/>',
  mode: '<path class="functional-icon-surface" d="M7 7h10a4 4 0 0 1 4 3l1 7a3 3 0 0 1-5 2l-3-3h-4l-3 3a3 3 0 0 1-5-2l1-7a4 4 0 0 1 4-3Z"/><path d="M7 10v6m-3-3h6"/><circle class="functional-icon-dots" cx="16" cy="11" r="1"/><circle class="functional-icon-dots" cx="19" cy="14" r="1"/>',
  quests: '<rect class="functional-icon-surface" x="5" y="5" width="14" height="17" rx="2"/><rect class="functional-icon-accent" x="8" y="2" width="8" height="5" rx="1"/><path d="m8 14 3 3 5-6"/>',
  clock: '<circle class="functional-icon-surface" cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
};

export function functionalIconHTML(role: FunctionalIconRole): string {
  return `<svg class="functional-icon" data-icon="${role}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shapes[role]}</svg>`;
}
