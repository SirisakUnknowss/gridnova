// =====================================================================
// User-facing release notes ("What's New"). English copy — this is
// the source of truth for the in-app What's New modal (src/ui/views/
// whats-new.ts). Keep the newest release first. Developer-facing detail
// lives in CHANGELOG.md; this is the friendly, player-facing version.
// =====================================================================

export interface ReleaseNote {
  version: string;
  date: string; // YYYY-MM-DD
  title: string;
  changes: { icon: string; text: string }[];
}

export const RELEASES: ReleaseNote[] = [
  {
    version: '1.8.0',
    date: '2026-07-26',
    title: 'Daily Front & Centre',
    changes: [
      { icon: '📅', text: 'Home now opens on the Daily Puzzle itself — today\'s difficulty, your rank, and a countdown to the reset, instead of a generic menu' },
      { icon: '✨', text: 'The board reacts as you play: digits pop in, wrong ones shake, and completing a row, column or box sends a ripple out from your move' },
      { icon: '🔢', text: 'Placing the last of a digit now lights up all nine of them and retires that key on the numpad' },
      { icon: '📋', text: 'New spoiler-free result you can copy and paste anywhere — it shows the shape of today\'s puzzle and your time without giving away a single answer' },
      { icon: '👆', text: 'Fixed taps landing on the wrong cell or digit — the board was rebuilding itself on every single press' },
      { icon: '🔇', text: 'Background music now stays off while you\'re solving, and comes back when you leave the puzzle' },
    ],
  },
  {
    version: '1.7.0',
    date: '2026-07-24',
    title: 'Profile Country',
    changes: [
      { icon: '🌍', text: 'You can now set your country in your Profile — also unlocks the Globetrotter medal' },
    ],
  },
  {
    version: '1.6.0',
    date: '2026-07-19',
    title: 'Weekly Quests & Continue',
    changes: [
      { icon: '🗓️', text: 'Weekly Quests — a new set of challenges alongside Daily Quests, resetting every Monday. Find both in one place: tap Quests on Home and switch between Daily/Weekly tabs' },
      { icon: '💰', text: 'Continue — run out of hearts in Daily or Practice? Spend coins to keep going instead of starting over (not available in Random Mode, where losing resets your streak on purpose)' },
      { icon: '📊', text: 'The Quests row on Home now shows your progress at a glance, plus a badge when you have rewards waiting to be claimed' },
      { icon: '📱', text: 'Fixed the board layout breaking when playing in landscape on mobile — the app now asks you to rotate back to portrait' },
      { icon: '🐛', text: 'Fixed a few smaller UI issues: toast notifications weren\'t centered, and the volume sliders in Settings had a stray line through them' },
    ],
  },
  {
    version: '1.4.0',
    date: '2026-07-16',
    title: 'Coin & Level Rebalance',
    changes: [
      { icon: '🪙', text: 'Rebalanced coin/XP rewards for every medal to be more in line with the shop — every account\'s coins and level were recalculated under the new formula (if your numbers changed, that\'s not a bug, it\'s this rebalance)' },
      { icon: '📈', text: 'Leveling up is much faster now, down from needing a huge amount of XP to reach higher levels' },
      { icon: '🎁', text: 'Levels actually matter now! Practice/Random mode grants bonus free hints as you level up (up to +3)' },
      { icon: '⚙️', text: 'Added a Settings page — game options, account, official community links, and What’s New' },
    ],
  },
  {
    version: '1.3.2',
    date: '2026-07-14',
    title: 'Daily Quest Fix',
    changes: [
      { icon: '🗓️', text: 'Fixed the quest reset time to be consistent system-wide (midnight UTC) — playing between midnight and 7am UTC could previously cause quests to not count' },
      { icon: '🎯', text: 'Reduced the number of daily quests from 6 to 5' },
    ],
  },
];
