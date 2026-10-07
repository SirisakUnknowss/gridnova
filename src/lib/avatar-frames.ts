export const AVATAR_FRAMES = [
  { id: 'frame_star_halo', style: 'star', name: 'Star Halo', price: 800 },
  { id: 'frame_ocean_bubbles', style: 'ocean', name: 'Ocean Bubbles', price: 1200 },
  { id: 'frame_sakura_bloom', style: 'sakura', name: 'Sakura Bloom', price: 1600 },
  { id: 'frame_royal_orbit', style: 'royal', name: 'Royal Orbit', price: 2000 },
] as const;

export function avatarFrameStyle(id: string | null | undefined): string | null {
  return AVATAR_FRAMES.find(frame => frame.id === id)?.style ?? null;
}
