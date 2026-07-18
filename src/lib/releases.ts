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
