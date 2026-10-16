import accessories from '@images/space/theme-icons/accessories.webp';
import { MONTHLY_2027 } from './monthly-2027';

export interface ThemeIconSkin {
  tile: number;
  filter: string;
}

const filters = [
  'none', 'sepia(.3) saturate(.8)', 'grayscale(.35) hue-rotate(175deg)',
  'hue-rotate(305deg) saturate(.8)', 'hue-rotate(145deg)', 'hue-rotate(65deg)',
  'hue-rotate(335deg)', 'hue-rotate(120deg)', 'hue-rotate(290deg)',
  'sepia(.2) saturate(1.1)', 'grayscale(1)',
];

const baseIds = ['theme_classic', 'theme_paper', 'theme_dark', 'theme_pastel',
  'theme_ocean', 'theme_forest', 'theme_sunset', 'theme_neon', 'theme_sakura',
  'theme_thai', 'theme_mono', 'theme_moonlit_river', 'theme_river_of_stars',
  'theme_winter_wonderland', 'theme_christmas_eve'];
const seasonalFilters = ['hue-rotate(5deg)', 'hue-rotate(300deg)', 'hue-rotate(290deg)',
  'hue-rotate(145deg)', 'hue-rotate(65deg)', 'hue-rotate(145deg)',
  'hue-rotate(175deg)', 'hue-rotate(5deg)', 'sepia(.2) hue-rotate(335deg)', 'hue-rotate(15deg)'];

export const THEME_ICON_SKINS: Record<string, ThemeIconSkin> = Object.fromEntries([
  ...baseIds.map((id, tile) => [id, { tile, filter: filters[tile] ?? (tile === 13 ? 'hue-rotate(170deg) saturate(.75)' : 'none') }]),
  ...MONTHLY_2027.flatMap((collection, month) => collection.rewards.filter(item => item.type === 'Theme')
    .map((item, variant) => [item.id, { tile: 15 + month * 2 + variant, filter: seasonalFilters[month] }])),
]);

export function themeIconProperties(themeId: string): Record<string, string> {
  const skin = THEME_ICON_SKINS[themeId] ?? THEME_ICON_SKINS.theme_classic;
  return {
    '--theme-icon-atlas': `url("${accessories}")`,
    '--theme-icon-position': `${(skin.tile % 6) * 20}% ${Math.floor(skin.tile / 6) * 20}%`,
    '--theme-icon-filter': skin.filter,
    '--calendar-filter': skin.filter,
  };
}
