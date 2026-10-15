import hero from '@images/space/monthly/moonlit-wishes.webp';
import girl from '@images/space/monthly/thai-lotus-girl.webp';
import orbit from '@images/space/monthly/lotus-orbit.webp';
import river from '@images/space/monthly/moonlit-river.webp';
import boy from '@images/space/monthly/thai-moonlit-boy.webp';
import halo from '@images/space/monthly/full-moon-halo.webp';
import stars from '@images/space/monthly/river-of-stars.webp';

export const MONTHLY_ART = { hero, 'thai-lotus-girl': girl, 'lotus-orbit': orbit, 'moonlit-river': river, 'thai-moonlit-boy': boy, 'full-moon-halo': halo, 'river-of-stars': stars };
const NUMBERS = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
export function monthlyThemePreview(id: string): string {
  const dark = id === 'theme_river_of_stars';
  return `<div class="monthly-theme-preview${dark ? ' monthly-theme-preview--dark' : ''}"><img src="${dark ? stars : river}" alt=""><div class="monthly-mini-board" aria-hidden="true">${[...NUMBERS].map(n => `<span>${n === '0' ? '' : n}</span>`).join('')}</div></div>`;
}
