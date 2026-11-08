# GridNova — Player FAQ Knowledge Base

GridNova is a free 9×9 Sudoku game that runs in the browser and can be installed
as an app (PWA). Play at https://gridnova.pages.dev — on phones, open it in
Chrome/Safari and use "Add to Home Screen" to install.

Keep this file in sync with the game when rules change (prices, modes, rewards).

## Sudoku rules
Fill the 9×9 grid so every row, every column and every 3×3 box contains 1–9
exactly once. Every puzzle has exactly one solution — no guessing needed.

Controls: tap a cell, then a number. **Notes** pencils in candidates.
**Undo/Redo** step through moves. **Erase** clears a cell.
Desktop shortcuts: Z Undo, Y Redo, E Erase, N Notes, H Hint, Esc Menu.

Difficulties: easy, easy-medium, medium, medium-hard, hard, hard-expert, expert.

## Game modes
- **Daily Puzzle** — one puzzle per day, the same for everyone, ranked on a global
  leaderboard by score. One attempt per day. A new puzzle starts at 00:00 UTC
  (07:00 Thailand time). Difficulty follows the weekday (UTC): Mon easy,
  Tue easy-medium, Wed medium, Thu medium-hard, Fri hard, Sat hard-expert,
  Sun expert.
- **Practice** — any difficulty, any time, unlimited. Never costs a heart.
- **Random Mode** — one tap, random difficulty, builds a win streak. Losing a
  single game resets the streak to 0 (that is the point of the mode). Bonus coins
  every 5-win streak. No continues allowed.
- **Time Attack** — solve before the countdown ends. Requires an account.
  Tiers: Sprint 3 min (easy), Rush 5 min (medium), Marathon 10 min (hard).
  Each tier has its own leaderboard (your best run counts). Score rewards time
  left on the clock. No continues, 3 free hints, no paid hints.
- **Book Mode** — no right/wrong feedback while you play; just you and the grid.
  Free (no heart cost).
- **Monthly Challenge** — a separate calendar of puzzles (medium) for each date
  of the month. Requires an account. Each completed date gives 100 coins once.
  Cosmetic rewards unlock at 5, 10, 15, 20, 25 and 30 completed dates (days do
  not need to be consecutive). Missed dates stay playable until the month ends;
  rewards must be claimed before the month ends and are then equipped from
  Profile → My Collection. Old collections cannot be reopened.
  November 2026 "Moonlit Wishes" rewards: Lotus Girl avatar (5), Lotus Orbit
  frame (10), Moonlit River theme (15), Moonlit Boy avatar (20), Full Moon Halo
  frame (25), River of Stars theme (30). December 2026 is "Christmas Day".
- **Star Mode** — currently only a UI preview, not playable yet.
- **Season** (bottom nav tab) — coming soon, no release date announced.

## Hearts (energy) — two different things
1. **Lives inside a game**: 3 mistakes ends that game (game over).
2. **Hearts energy (pill on the Home header)**: max 5. Starting Daily, Random,
   Time Attack or a Monthly puzzle costs 1 heart. **Winning refunds it**, so only
   a loss, game over or quitting really spends a heart. Practice and Book Mode
   never cost a heart. Resuming an unfinished Daily does not charge again.
   - Signed-in members regain +1 heart every 30 minutes (up to 5).
   - Guests (not signed in) do not regenerate over time; they refill to 5 at
     00:00 UTC (07:00 Thailand). Signing up refills hearts to full immediately.
   - **Infinite Hearts** (members only): tap the hearts pill on Home to buy with
     coins — 1h 800, 2h 1,400, 3h 1,900, 5h 2,800 coins. Stacks if you buy more.

## Hints
- 3 free hints per game in every mode.
- Practice and Random give extra free hints as you level up: +1 at level 20,
  +2 at 40, +3 at 60 (max 6).
- Practice and Random can buy up to 3 more hints: 50, 75, then 100 coins.
- Daily, Time Attack and Book Mode: hints stay fixed at 3 and cannot be bought,
  so the leaderboards stay fair.
