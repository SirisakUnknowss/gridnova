import { MONTHLY_2027 } from './monthly-2027';
import type { ThemeMeta } from './themes';

const ACCENTS = ['#8070b5','#af6384','#b8668d','#257f96','#518165','#267f95','#537ba4','#7965a6','#997032','#8668ad'];
export const YEAR_DARK_THEMES = new Set(MONTHLY_2027.map(collection => collection.rewards[5].id));
export const YEAR_THEMES: Record<string,ThemeMeta> = Object.fromEntries(MONTHLY_2027.flatMap((collection,index) => collection.rewards.filter(reward => reward.type === 'Theme').map(reward => {
  const dark = YEAR_DARK_THEMES.has(reward.id);
  const primary = ACCENTS[index];
  const tokens: ThemeMeta['tokens'] = dark ? {
    '--brand-primary': primary, '--border-thick': '#cdc7e7', '--border-thin': '#555b77',
    '--cell-bg': '#1b233b', '--cell-bg-given': '#252e48', '--cell-bg-selected': '#545174',
    '--cell-bg-related': '#323b57', '--cell-bg-same': '#605433', '--cell-bg-conflict': '#683545',
    '--cell-text': '#f3f0ff', '--cell-text-user': '#c8caff', '--cell-text-hint': '#b3e6df', '--cell-text-conflict': '#ffb7c5',
  } : { '--brand-primary': primary, '--border-thick': primary, '--border-thin': '#d4d9e7' };
  return [reward.id,{ id: reward.id, name: reward.name, tokens }];
})));
