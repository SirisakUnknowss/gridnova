// =====================================================================
// XP / Level curve
// Matches the server's grant_xp Postgres function exactly: xp is stored
// as "XP earned within the current level" (it resets/subtracts on each
// level-up), NOT a lifetime cumulative total. Any formula here must stay
// in sync with supabase/migrations/20260101000004_functions.sql.
//   xpForLevel(L) = floor(100 * L^1.6) — XP needed to clear level L
// =====================================================================

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(Math.max(1, level), 1.6));
}

/** Applies an XP gain the same way the server's grant_xp loop does. */
export function applyXpGain(currentLevel: number, xpInLevel: number, gained: number): { level: number; xp: number } {
  let level = Math.max(1, currentLevel);
  let xp = Math.max(0, xpInLevel) + Math.max(0, gained);
  while (level < 100) {
    const needed = xpForLevel(level);
    if (xp < needed) break;
    xp -= needed;
    level += 1;
  }
  return { level, xp };
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
  fraction: number;
}

/** `xpInLevel` is XP earned within the current level (server's raw `user_progression.xp`), not a cumulative total. */
export function levelProgress(level: number, xpInLevel: number): LevelProgress {
  const span = xpForLevel(level);
  const into = Math.max(0, Math.min(xpInLevel, span));
  return {
    level,
    xpIntoLevel: into,
    xpForNext: Math.max(0, span - into),
    fraction: span > 0 ? Math.min(1, into / span) : 1,
  };
}
