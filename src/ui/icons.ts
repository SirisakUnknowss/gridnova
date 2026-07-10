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
  xp: (s?: number) => svg(`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`, s),
  star: (s?: number) => img(starIcon, s),
  trophy: (s?: number) => img(trophyIcon, s),
  medal: (s?: number) => svg(`<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>`, s),
  chart: (s?: number) => svg(`<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`, s),
  target: (s?: number) => img(targetIcon, s),
  zap: (s?: number) => svg(`<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`, s),
  turtle: (s?: number) => svg(`<path d="M12 10c-2.5-2-6-2-6 2 0 3 2 5 6 6 4-1 6-3 6-6 0-4-3.5-4-6-2z"/><path d="M12 4v6"/><path d="M8 16l-2 4"/><path d="M16 16l2 4"/><path d="M5 12H3"/><path d="M21 12h-2"/>`, s),
  mistakes: (s?: number) => svg(`<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`, s),
  repeat: (s?: number) => svg(`<path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>`, s),
  brain: (s?: number) => svg(`<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>`, s),
  bell: (s?: number) => svg(`<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>`, s),
  rocket: (s?: number) => svg(`<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>`, s),
  cloud: (s?: number) => svg(`<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>`, s),
  sparkle: (s?: number) => svg(`<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>`, s),
  wave: (s?: number) => svg(`<path d="M18.5 17.5a5 5 0 0 1-7 0l-5-5a5 5 0 0 1 7-7l.5.5"/><path d="m14 6.5-8.5 8.5"/><path d="M17 11.5 8.5 20"/>`, s),
  warning: (s?: number) => img(warningIcon, s),
  empty: (s?: number) => svg(`<circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><path d="M9 9h.01"/><path d="M15 9h.01"/>`, s),
  puzzle: (s?: number) => img(puzzleIcon, s),
  gamepad: (s?: number) => img(gamepadIcon, s),
  share: (s?: number) => svg(`<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`, s),
  celebrate: (s?: number) => img(celebrateIcon, s),
  clock: (s?: number) => svg(`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`, s),
  time: (s?: number) => svg(`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`, s),
  lock: (s?: number) => img(lockIcon, s),
  chevronRight: (s?: number) => svg(`<path d="m9 18 6-6-6-6"/>`, s),
  dice: (s?: number) => img(diceIcon, s),
  gift: (s?: number) => img(giftIcon, s),
  stats: (s?: number) => img(statsIcon, s),

  // Sound
  soundOn: (s?: number) => svg(`<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>`, s),
  soundOff: (s?: number) => svg(`<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`, s),

  // Community
  online: (s?: number) => svg(`<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>`, s),
  members: (s?: number) => svg(`<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`, s),
  globe: (s?: number) => svg(`<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`, s),
};
