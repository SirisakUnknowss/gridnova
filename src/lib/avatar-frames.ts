import frameArt0 from '@images/space/frames/celestial-crown.webp';
import frameArt1 from '@images/space/frames/ocean-pearl.webp';
import frameArt2 from '@images/space/frames/sakura-petals.webp';
import frameArt3 from '@images/space/frames/royal-orbit.webp';
import frameArt4 from '@images/space/frames/forest-guardian.webp';
import frameArt5 from '@images/space/frames/solar-flare.webp';
import frameArt6 from '@images/space/frames/frost-crystal.webp';
import frameArt7 from '@images/space/frames/nebula-dream.webp';
import frameArt8 from '@images/space/frames/dragon-crest.webp';
import frameArt9 from '@images/space/frames/phoenix-wings.webp';
import frameArt10 from '@images/space/frames/lunar-eclipse.webp';
import frameArt11 from '@images/space/frames/candy-cloud.webp';
import frameArt12 from '@images/space/frames/crystal-lotus.webp';
import frameArt13 from '@images/space/frames/clockwork-orbit.webp';
import frameArt14 from '@images/space/frames/thunder-spark.webp';
import frameArt15 from '@images/space/frames/coral-kingdom.webp';
import frameArt16 from '@images/space/frames/rose-garden.webp';
import frameArt17 from '@images/space/frames/comet-trail.webp';
import frameArt18 from '@images/space/frames/aurora-ribbon.webp';
import frameArt19 from '@images/space/frames/galaxy-sovereign.webp';

export const AVATAR_FRAMES = [
  { id: 'frame_star_halo', style: 'star', name: 'Star Halo', price: 800 },
  { id: 'frame_ocean_bubbles', style: 'ocean', name: 'Ocean Bubbles', price: 1200 },
  { id: 'frame_sakura_bloom', style: 'sakura', name: 'Sakura Bloom', price: 1600 },
  { id: 'frame_royal_orbit', style: 'royal', name: 'Royal Orbit', price: 2000 },
  { id: 'frame_art_celestial_crown', style: 'illustrated', name: 'Celestial Crown', price: 1200, art: frameArt0 },
  { id: 'frame_art_ocean_pearl', style: 'illustrated', name: 'Ocean Pearl', price: 1600, art: frameArt1 },
  { id: 'frame_art_sakura_petals', style: 'illustrated', name: 'Sakura Petals', price: 1600, art: frameArt2 },
  { id: 'frame_art_royal_orbit', style: 'illustrated', name: 'Royal Orbit', price: 2400, art: frameArt3 },
  { id: 'frame_art_forest_guardian', style: 'illustrated', name: 'Forest Guardian', price: 1200, art: frameArt4 },
  { id: 'frame_art_solar_flare', style: 'illustrated', name: 'Solar Flare', price: 1800, art: frameArt5 },
  { id: 'frame_art_frost_crystal', style: 'illustrated', name: 'Frost Crystal', price: 1800, art: frameArt6 },
  { id: 'frame_art_nebula_dream', style: 'illustrated', name: 'Nebula Dream', price: 2000, art: frameArt7 },
  { id: 'frame_art_dragon_crest', style: 'illustrated', name: 'Dragon Crest', price: 2400, art: frameArt8 },
  { id: 'frame_art_phoenix_wings', style: 'illustrated', name: 'Phoenix Wings', price: 2200, art: frameArt9 },
  { id: 'frame_art_lunar_eclipse', style: 'illustrated', name: 'Lunar Eclipse', price: 1600, art: frameArt10 },
  { id: 'frame_art_candy_cloud', style: 'illustrated', name: 'Candy Cloud', price: 1200, art: frameArt11 },
  { id: 'frame_art_crystal_lotus', style: 'illustrated', name: 'Crystal Lotus', price: 2000, art: frameArt12 },
  { id: 'frame_art_clockwork_orbit', style: 'illustrated', name: 'Clockwork Orbit', price: 1800, art: frameArt13 },
  { id: 'frame_art_thunder_spark', style: 'illustrated', name: 'Thunder Spark', price: 1800, art: frameArt14 },
  { id: 'frame_art_coral_kingdom', style: 'illustrated', name: 'Coral Kingdom', price: 1600, art: frameArt15 },
  { id: 'frame_art_rose_garden', style: 'illustrated', name: 'Rose Garden', price: 1600, art: frameArt16 },
  { id: 'frame_art_comet_trail', style: 'illustrated', name: 'Comet Trail', price: 2000, art: frameArt17 },
  { id: 'frame_art_aurora_ribbon', style: 'illustrated', name: 'Aurora Ribbon', price: 2000, art: frameArt18 },
  { id: 'frame_art_galaxy_sovereign', style: 'illustrated', name: 'Galaxy Sovereign', price: 3000, art: frameArt19 },
] as const;

export function avatarFrameStyle(id: string | null | undefined): string | null {
  return AVATAR_FRAMES.find(frame => frame.id === id)?.style ?? null;
}

export function avatarFrameArt(id: string | null | undefined): string | null {
  const frame = AVATAR_FRAMES.find(frame => frame.id === id);
  return frame && 'art' in frame ? frame.art : null;
}
