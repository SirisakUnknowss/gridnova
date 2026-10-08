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
    version: '1.12.0',
    date: '2026-09-08',
    title: 'Heart Check',
    changes: [
      { icon: 'heart', text: 'Starting a game that costs a heart now asks first and shows how many you have left, so a mistap never spends one' },
      { icon: 'repeat', text: 'The check is skipped while Infinite Hearts is running, since nothing is being spent' },
      { icon: 'warning', text: 'Out of hearts? You go straight to the hearts screen instead of confirming something you cannot do yet' },
      { icon: 'close', text: 'Fixed the close button on pop-ups landing off the edge of the screen — on phones it hid under the browser bar and could not be tapped at all' },
    ],
  },
  {
    version: '1.11.0',
    date: '2026-09-05',
    title: 'Hearts',
    changes: [
      { icon: 'heart', text: 'New: Hearts — starting a Daily, Random, or Time Attack game now costs one heart. Win and you get it straight back, so only a loss actually spends one. Practice is always free and never touches your hearts' },
      { icon: 'repeat', text: 'You have up to 5 hearts. Signed-in players refill one every 30 minutes; guests start each day full and refill by signing in' },
      { icon: 'repeat', text: 'New: Infinite Hearts — tap your hearts to buy unlimited play for 1, 2, 3, or 5 hours, so you can keep going without spending a heart' },
      { icon: 'bookMode', text: 'Your in-game lives (the 3 you lose to mistakes) are unchanged — hearts are a separate, account-wide thing' },
      { icon: 'stats', text: 'Fixed the XP bar on Home getting stuck full and never levelling you up — it tracks your real progress again' },
      { icon: 'zap', text: 'Eased the XP needed for each level, so levelling up takes noticeably less grinding' },
      { icon: 'coin', text: 'The coin reward shown after a game now matches what actually lands in your wallet' },
    ],
  },
  {
    version: '1.10.0',
    date: '2026-08-24',
    title: 'Book Mode & Time Attack (Beta)',
    changes: [
      { icon: 'bookMode', text: 'New: Book Mode (Beta) — solve like a paper book. Nothing is marked right or wrong while you play; fill the whole grid to find out how you did, with an optional reveal if you\'re stuck' },
      { icon: 'timeAttack', text: 'New: Time Attack (Beta) — race the clock across 3 tiers (Sprint 3 min/Easy, Rush 5 min/Medium, Marathon 10 min/Hard), each with its own leaderboard' },
      { icon: 'brain', text: 'Both new modes are in beta — found something off? Tell us from Settings → Contact Support' },
      { icon: 'trophy', text: 'Fixed the Guests tab on the leaderboard showing the same scores for both Today and Yesterday' },
    ],
  },
  {
    version: '1.8.4',
    date: '2026-08-23',
    title: 'Leaderboard Tidy-Up',
    changes: [
      { icon: 'trophy', text: 'Long player names no longer shove the score and time off the edge of the card — names now shorten with an ellipsis so every score stays where it belongs. Fixed on both the Members and Guests tabs' },
    ],
  },
  {
    version: '1.8.0',
    date: '2026-07-26',
    title: 'Daily Front & Centre',
    changes: [
      { icon: 'daily', text: 'Home now opens on the Daily Puzzle itself — today\'s difficulty, your rank, and a countdown to the reset, instead of a generic menu' },
      { icon: 'sparkle', text: 'The board reacts as you play: digits pop in, wrong ones shake, and completing a row, column or box sends a ripple out from your move' },
      { icon: 'puzzle', text: 'Placing the last of a digit now lights up all nine of them and retires that key on the numpad' },
      { icon: 'notes', text: 'New spoiler-free result you can copy and paste anywhere — it shows the shape of today\'s puzzle and your time without giving away a single answer' },
      { icon: 'target', text: 'Fixed taps landing on the wrong cell or digit — the board was rebuilding itself on every single press' },
      { icon: 'soundOff', text: 'Background music now stays off while you\'re solving, and comes back when you leave the puzzle' },
    ],
  },
  // 1.7.0 is deliberately absent: its only entry announced the profile
  // country picker, which has since been removed. Leaving it would send
  // players looking for something that isn't there.
  {
    version: '1.6.0',
    date: '2026-07-19',
    title: 'Weekly Quests & Continue',
    changes: [
      { icon: 'quests', text: 'Weekly Quests — a new set of challenges alongside Daily Quests, resetting every Monday. Find both in one place: tap Quests on Home and switch between Daily/Weekly tabs' },
      { icon: 'coin', text: 'Continue — run out of hearts in Daily or Practice? Spend coins to keep going instead of starting over (not available in Random Mode, where losing resets your streak on purpose)' },
      { icon: 'chart', text: 'The Quests row on Home now shows your progress at a glance, plus a badge when you have rewards waiting to be claimed' },
      { icon: 'gamepad', text: 'Fixed the board layout breaking when playing in landscape on mobile — the app now asks you to rotate back to portrait' },
      { icon: 'warning', text: 'Fixed a few smaller UI issues: toast notifications weren\'t centered, and the volume sliders in Settings had a stray line through them' },
    ],
  },
  {
    version: '1.5.0',
    date: '2026-07-18',
    title: 'Settings Redesign & Background Music',
    changes: [
      { icon: 'brain', text: 'Settings got a full redesign — grouped into Sound, Notifications, Board, Official Community, Help & About, and Account' },
      { icon: 'soundOn', text: 'Added calm background music, with independent volume control for music and sound effects' },
      { icon: 'wave', text: 'Added real vibration feedback on cell input, toggleable in Settings' },
      { icon: 'bell', text: 'Daily Puzzle Reminder notifications are now live — enable them in Settings' },
      { icon: 'bookMode', text: 'Added How to Play, Contact Support, Privacy Policy, and Terms of Service pages' },
    ],
  },
  {
    version: '1.4.0',
    date: '2026-07-16',
    title: 'Coin & Level Rebalance',
    changes: [
      { icon: 'coin', text: 'Rebalanced coin/XP rewards for every medal to be more in line with the shop — every account\'s coins and level were recalculated under the new formula (if your numbers changed, that\'s not a bug, it\'s this rebalance)' },
      { icon: 'stats', text: 'Leveling up is much faster now, down from needing a huge amount of XP to reach higher levels' },
      { icon: 'gift', text: 'Levels actually matter now! Practice/Random mode grants bonus free hints as you level up (up to +3)' },
      { icon: 'brain', text: 'Added a Settings page — game options, account, official community links, and What’s New' },
    ],
  },
  {
    version: '1.3.2',
    date: '2026-07-14',
    title: 'Daily Quest Fix',
    changes: [
      { icon: 'quests', text: 'Fixed the quest reset time to be consistent system-wide (midnight UTC) — playing between midnight and 7am UTC could previously cause quests to not count' },
      { icon: 'target', text: 'Reduced the number of daily quests from 6 to 5' },
    ],
  },
];
