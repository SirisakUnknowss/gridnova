// =====================================================================
// XP / Level curve
// Matches the server's grant_xp Postgres function exactly: xp is stored
// as "XP earned within the current level" (it resets/subtracts on each
// level-up), NOT a lifetime cumulative total. Any formula here must stay
// in sync with supabase/migrations/*_flatten_level_curve.sql.
//   xpForLevel(L) = floor(60 * L^1.2) — XP needed to clear level L
//   (cumulative L1->L100 ≈ 677K, vs ≈6.0M under the old 100*L^1.6 curve)
// =====================================================================

export function xpForLevel(level: number): number {
  return Math.floor(60 * Math.pow(Math.max(1, level), 1.2));
}

/**
 * Practice/Random mode gets bonus free hints as a level perk: +1 per 20
 * levels, capped at +3 (6 total at level 60+). Daily mode is intentionally
 * excluded — it has a global leaderboard, so hint count must stay equal
 * for everyone regardless of level.
 */
export function freeHintsForLevel(level: number): number {
  return 3 + Math.min(3, Math.floor(Math.max(1, level) / 20));
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
