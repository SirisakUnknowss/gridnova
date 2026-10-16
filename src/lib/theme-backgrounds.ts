import paper from '@images/space/themes/paper.webp';
import { YEAR_BACKGROUNDS } from './monthly-2027-art';
import dark from '@images/space/themes/dark.webp';
import pastel from '@images/space/themes/pastel.webp';
import ocean from '@images/space/themes/ocean.webp';
import forest from '@images/space/themes/forest.webp';
import sunset from '@images/space/themes/sunset.webp';
import neon from '@images/space/themes/neon.webp';
import sakura from '@images/space/themes/sakura.webp';
import thai from '@images/space/themes/thai.webp';
import mono from '@images/space/themes/mono.webp';
import classic from '@images/space/bg-home.webp';
import moonlitRiver from '@images/space/monthly/moonlit-river.webp';
import riverOfStars from '@images/space/monthly/river-of-stars.webp';
import winterWonderland from '@images/space/monthly/winter-wonderland.webp';
import christmasEve from '@images/space/monthly/christmas-eve.webp';

export const THEME_BACKGROUNDS: Record<string, string> = {
  ...YEAR_BACKGROUNDS,
  theme_winter_wonderland: winterWonderland,
  theme_christmas_eve: christmasEve,
  theme_moonlit_river: moonlitRiver,
  theme_river_of_stars: riverOfStars,
  theme_classic: classic,
  theme_paper: paper,
  theme_dark: dark,
  theme_pastel: pastel,
  theme_ocean: ocean,
  theme_forest: forest,
  theme_sunset: sunset,
  theme_neon: neon,
  theme_sakura: sakura,
  theme_thai: thai,
  theme_mono: mono,
};
