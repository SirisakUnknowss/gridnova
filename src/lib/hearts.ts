// =====================================================================
// Global Hearts (energy) — client wrapper around the server RPCs.
// All state is server-authoritative; these helpers never compute a
// balance locally, only render what the server returns.
// =====================================================================
import { supabase } from './supabase';

export const HEARTS_MAX = 5;
export const HEARTS_REGEN_MINUTES = 30;

/** Coin price of the Infinite Hearts buff per duration. Mirror of the
 *  server price map in buy_infinite_hearts — kept here only for display;
 *  the server is the one that charges. */
export const INFINITE_HEARTS_PRICES: Record<number, number> = {
  1: 800,
  2: 1400,
  3: 1900,
  5: 2800,
};

export interface HeartsState {
  ok: boolean;
  hearts: number;
  max: number;
  regen_minutes: number;
  last_regen_at: string | null;
  infinite: boolean;
  infinite_until: string | null;
  reason?: string;
}

export interface ConsumeResult {
  ok: boolean;
  consumed: boolean;
  hearts: number;
  infinite: boolean;
  infinite_until?: string | null;
  last_regen_at?: string | null;
  reason?: string;
}

/** Modes that spend a heart on start. Practice (and Book) are always free. */
export function modeCostsHeart(mode: 'daily' | 'practice', origin?: string): boolean {
  if (mode === 'daily') return true;
  return origin === 'random' || origin === 'time-attack';
}

// ---------------------------------------------------------------------
// Guest hearts (local). Guests have no auth session (the app never signs
// in anonymously at boot), so their hearts live in localStorage: no drip
// regen, refilled to full when the UTC day rolls over. Running out is the
// nudge to sign up, which is where server-side regen begins.
// ---------------------------------------------------------------------
const GUEST_HEARTS_KEY = 'gn_guest_hearts_v1';

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

interface GuestHearts { hearts: number; date: string; }

export function readGuestHearts(): GuestHearts {
  let stored: GuestHearts | null = null;
  try {
    const raw = localStorage.getItem(GUEST_HEARTS_KEY);
    if (raw) stored = JSON.parse(raw) as GuestHearts;
  } catch { /* ignore */ }

  const today = todayUtc();
  if (!stored || stored.date !== today) {
    const fresh = { hearts: HEARTS_MAX, date: today };
    writeGuestHearts(fresh);
    return fresh;
  }
  return stored;
}

function writeGuestHearts(v: GuestHearts): void {
  try { localStorage.setItem(GUEST_HEARTS_KEY, JSON.stringify(v)); } catch { /* ignore */ }
}

/** Guest start gate. Returns consumed=false + ok=false when out of hearts. */
export function consumeGuestHeart(): { ok: boolean; consumed: boolean; hearts: number } {
  const g = readGuestHearts();
  if (g.hearts <= 0) return { ok: false, consumed: false, hearts: 0 };
  const next = { hearts: g.hearts - 1, date: g.date };
  writeGuestHearts(next);
  return { ok: true, consumed: true, hearts: next.hearts };
}

export function refundGuestHeart(): void {
  const g = readGuestHearts();
  writeGuestHearts({ hearts: Math.min(HEARTS_MAX, g.hearts + 1), date: g.date });
}

export async function getHearts(): Promise<HeartsState | null> {
  const { data, error } = await supabase.rpc('get_hearts');
  if (error) return null;
  return data as HeartsState;
}

export async function consumeHeart(mode: string): Promise<ConsumeResult | null> {
  const { data, error } = await supabase.rpc('consume_heart', { p_mode: mode });
  if (error) return null;
  return data as ConsumeResult;
}

export async function refundHeart(): Promise<void> {
  try { await supabase.rpc('refund_heart'); } catch { /* best-effort */ }
}

export async function buyInfiniteHearts(
  hours: number,
): Promise<{ ok: boolean; infinite_until?: string; hearts?: number; balance?: number; reason?: string } | null> {
  const { data, error } = await supabase.rpc('buy_infinite_hearts', { p_hours: hours });
  if (error) return null;
  return data as { ok: boolean; infinite_until?: string; hearts?: number; balance?: number; reason?: string };
}

/** Called right after a guest upgrades to a real account, to unblock play. */
export async function refillHeartsFull(): Promise<void> {
  try { await supabase.rpc('refill_hearts_full'); } catch { /* best-effort */ }
}

/** Milliseconds until the next heart regenerates, or null when full / on the
 *  guest (no-regen) path. Purely for the countdown UI. */
export function msUntilNextRegen(state: Pick<HeartsState, 'hearts' | 'max' | 'regen_minutes' | 'last_regen_at'>): number | null {
  if (state.hearts >= state.max || !state.last_regen_at) return null;
  const last = new Date(state.last_regen_at).getTime();
  const next = last + state.regen_minutes * 60_000;
  return Math.max(0, next - Date.now());
}

/** Milliseconds left on an active Infinite Hearts buff, or 0 when inactive. */
export function msInfiniteLeft(state: Pick<HeartsState, 'infinite' | 'infinite_until'>): number {
  if (!state.infinite || !state.infinite_until) return 0;
  return Math.max(0, new Date(state.infinite_until).getTime() - Date.now());
}

/** "1h 05m" / "42m" / "3m 12s" — compact human duration for countdowns. */
export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}
