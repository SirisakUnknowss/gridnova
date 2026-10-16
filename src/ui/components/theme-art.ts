export type ThemeIconRole = 'home' | 'profile' | 'medals' | 'shop' | 'daily' | 'practice' | 'mode' | 'quests' | 'clock' | 'hero';

export function themeArtHTML(src: string, size = 18, role: ThemeIconRole = 'mode'): string {
  return `<span class="theme-icon theme-icon--${role}" style="--icon-size:${size}px;--icon-fallback:url('${src}')" aria-hidden="true"><span class="theme-icon-picture"></span></span>`;
}