- Hints lower your score (see Scoring).

## Continue (after 3 mistakes)
A continue does not reveal answers; it restores your lives so you can keep going.
Up to 3 continues per game.
- Daily: 2,500 / 4,000 / 10,000 coins.
- Practice: depends on difficulty (base cost ×1, ×1.6, ×4). Base: easy 300,
  easy-medium 450, medium 600, medium-hard 900, hard 1,200, hard-expert 1,600,
  expert 2,000 coins.
- Not available in Random, Time Attack or Book Mode.
- Mistakes still count toward your score after a continue — a continue cannot
  buy a better leaderboard rank.

## Scoring
Daily score = base − 2 per second − 100 per mistake − 300 per hint
+ 500 if no mistakes + 300 if no hints (minimum 100).
Base by difficulty: easy 1,000 · easy-medium 1,500 · medium 2,000 ·
medium-hard 2,800 · hard 3,500 · hard-expert 4,200 · expert 5,000.
Practice is gentler: time penalty capped at half the base, −50 per mistake,
−150 per hint.
Time Attack: base + bonus for time left (finishing with all time left would
double the base) − 100 per mistake − 250 per hint + 300 if flawless.

## Coins, XP, levels
- Finishing puzzles earns coins and XP. Daily gives more (25–100 coins by
  difficulty, ×1.3 with no mistakes, ×1.2 with no hints). Practice gives 2–17
  coins by difficulty. Daily quests, weekly quests, Monthly Challenge and
  achievements also give coins.
- XP levels you up (max level 100). Each level needs more XP than the last.
- Coins buy themes, backgrounds, board colors and avatars in the Shop, plus
  hints, continues and Infinite Hearts.
- Daily quests: 3 new quests every day (e.g. play a game, win without hints,
  win without mistakes, win fast, play the Daily). Claim rewards in Quests.
- Achievements (Medals tab): unlocked by play volume, daily streaks, skill,
  leaderboard ranks and progression. Tiers bronze → diamond.
- Streak: playing the Daily on consecutive days builds your streak.

## Accounts & progress
- You can play as a guest. Guest progress is stored on that device/browser only;
  clearing browser data or switching device can lose it. Create an account
  (Profile) to save progress to the cloud and play on any device — games you
  finished as a guest are carried over when you sign up.
- Leaderboards, Time Attack, Monthly Challenge and Infinite Hearts need an
  account.
- Referral: share your invite code from Profile; the reward is granted about 3 days after your friend joins.

## Themes & look
Themes change the board and app colors: Classic (default), Paper, Dark, Pastel,
Ocean, Forest, Sunset, Neon, Sakura, Thai, Mono, plus monthly reward themes.
"GridNova V1" restores the original clean look. Owned cosmetics are in
Profile → My Collection.

## Common problems
- **Game didn't update / looks old**: close every GridNova tab or the installed
  app completely and reopen it; the new version installs on the next launch.
- **Lost progress**: if you were playing as a guest and cleared browser data or
  changed device, guest progress can't be restored. Members: sign in with the
  same method you used before. Otherwise contact support.
- **Coins/purchase/score looks wrong, account problems, bugs**: the bot can't
  see or change accounts. Report in the #bug-report channel or message the
  GridNova Facebook page (Profile → Settings → Contact Support) with what you
  were doing, what you expected, and a screenshot.
- **Out of hearts**: play Practice or Book Mode (free), wait for regen
  (members), wait for 00:00 UTC (guests), sign up for an instant refill, or buy
  Infinite Hearts.

## Support & community
- Discord server (this server): https://discord.gg/QFRYAaC8qB — ask in #help, report bugs in #bug-report, news in #announcements. Also linked in the game under Profile → Settings → Official Community.
- Facebook page (support): https://www.facebook.com/profile.php?id=61591484931870
- Facebook group: https://www.facebook.com/groups/926777207089534
- "Buy Me a Coffee" in Profile is an optional PromptPay tip to support the indie developer (scan with any Thai banking app).
