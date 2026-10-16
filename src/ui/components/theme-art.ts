export type ThemeIconRole = 'home' | 'profile' | 'medals' | 'shop' | 'daily' | 'practice' | 'mode' | 'quests' | 'clock' | 'hero';

export function themeArtHTML(src: string, size = 18, role: ThemeIconRole = 'mode'): string {
  const imageClass = role === 'hero' ? 'daily-fantasy-calendar' : 'ui-art-icon';
  return `<span class="theme-icon theme-icon--${role}" style="--icon-size:${size}px" aria-hidden="true"><img class="${imageClass}" src="${src}" width="${size}" height="${size}" alt="" decoding="async"><span class="theme-icon-ornament"></span></span>`;
}
