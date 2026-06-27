# Changelog

## 1.0.3 — 2026-06-26

### Fixed
- **Timer**: pauses when the app/tab is minimised or backgrounded.
- **Board**: rounded corner cells; removed doubled hairline on the last row/column.
- **Leaderboard tabs**: inactive tabs no longer blend into the background.
- **Icon buttons**: back/edit glyphs are now centred.
- **You Won! confetti**: now actually renders (was wiped before display).

### Added
- In-game keyboard shortcuts (N = notes, H = hint) + button tooltips.
- Desktop drag-to-scroll for the Medals filter chips.
- Share sheet drag-to-dismiss.

### Changed
- Unified "Medals" naming across nav, Medals page, and profile.
- Home screen top spacing aligned with other views.

## 1.0.2 — 2026-06-26

### Fixed
- **Daily Puzzle**: scores now submit to the leaderboard and rewards are granted
  (root cause: server `TIME_MISMATCH` 403 when a game was paused or resumed —
  client now reports an effective `started_at` that matches actual play time).
- **Undo**: no longer refunds a lost heart (was a no-lose exploit).
- **Achievements**: "First Win" / "First Daily" now unlock
  (`check_and_grant_achievements` had no branch for them).

### Added
- Home screen shows the app version (and a STAGING badge on staging builds).

## 1.0.1
- Force SW cache bust; earlier fixes.
