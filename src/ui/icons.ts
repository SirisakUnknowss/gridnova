// =====================================================================
// Icon library — inline SVG (Lucide-compatible paths)
// =====================================================================

import coinIcon from '@images/coin.png';
import streakIcon from '@images/streak-medal.png';
import starIcon from '@images/star.png';
import gamepadIcon from '@images/play-medal.png';
import targetIcon from '@images/target-icon.png';
import questIcon from '@images/quest-icon.png';
import diceIcon from '@images/random-icon.png';
import dailyIcon from '@images/daily-medal.png';
import trophyIcon from '@images/trophy-icon.png';
import playIcon from '@images/play-icon.png';
import puzzleIcon from '@images/puzzle.png';
import guestIcon from '@images/guest-icon.png';
import userIcon from '@images/user-icon.png';
import warningIcon from '@images/warning-icon.png';
import giftIcon from '@images/gift-icon.png';
import easyIcon from '@images/easy-mode.png';
import mediumIcon from '@images/medium-mode.png';
import hardIcon from '@images/hard-mode.png';
import expertIcon from '@images/expert-mode.png';
import statsIcon from '@images/stat.png'
import badgeIcon from '@images/badge.png';
import lockIcon from '@images/lock-quest.png'
import celebrateIcon from '@images/celebrate-icon.png'
import globeIcon from '@images/globe.png';
import brainIcon from '@images/brain-icon.png'
import zapIcon from '@images/zap-icon.png';
import repeatIcon from '@images/repeat-icon.png'
import turtleIcon from '@images/turtle-icon.png'
import mistakesIcon from '@images/mistake-icon.png'
import bellIcon from '@images/bell-icon.png'
import rocketIcon from '@images/rocket-icon.png'
import cloudIcon from '@images/cloud-icon.png'
import sparkleIcon from '@images/sparkle-icon.png'
import waveIcon from '@images/wave-icon.png'
import emptyIcon from '@images/empty-icon.png'
import sharingIcon from '@images/sharing-icon.png'
import clockIcon from '@images/clock-icon.png'
import soundOnIcon from '@images/soundOn-icon.png'
import soundOffIcon from '@images/soundOff-icon.png'

function svg(paths: string, size = 18): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function img(src: string, size = 18): string {
  return `<img src="${src}" width="${size}" height="${size}" style="object-fit:contain;vertical-align:-${Math.round(size * 0.15)}px" alt="" />`;
}

export const ic = {
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

  // Sound
  soundOn: (s?: number) => img(soundOnIcon, s),
  soundOff: (s?: number) => img(soundOffIcon, s),

  // Community
  globe: (s?: number) => img(globeIcon, s),
};
