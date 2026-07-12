// =====================================================================
// Tests for src/lib/level.ts — XP curve invariants
// Must match supabase/migrations/20260101000004_functions.sql's grant_xp
// =====================================================================
import { describe, it, expect } from 'vitest';
import { xpForLevel, applyXpGain, levelProgress } from '../../src/lib/level';

describe('xpForLevel', () => {
  it('is monotonically increasing', () => {
    for (let lvl = 1; lvl < 100; lvl++) {
      expect(xpForLevel(lvl + 1)).toBeGreaterThan(xpForLevel(lvl));
    }
  });
  it('matches the server formula floor(100 * L^1.6)', () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(Math.floor(100 * Math.pow(2, 1.6)));
    expect(xpForLevel(5)).toBe(Math.floor(100 * Math.pow(5, 1.6)));
  });
});

describe('applyXpGain', () => {
  it('stays level 1 with no gain', () => {
    const r = applyXpGain(1, 0, 0);
    expect(r).toEqual({ level: 1, xp: 0 });
  });
  it('carries leftover xp within the same level', () => {
    const r = applyXpGain(1, 0, 50);
    expect(r.level).toBe(1);
    expect(r.xp).toBe(50);
  });
  it('levels up exactly at the threshold, resetting xp in the new level', () => {
    const needed = xpForLevel(1);
    const r = applyXpGain(1, 0, needed);
    expect(r.level).toBe(2);
    expect(r.xp).toBe(0);
  });
  it('can carry a level-up across multiple levels in one gain', () => {
    const r = applyXpGain(1, 0, xpForLevel(1) + xpForLevel(2) + 10);
    expect(r.level).toBe(3);
    expect(r.xp).toBe(10);
  });
  it('never exceeds level 100', () => {
    const r = applyXpGain(1, 0, 10_000_000);
    expect(r.level).toBeLessThanOrEqual(100);
  });
});

describe('levelProgress', () => {
  it('fraction is between 0 and 1', () => {
    for (const [level, xp] of [[1, 0], [1, 50], [3, 100], [10, 0], [10, 5000]] as const) {
      const p = levelProgress(level, xp);
      expect(p.fraction).toBeGreaterThanOrEqual(0);
      expect(p.fraction).toBeLessThanOrEqual(1);
    }
  });
  it('xpForNext shrinks as xpInLevel grows', () => {
    const early = levelProgress(3, 10);
    const late = levelProgress(3, xpForLevel(3) - 10);
    expect(late.xpForNext).toBeLessThan(early.xpForNext);
  });
});
