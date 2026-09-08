// =====================================================================
// Practice daily play limit — client wrapper around the server RPCs,
// with a localStorage fallback for guests (who have no auth session).
// Mirrors the split used by src/lib/hearts.ts.
// =====================================================================
import { supabase } from './supabase';

export const PRACTICE_DAILY_LIMIT = 10;
/** How many extra plays one coin purchase grants. */
export const PRACTICE_EXTRA_PACK = 5;

/** Coin price of a +5 pack per difficulty. Mirror of _practice_pack_price
 *  on the server — kept here only for display; the server is the one that
 *  charges. */
export const PRACTICE_PACK_PRICES: Record<string, number> = {
  'easy': 300,
  'easy-medium': 400,
  'medium': 500,
  'medium-hard': 650,
  'hard': 800,
  'hard-expert': 1000,
  'expert': 1200,
};

export interface LevelUsage { used: number; extra: number }
export type PracticeUsage = Record<string, LevelUsage>;
/** Lifetime finished games per difficulty — the unlock ledger. Only grows. */
export type PracticeTotals = Record<string, number>;

/** The difficulty ladder shown in the Practice picker, in unlock order.
 *  Easy is always open; each later rung needs PRACTICE_UNLOCK_AT finished
 *  games on the one before it. */
export const PRACTICE_LADDER = ['easy', 'medium', 'hard', 'expert'] as const;
export const PRACTICE_UNLOCK_AT = 10;

export function previousLevel(level: string): string | null {
  const i = (PRACTICE_LADDER as readonly string[]).indexOf(level);
  return i > 0 ? PRACTICE_LADDER[i - 1] : null;
}

/** An unlock is permanent: totals never decrease, and any play already
 *  recorded at a difficulty keeps it open regardless of the rung below —
 *  which is what keeps players who predate the ladder from being re-locked. */
export function isLevelUnlocked(totals: PracticeTotals, level: string): boolean {
  const prev = previousLevel(level);
  if (!prev) return true;
  if ((totals[level] ?? 0) > 0) return true;
  return (totals[prev] ?? 0) >= PRACTICE_UNLOCK_AT;
}

/** How far along the unlock for `level` is, or null when it is already open. */
export function unlockProgress(
  totals: PracticeTotals,
  level: string,
): { prev: string; have: number; need: number } | null {
  if (isLevelUnlocked(totals, level)) return null;
  const prev = previousLevel(level)!;
  return { prev, have: Math.min(totals[prev] ?? 0, PRACTICE_UNLOCK_AT), need: PRACTICE_UNLOCK_AT };
}

export function usageFor(usage: PracticeUsage, level: string): LevelUsage {
  return usage[level] ?? { used: 0, extra: 0 };
}

/** Plays left today on one difficulty. Clamped at 0 — a resumed game can
 *  push `used` past the cap, and a negative count would read as nonsense. */
export function remainingFor(usage: PracticeUsage, level: string): number {
  const u = usageFor(usage, level);
  return Math.max(0, PRACTICE_DAILY_LIMIT + u.extra - u.used);
}

/** Total plays available today on one difficulty (cap + anything bought). */
export function allowanceFor(usage: PracticeUsage, level: string): number {
  return PRACTICE_DAILY_LIMIT + usageFor(usage, level).extra;
}

// ---------------------------------------------------------------------
// Guest counters (local). Same reasoning as guest hearts: no auth session
// means no server row, so the day's usage lives in localStorage and rolls
// over with the UTC date.
// ---------------------------------------------------------------------
const GUEST_KEY = 'gn_practice_plays_v1';

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

interface GuestPlays { date: string; levels: PracticeUsage; totals: PracticeTotals }

export function readGuestPlays(): GuestPlays {
  let stored: Partial<GuestPlays> | null = null;
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (raw) stored = JSON.parse(raw) as Partial<GuestPlays>;
  } catch { /* ignore */ }

  const today = todayUtc();
  // Only the daily counters roll over — totals are the unlock ledger and
  // must survive the date change.
  const totals = (stored && typeof stored.totals === 'object' && stored.totals) || {};
  if (!stored || stored.date !== today || typeof stored.levels !== 'object') {
    const fresh: GuestPlays = { date: today, levels: {}, totals };
    writeGuestPlays(fresh);
    return fresh;
  }
  return { date: stored.date, levels: stored.levels as PracticeUsage, totals };
}

function writeGuestPlays(v: GuestPlays): void {
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(v)); } catch { /* ignore */ }
}

export function recordGuestPlay(level: string): GuestPlays {
  const g = readGuestPlays();
  const cur = usageFor(g.levels, level);
  g.levels[level] = { used: cur.used + 1, extra: cur.extra };
  g.totals[level] = (g.totals[level] ?? 0) + 1;
  writeGuestPlays(g);
  return g;
}

// ---------------------------------------------------------------------
// Server (members)
// ---------------------------------------------------------------------
export interface PlaysState {
  ok: boolean;
  date: string;
  limit: number;
  pack: number;
  unlock_at: number;
  levels: PracticeUsage;
  totals: PracticeTotals;
  reason?: string;
}

export async function getPracticePlays(): Promise<PlaysState | null> {
  const { data, error } = await supabase.rpc('get_practice_plays');
  if (error) return null;
  return data as PlaysState;
}

export async function recordPracticePlay(
  level: string,
): Promise<{ usage: LevelUsage; total: number } | null> {
  const { data, error } = await supabase.rpc('record_practice_play', { p_level: level });
  if (error) return null;
  const res = data as { ok: boolean; used?: number; extra?: number; total?: number };
  if (!res?.ok) return null;
  return { usage: { used: res.used ?? 0, extra: res.extra ?? 0 }, total: res.total ?? 0 };
}

export async function buyPracticePlays(
  level: string,
): Promise<{ ok: boolean; used?: number; extra?: number; balance?: number; reason?: string } | null> {
  const { data, error } = await supabase.rpc('buy_practice_plays', { p_level: level });
  if (error) return null;
  return data as { ok: boolean; used?: number; extra?: number; balance?: number; reason?: string };
}

/** Milliseconds until the counters reset (next UTC midnight). */
export function msUntilReset(): number {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(0, next - now.getTime());
}
