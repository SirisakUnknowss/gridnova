import pack0 from '@images/space/theme-icons/full/skin-theme_classic.webp';
import pack1 from '@images/space/theme-icons/full/skin-theme_paper.webp';
import pack2 from '@images/space/theme-icons/full/skin-theme_dark.webp';
import pack3 from '@images/space/theme-icons/full/skin-theme_pastel.webp';
import pack4 from '@images/space/theme-icons/full/skin-theme_ocean.webp';
import pack5 from '@images/space/theme-icons/full/skin-theme_forest.webp';
import pack6 from '@images/space/theme-icons/full/skin-theme_sunset.webp';
import pack7 from '@images/space/theme-icons/full/skin-theme_neon.webp';
import pack8 from '@images/space/theme-icons/full/skin-theme_sakura.webp';
import pack9 from '@images/space/theme-icons/full/skin-theme_thai.webp';
import pack10 from '@images/space/theme-icons/full/skin-theme_mono.webp';
import pack11 from '@images/space/theme-icons/full/skin-theme_moonlit_river.webp';
import pack12 from '@images/space/theme-icons/full/skin-theme_river_of_stars.webp';
import pack13 from '@images/space/theme-icons/full/skin-theme_winter_wonderland.webp';
import pack14 from '@images/space/theme-icons/full/skin-theme_christmas_eve.webp';
import pack15 from '@images/space/theme-icons/full/skin-theme_2027_01_dawn_horizon.webp';
import pack16 from '@images/space/theme-icons/full/skin-theme_2027_01_midnight_celebration.webp';
import pack17 from '@images/space/theme-icons/full/skin-theme_2027_02_cloud_valentine.webp';
import pack18 from '@images/space/theme-icons/full/skin-theme_2027_02_velvet_galaxy.webp';
import pack19 from '@images/space/theme-icons/full/skin-theme_2027_03_blossom_breeze.webp';
import pack20 from '@images/space/theme-icons/full/skin-theme_2027_03_moonlit_sakura.webp';
import pack21 from '@images/space/theme-icons/full/skin-theme_2027_04_crystal_lagoon.webp';
import pack22 from '@images/space/theme-icons/full/skin-theme_2027_04_moonlit_festival.webp';
import pack23 from '@images/space/theme-icons/full/skin-theme_2027_05_dewdrop_meadow.webp';
import pack24 from '@images/space/theme-icons/full/skin-theme_2027_05_secret_moon_garden.webp';
import pack25 from '@images/space/theme-icons/full/skin-theme_2027_06_crystal_reef.webp';
import pack26 from '@images/space/theme-icons/full/skin-theme_2027_06_abyssal_starlight.webp';
import pack27 from '@images/space/theme-icons/full/skin-theme_2027_07_cloud_outpost.webp';
import pack28 from '@images/space/theme-icons/full/skin-theme_2027_07_ancient_star_temple.webp';
import pack29 from '@images/space/theme-icons/full/skin-theme_2027_08_stardust_valley.webp';
import pack30 from '@images/space/theme-icons/full/skin-theme_2027_08_meteor_observatory.webp';
import pack31 from '@images/space/theme-icons/full/skin-theme_2027_09_golden_meadow.webp';
import pack32 from '@images/space/theme-icons/full/skin-theme_2027_09_moonlit_orchard.webp';
import pack33 from '@images/space/theme-icons/full/skin-theme_2027_10_twilight_spell.webp';
import pack34 from '@images/space/theme-icons/full/skin-theme_2027_10_midnight_observatory.webp';

export const THEME_ICON_SKINS: Record<string, string> = {
  theme_classic: pack0,
  theme_paper: pack1,
  theme_dark: pack2,
  theme_pastel: pack3,
  theme_ocean: pack4,
  theme_forest: pack5,
  theme_sunset: pack6,
  theme_neon: pack7,
  theme_sakura: pack8,
  theme_thai: pack9,
  theme_mono: pack10,
  theme_moonlit_river: pack11,
  theme_river_of_stars: pack12,
  theme_winter_wonderland: pack13,
  theme_christmas_eve: pack14,
  theme_2027_01_dawn_horizon: pack15,
  theme_2027_01_midnight_celebration: pack16,
  theme_2027_02_cloud_valentine: pack17,
  theme_2027_02_velvet_galaxy: pack18,
  theme_2027_03_blossom_breeze: pack19,
  theme_2027_03_moonlit_sakura: pack20,
  theme_2027_04_crystal_lagoon: pack21,
  theme_2027_04_moonlit_festival: pack22,
  theme_2027_05_dewdrop_meadow: pack23,
  theme_2027_05_secret_moon_garden: pack24,
  theme_2027_06_crystal_reef: pack25,
  theme_2027_06_abyssal_starlight: pack26,
  theme_2027_07_cloud_outpost: pack27,
  theme_2027_07_ancient_star_temple: pack28,
  theme_2027_08_stardust_valley: pack29,
  theme_2027_08_meteor_observatory: pack30,
  theme_2027_09_golden_meadow: pack31,
  theme_2027_09_moonlit_orchard: pack32,
  theme_2027_10_twilight_spell: pack33,
  theme_2027_10_midnight_observatory: pack34,
};

export function themeIconProperties(themeId: string): Record<string, string> {
  const atlas = THEME_ICON_SKINS[themeId] ?? THEME_ICON_SKINS.theme_classic;
  return {
    '--theme-icon-atlas': `url("${atlas}")`,
    '--theme-icon-grid': '300% 300%',
  };
}
