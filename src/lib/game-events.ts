// =====================================================================
// Game event log — fire-and-forget behavioural analytics.
//
// The database only ever recorded games that were WON, which left losses,
// game-overs, timeouts and abandons invisible. Those are exactly the
// events Hearts and the Practice cap act on, so both stayed unshippable
// until this existed. See supabase/migrations/*_game_events.sql.
//
// Every call here is best-effort: analytics must never delay or break a
// game, so nothing is awaited and nothing throws.
// =====================================================================
import { supabase, hasSupabaseConfig } from './supabase';
import { getSessionId } from './api';

export type GameEventName = 'start' | 'win' | 'game_over' | 'timeout' | 'abandon';

export interface GameEventPayload {
  event: GameEventName;
  mode: 'daily' | 'practice';
  /** null for plain Practice — the distinction user_game_history never kept. */
  origin?: 'random' | 'book' | 'time-attack';
  level: string;
  /** A reopened save, not a fresh attempt. Only meaningful on 'start'. */
  resumed?: boolean;
  timeSeconds?: number;
  mistakes?: number;
  hintsUsed?: number;
  paidHints?: number;
  continuesUsed?: number;
}

function rpcArgs(p: GameEventPayload): Record<string, unknown> {
  return {
    p_session_id: getSessionId(),
    p_event: p.event,
    p_mode: p.mode,
    p_level: p.level,
    p_origin: p.origin ?? null,
    p_resumed: p.resumed ?? false,
    p_time_seconds: p.timeSeconds ?? null,
    p_mistakes: p.mistakes ?? null,
    p_hints_used: p.hintsUsed ?? null,
    p_paid_hints: p.paidHints ?? null,
    p_continues_used: p.continuesUsed ?? null,
  };
}

/**
 * Send an event while the page is being torn down (tab closed, navigated
 * away). A normal fetch is cancelled on unload, so this goes out through
 * sendBeacon — which cannot set headers, hence the anon key in the query
 * string. That key already ships in the bundle, so it discloses nothing.
 *
 * Fired unauthenticated, so the row lands as a guest even for a signed-in
 * player: closing the tab is the one case we would rather record roughly
 * than not at all.
 */
export function recordGameEventOnUnload(p: GameEventPayload): void {
  if (!hasSupabaseConfig || typeof navigator.sendBeacon !== 'function') {
    recordGameEvent(p);
    return;
  }
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const endpoint = `${url}/rest/v1/rpc/record_game_event?apikey=${encodeURIComponent(key)}`;
    const blob = new Blob([JSON.stringify(rpcArgs(p))], { type: 'application/json' });
    if (!navigator.sendBeacon(endpoint, blob)) recordGameEvent(p);
  } catch {
    recordGameEvent(p);
  }
}

export function recordGameEvent(p: GameEventPayload): void {
  try {
    void supabase.rpc('record_game_event', rpcArgs(p)).then(() => {}, () => {});
  } catch { /* analytics must never break a game */ }
}
