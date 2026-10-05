import { RARE_AVATAR_ART } from './rare-avatar-art';
import { RARE_AVATAR_CATALOG } from '@lib/rare-avatar-catalog';
import avatar0 from '@images/space/avatars/lunar-fox.webp';
import avatar1 from '@images/space/avatars/nebula-cat.webp';
import avatar2 from '@images/space/avatars/comet-panda.webp';
import avatar3 from '@images/space/avatars/cosmo-owl.webp';
import avatar4 from '@images/space/avatars/nova-dragon.webp';
import avatar5 from '@images/space/avatars/astra-knight.webp';
import avatar6 from '@images/space/avatars/orbit-bunny.webp';
import avatar7 from '@images/space/avatars/solar-lion.webp';
import { ic } from '@ui/icons';


function portrait(src: string, size = 48): string {
  return `<img class="ui-art-icon" src="${src}" width="${size}" height="${size}" alt="" decoding="async">`;
}

export const AVATAR_OPTIONS = [
  { id: 'space_lunar-fox', name: 'Lunar Fox', art: (size?: number) => portrait(avatar0, size) },
  { id: 'space_nebula-cat', name: 'Nebula Cat', art: (size?: number) => portrait(avatar1, size) },
  { id: 'space_comet-panda', name: 'Comet Panda', art: (size?: number) => portrait(avatar2, size) },
  { id: 'space_cosmo-owl', name: 'Cosmo Owl', art: (size?: number) => portrait(avatar3, size) },
  { id: 'space_nova-dragon', name: 'Nova Dragon', art: (size?: number) => portrait(avatar4, size) },
  { id: 'space_astra-knight', name: 'Astra Knight', art: (size?: number) => portrait(avatar5, size) },
  { id: 'space_orbit-bunny', name: 'Orbit Bunny', art: (size?: number) => portrait(avatar6, size) },
  { id: 'space_solar-lion', name: 'Solar Lion', art: (size?: number) => portrait(avatar7, size) },

  { id: '👤', name: 'Orbit Bot', art: ic.guest },
  { id: '🤖', name: 'Space Pilot', art: ic.member },
  { id: '🦸', name: 'Nova Rocket', art: ic.rocket },
  { id: '🧙', name: 'Stellar World', art: ic.globe },
  { id: '🥷', name: 'Cosmic Dice', art: ic.dice },
  { id: '🐱', name: 'Mint Planet', art: ic.easy },
  { id: '🦊', name: 'Blue Planet', art: ic.medium },
  { id: '🐼', name: 'Ringed Planet', art: ic.hard },
  { id: '🐯', name: 'Crystal Planet', art: ic.expert },
  { id: '🦁', name: 'Solar Star', art: ic.star },
  { id: '🐸', name: 'Moon Cloud', art: ic.cloud },
  { id: '🐧', name: 'Ocean Wave', art: ic.wave },
  { id: '🦉', name: 'Nova Spark', art: ic.sparkle },
  { id: '🐙', name: 'Space Turtle', art: ic.turtle },
  { id: '👻', name: 'Astral Flame', art: ic.streak },
  { id: '🧑', name: 'Galaxy Crown', art: ic.badge },
];
const SHOP_AVATAR_ART: Record<string, string> = {"avatar_face_happy": "space_orbit-bunny", "avatar_face_cool": "space_astra-knight", "avatar_face_nerd": "space_cosmo-owl", "avatar_face_lion": "space_solar-lion", "avatar_hat_cap": "space_comet-panda", "avatar_hat_top": "space_lunar-fox", "avatar_hat_crown": "🧑", "avatar_pet_dog": "space_lunar-fox", "avatar_pet_cat": "space_nebula-cat", "avatar_pet_dragon": "space_nova-dragon", "avatar_frame_bronze": "🦁", "avatar_frame_gold": "🧑", "avatar_frame_rainbow": "🦉"};

export function avatarArtHTML(id: string | null | undefined, size: number): string {
  if (id && RARE_AVATAR_ART[id]) return portrait(RARE_AVATAR_ART[id], size);
  return (AVATAR_OPTIONS.find(option => option.id === (id ? SHOP_AVATAR_ART[id] ?? id : id))?.art ?? ic.guest)(size);
}

export function shopAvatarName(id: string): string | undefined {
  const rare = RARE_AVATAR_CATALOG.find(item => item.id === id);
  if (rare) return rare.name;
  return AVATAR_OPTIONS.find(option => option.id === SHOP_AVATAR_ART[id])?.name;
}

export const PAID_AVATAR_ITEMS: Record<string, string> = {
  'space_lunar-fox': 'avatar_pet_dog',
  'space_nebula-cat': 'avatar_pet_cat',
  'space_comet-panda': 'avatar_hat_cap',
  'space_cosmo-owl': 'avatar_face_nerd',
  'space_nova-dragon': 'avatar_pet_dragon',
  'space_astra-knight': 'avatar_face_cool',
  'space_solar-lion': 'avatar_face_lion',
};
