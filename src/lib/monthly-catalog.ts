import { MONTHLY_2027 } from './monthly-2027';
export interface MonthlyReward { days: number; id: string; name: string; type: 'Avatar' | 'Frame' | 'Theme'; art: string }
export interface MonthlyCollection { month: string; label: string; monthName: string; title: string; subtitle: string; start: string; end: string; days: number; hero: string; heroAlt: string; rewards: readonly MonthlyReward[] }

export const MONTHLY_COLLECTIONS: readonly MonthlyCollection[] = [
  { month: '2026-11', label: 'November 2026', monthName: 'November', title: 'Moonlit Wishes', subtitle: 'Little lights. Cosmic wishes.', start: '2026-11-01', end: '2026-11-30', days: 30, hero: 'hero', heroAlt: 'A friendly space robot floating a lotus krathong under the moon', rewards: [
    { days: 5, id: 'avatar_monthly_lotus_otter', name: 'Lotus Girl', type: 'Avatar', art: 'thai-lotus-girl' },
    { days: 10, id: 'frame_monthly_lotus_orbit', name: 'Lotus Orbit', type: 'Frame', art: 'lotus-orbit' },
    { days: 15, id: 'theme_moonlit_river', name: 'Moonlit River', type: 'Theme', art: 'moonlit-river' },
    { days: 20, id: 'avatar_monthly_moon_rabbit', name: 'Moonlit Boy', type: 'Avatar', art: 'thai-moonlit-boy' },
    { days: 25, id: 'frame_monthly_full_moon_halo', name: 'Full Moon Halo', type: 'Frame', art: 'full-moon-halo' },
    { days: 30, id: 'theme_river_of_stars', name: 'River of Stars', type: 'Theme', art: 'river-of-stars' },
  ] },
  { month: '2026-12', label: 'December 2026', monthName: 'December', title: 'Christmas Day', subtitle: 'A little magic. A cosmic Christmas.', start: '2026-12-01', end: '2026-12-31', days: 31, hero: 'christmas-hero', heroAlt: 'A Santa-hat robot beside a snowy Christmas planet', rewards: [
    { days: 5, id: 'avatar_monthly_snowflake_girl', name: 'Snowflake Girl', type: 'Avatar', art: 'snowflake-girl' },
    { days: 10, id: 'frame_monthly_candy_cane_orbit', name: 'Candy Cane Orbit', type: 'Frame', art: 'candy-cane-orbit' },
    { days: 15, id: 'theme_winter_wonderland', name: 'Winter Wonderland', type: 'Theme', art: 'winter-wonderland' },
    { days: 20, id: 'avatar_monthly_christmas_boy', name: 'Christmas Boy', type: 'Avatar', art: 'christmas-boy' },
    { days: 25, id: 'frame_monthly_starlight_wreath', name: 'Starlight Wreath', type: 'Frame', art: 'starlight-wreath' },
    { days: 30, id: 'theme_christmas_eve', name: 'Christmas Eve', type: 'Theme', art: 'christmas-eve' },
  ] },
  ...MONTHLY_2027,
];

export function monthlyCollection(month: string): MonthlyCollection {
  const collection = MONTHLY_COLLECTIONS.find(item => item.month === month);
  if (!collection) throw new Error('Unknown monthly collection');
  return collection;
}
export function activeMonthlyCollection(today: string): MonthlyCollection {
  return [...MONTHLY_COLLECTIONS].reverse().find(item => item.start <= today) ?? MONTHLY_COLLECTIONS[0];
}
