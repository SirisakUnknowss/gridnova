import shopIcon from '@images/space/shop-capsule.webp';
import closeControl from '@images/space/controls/close.webp';
import backControl from '@images/space/controls/back.webp';
import hintIcon from '@images/space/hintIcon.webp';
import notesIcon from '@images/space/notesIcon.webp';
import eraseIcon from '@images/space/eraseIcon.webp';
import redoIcon from '@images/space/redoIcon.webp';
import undoIcon from '@images/space/undoIcon.webp';
import homeIcon from '@images/space/homeIcon.webp';
// =====================================================================
// Icon library — inline SVG (Lucide-compatible paths)
// =====================================================================

import coinIcon from '@images/space/replacements/coin.webp';
import streakIcon from '@images/space/streakIcon.webp';
import heartIcon from '@images/space/replacements/heart.webp';
import starIcon from '@images/space/replacements/star.webp';
import gamepadIcon from '@images/space/gamepadIcon.webp';
import targetIcon from '@images/space/replacements/target-icon.webp';
import questIcon from '@images/space/questIcon.webp';
import diceIcon from '@images/space/diceIcon.webp';
import dailyIcon from '@images/space/dailyIcon.webp';
import trophyIcon from '@images/space/trophyIcon.webp';
import playIcon from '@images/space/playIcon.webp';
import puzzleIcon from '@images/space/puzzleIcon.webp';
import guestIcon from '@images/space/guestIcon.webp';
import userIcon from '@images/space/userIcon.webp';
import warningIcon from '@images/space/replacements/warning-icon.webp';
import giftIcon from '@images/space/replacements/gift-icon.webp';
import easyIcon from '@images/space/easyIcon.webp';
import mediumIcon from '@images/space/mediumIcon.webp';
import hardIcon from '@images/space/hardIcon.webp';
import expertIcon from '@images/space/expertIcon.webp';
import statsIcon from '@images/space/statsIcon.webp';
import badgeIcon from '@images/space/badgeIcon.webp';
import lockIcon from '@images/space/replacements/lock-quest.webp'
import celebrateIcon from '@images/space/replacements/celebrate-icon.webp'
import globeIcon from '@images/space/replacements/globe.webp';
import brainIcon from '@images/space/replacements/brain-icon.webp'
import zapIcon from '@images/space/replacements/zap-icon.webp';
import repeatIcon from '@images/space/replacements/repeat-icon.webp'
import turtleIcon from '@images/space/replacements/turtle-icon.webp'
import mistakesIcon from '@images/space/replacements/mistake-icon.webp'
import bellIcon from '@images/space/replacements/bell-icon.webp'
import rocketIcon from '@images/space/replacements/rocket-icon.webp'
import cloudIcon from '@images/space/replacements/cloud-icon.webp'
import sparkleIcon from '@images/space/replacements/sparkle-icon.webp'
import waveIcon from '@images/space/replacements/wave-icon.webp'
import emptyIcon from '@images/space/emptyIcon.webp';
import sharingIcon from '@images/space/replacements/sharing-icon.webp'
import clockIcon from '@images/space/replacements/clock-icon.webp'
import soundOnIcon from '@images/space/replacements/soundOn-icon.webp'
import soundOffIcon from '@images/space/replacements/soundOff-icon.webp'
import bookModeIcon from '@images/space/bookModeIcon.webp';
import chronometerIcon from '@images/space/time-attack.webp';

function svg(paths: string, size = 18): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function img(src: string, size = 18): string {
  return `<img class="ui-art-icon" src="${src}" width="${size}" height="${size}" style="object-fit:contain;vertical-align:-${Math.round(size * 0.15)}px" alt="" />`;
}

export const ic = {
  shop: (s?: number) => img(shopIcon, s),
  close: (s?: number) => img(closeControl, s),
  back: (s?: number) => img(backControl, s),
  home: (s?: number) => img(homeIcon, s),
  profile: (s?: number) => img(userIcon, s),
  achievements: (s?: number) => img(badgeIcon, s),
  undo: (s?: number) => img(undoIcon, s),
  redo: (s?: number) => img(redoIcon, s),
  erase: (s?: number) => img(eraseIcon, s),
  notes: (s?: number) => img(notesIcon, s),
  hint: (s?: number) => img(hintIcon, s),
  // Difficulty
  easy: (s?: number) => img(easyIcon, s),
  medium: (s?: number) => img(mediumIcon, s),
  hard: (s?: number) => img(hardIcon, s),
  expert: (s?: number) => img(expertIcon, s),

  // Navigation / sections
  practice: (s?: number) => img(puzzleIcon, s),
  daily: (s?: number) => img(dailyIcon, s),
  play: (s?: number) => img(playIcon, s),
  quests: (s?: number) => img(questIcon, s),

  // User
  guest: (s?: number) => img(guestIcon, s),
  member: (s?: number) => img(userIcon, s),

  // Stats / rewards
  streak: (s?: number) => img(streakIcon, s),
  heart: (s?: number) => img(heartIcon, s),
  coin: (s?: number) => img(coinIcon, s),
  badge: (s?: number) => img(badgeIcon, s),
  star: (s?: number) => img(starIcon, s),
  trophy: (s?: number) => img(trophyIcon, s),
  medal: (s?: number) => img(badgeIcon, s),
  chart: (s?: number) => img(statsIcon, s),
  target: (s?: number) => img(targetIcon, s),
  zap: (s?: number) => img(zapIcon, s),
  turtle: (s?: number) => img(turtleIcon, s),
  mistakes: (s?: number) => img(mistakesIcon, s),
  repeat: (s?: number) => img(repeatIcon, s),
  brain: (s?: number) => img(brainIcon, s),
  bell: (s?: number) => img(bellIcon, s),
  rocket: (s?: number) => img(rocketIcon, s),
  cloud: (s?: number) => img(cloudIcon, s),
  sparkle: (s?: number) => img(sparkleIcon, s),
  wave: (s?: number) => img(waveIcon, s),
  warning: (s?: number) => img(warningIcon, s),
  empty: (s?: number) => img(emptyIcon, s),
  puzzle: (s?: number) => img(puzzleIcon, s),
  gamepad: (s?: number) => img(gamepadIcon, s),
  share: (s?: number) => img(sharingIcon, s),
  celebrate: (s?: number) => img(celebrateIcon, s),
  clock: (s?: number) => img(clockIcon, s),
  lock: (s?: number) => img(lockIcon, s),
  chevronRight: (s?: number) => svg(`<path d="m9 18 6-6-6-6"/>`, s),
  dice: (s?: number) => img(diceIcon, s),
  gift: (s?: number) => img(giftIcon, s),
  stats: (s?: number) => img(statsIcon, s),
  bookMode: (s?: number) => img(bookModeIcon, s),
  timeAttack: (s?: number) => img(chronometerIcon, s),

  // Sound
  soundOn: (s?: number) => img(soundOnIcon, s),
  soundOff: (s?: number) => img(soundOffIcon, s),

  // Community
  globe: (s?: number) => img(globeIcon, s),
};
