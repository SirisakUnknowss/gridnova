import hero from '@images/space/monthly/moonlit-wishes.webp';
import { YEAR_ART, YEAR_BACKGROUNDS } from '@lib/monthly-2027-art';
import { YEAR_DARK_THEMES } from '@lib/monthly-2027-themes';
import girl from '@images/space/monthly/thai-lotus-girl.webp';
import orbit from '@images/space/monthly/lotus-orbit.webp';
import river from '@images/space/monthly/moonlit-river.webp';
import boy from '@images/space/monthly/thai-moonlit-boy.webp';
import halo from '@images/space/monthly/full-moon-halo.webp';
import stars from '@images/space/monthly/river-of-stars.webp';
import christmasHero from '@images/space/monthly/christmas-hero.webp';
import snowflakeGirl from '@images/space/monthly/snowflake-girl.webp';
import christmasBoy from '@images/space/monthly/christmas-boy.webp';
import candyCane from '@images/space/monthly/candy-cane-orbit.webp';
import wreath from '@images/space/monthly/starlight-wreath.webp';
import winter from '@images/space/monthly/winter-wonderland.webp';
import christmasEve from '@images/space/monthly/christmas-eve.webp';

export const MONTHLY_ART: Record<string,string> = { ...YEAR_ART, hero, 'thai-lotus-girl': girl, 'lotus-orbit': orbit, 'moonlit-river': river, 'thai-moonlit-boy': boy, 'full-moon-halo': halo, 'river-of-stars': stars, 'christmas-hero': christmasHero, 'snowflake-girl': snowflakeGirl, 'christmas-boy': christmasBoy, 'candy-cane-orbit': candyCane, 'starlight-wreath': wreath, 'winter-wonderland': winter, 'christmas-eve': christmasEve };
const NUMBERS = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
export function monthlyThemePreview(id: string): string {
  const dark = id === 'theme_river_of_stars' || id === 'theme_christmas_eve' || YEAR_DARK_THEMES.has(id);
  const art = YEAR_BACKGROUNDS[id] ?? (id === 'theme_christmas_eve' ? christmasEve : id === 'theme_winter_wonderland' ? winter : dark ? stars : river);
  return `<div class="monthly-theme-preview${dark ? ' monthly-theme-preview--dark' : ''}"><img src="${art}" alt=""><div class="monthly-mini-board" aria-hidden="true">${[...NUMBERS].map(n => `<span>${n === '0' ? '' : n}</span>`).join('')}</div></div>`;
}
