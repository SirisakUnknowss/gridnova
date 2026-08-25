// submit-time-attack-score — replay the run against the issued ticket.
//
// The client sends moves, not a score. Everything that decides the leaderboard
// position is recomputed here from the ticket's stored solution and its
// server-written issued_at, so "seconds left" cannot be invented.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface Move { r: number; c: number; n: number; t: number; isHint?: boolean }
interface Payload {
  ticket_id: string;
  time_seconds: number;
  mistakes: number;
  hints_used: number;
  moves: Move[];
}

const TIERS: Record<string, number> = { sprint: 180, rush: 300, marathon: 600 };

const MIN_TIME: Record<string, number> = {
  'easy': 45, 'easy-medium': 70, 'medium': 100,
  'medium-hard': 130, 'hard': 160, 'hard-expert': 200, 'expert': 240,
};

const BASE_SCORE: Record<string, number> = {
  'easy': 1000, 'easy-medium': 1500, 'medium': 2000,
  'medium-hard': 2800, 'hard': 3500, 'hard-expert': 4200, 'expert': 5000,
};

const BASE_COIN: Record<string, number> = {
  'easy': 5, 'easy-medium': 8, 'medium': 10,
  'medium-hard': 15, 'hard': 20, 'hard-expert': 28, 'expert': 35,
};

const BASE_XP: Record<string, number> = {
  'easy': 50, 'easy-medium': 80, 'medium': 100,
  'medium-hard': 150, 'hard': 200, 'hard-expert': 280, 'expert': 350,
};

// Mirrors computeTimeAttackScore() in src/engine/scoring.ts — keep in step.
function computeScore(
  difficulty: string, tier: string, timeSeconds: number, mistakes: number, hints: number,
): { score: number; secondsLeft: number } {
  const limit = TIERS[tier];
  const secondsLeft = Math.max(0, limit - timeSeconds);
  const base = BASE_SCORE[difficulty];
  const timeBonus = Math.round(base * (secondsLeft / limit));
  const flawless = mistakes === 0 && hints === 0 ? 300 : 0;
  const score = Math.max(100, base + timeBonus - mistakes * 100 - hints * 250 + flawless);
  return { score, secondsLeft };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function respond(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
function reject(code: string, details?: unknown) {
  return respond(403, { error: { code, message: code, details } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return respond(405, { error: 'Method Not Allowed' });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return reject('UNAUTHORIZED');

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
  if (authErr || !user) return reject('UNAUTHORIZED');

  let payload: Payload;
  try { payload = await req.json(); } catch { return reject('INVALID_PAYLOAD'); }
  if (!payload.ticket_id || !Array.isArray(payload.moves)) return reject('INVALID_PAYLOAD');

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: ticket, error: tErr } = await supabaseAdmin
    .from('time_attack_tickets')
    .select('*')
    .eq('id', payload.ticket_id)
    .maybeSingle();
  if (tErr || !ticket) return reject('NO_TICKET');
  if (ticket.user_id !== user.id) return reject('NOT_YOUR_TICKET');
  if (ticket.consumed_at) return reject('ALREADY_SUBMITTED');

  const limit = TIERS[ticket.tier];
  if (!limit) return reject('INVALID_TIER');

  // The wall clock the player actually ran against. Allow a small grace for
  // the round trip; without it a legitimate finish at 2:59.7 could be refused.
  const elapsedServerSec = Math.floor((Date.now() - new Date(ticket.issued_at).getTime()) / 1000);
  if (elapsedServerSec > limit + 15) return reject('TIME_EXPIRED');
  if (payload.time_seconds > limit) return reject('TIME_EXPIRED');
  if (payload.time_seconds > elapsedServerSec + 5) return reject('TIME_MISMATCH');
  if (payload.time_seconds < (MIN_TIME[ticket.difficulty] ?? 45)) return reject('TOO_FAST');

  // Replay
  const board = ticket.puzzle.split('').map((c: string) => parseInt(c, 10));
  const solution = ticket.solution.split('').map((c: string) => parseInt(c, 10));
  let mistakeCount = 0;
  let hintCount = 0;
  let prevTime = 0;
  for (const m of payload.moves) {
    if (m.r < 0 || m.r > 8 || m.c < 0 || m.c > 8 || m.n < 0 || m.n > 9) return reject('INVALID_MOVE');
    if (m.t < prevTime) return reject('TIME_NON_MONOTONIC');
    if (m.t > payload.time_seconds * 1000 + 1000) return reject('MOVE_AFTER_END');
    prevTime = m.t;
    const idx = m.r * 9 + m.c;
    if (ticket.puzzle[idx] !== '0' && !m.isHint) return reject('MODIFIED_GIVEN');
    if (m.isHint) hintCount++;
    if (m.n !== 0 && m.n !== solution[idx]) mistakeCount++;
    board[idx] = m.n;
  }
  if (hintCount > 3) return reject('TOO_MANY_HINTS');
  for (let i = 0; i < 81; i++) if (board[i] !== solution[i]) return reject('SOLUTION_MISMATCH');
  if (hintCount !== payload.hints_used) return reject('HINT_COUNT_MISMATCH');
  if (Math.abs(mistakeCount - payload.mistakes) > 2) return reject('MISTAKE_COUNT_MISMATCH');

  const { score, secondsLeft } = computeScore(
    ticket.difficulty, ticket.tier, payload.time_seconds, mistakeCount, hintCount,
  );

  // Burn the ticket first: if the insert then fails on the unique constraint
  // the run is already spent, which is the safe direction to fail in.
  await supabaseAdmin
    .from('time_attack_tickets')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', ticket.id);

  const { error: insErr } = await supabaseAdmin.from('time_attack_leaderboard').insert({
    user_id: user.id,
    ticket_id: ticket.id,
    tier: ticket.tier,
    difficulty: ticket.difficulty,
    score,
    time_seconds: payload.time_seconds,
    seconds_left: secondsLeft,
    mistakes: mistakeCount,
    hints_used: hintCount,
  });
  if (insErr) {
    if (insErr.code === '23505') return reject('ALREADY_SUBMITTED');
    return respond(500, { error: { code: 'INTERNAL_ERROR', message: insErr.message } });
  }

  const coinReward = BASE_COIN[ticket.difficulty] ?? 10;
  const xpReward = BASE_XP[ticket.difficulty] ?? 100;

  await supabaseAdmin.rpc('grant_coins', {
    p_user_id: user.id,
    p_amount: coinReward,
    p_reason: 'time_attack_win',
    p_metadata: { tier: ticket.tier, score },
  });
  await supabaseAdmin.rpc('grant_xp', { p_user_id: user.id, p_amount: xpReward });

  const { data: rankRow } = await supabaseAdmin
    .rpc('get_time_attack_leaderboard', { p_tier: ticket.tier, p_limit: 500 });
  const myRank = Array.isArray(rankRow)
    ? (rankRow.find((r: { user_id: string }) => r.user_id === user.id)?.rank ?? null)
    : null;

  // Not rankRow.length — that is capped by p_limit above, so past 500 players
  // the denominator would silently freeze.
  const { data: playerCount } = await supabaseAdmin
    .rpc('get_time_attack_player_count', { p_tier: ticket.tier });

  return respond(200, {
    score,
    seconds_left: secondsLeft,
    mistakes: mistakeCount,
    hints_used: hintCount,
    rank: myRank,
    total_players: typeof playerCount === 'number' ? playerCount : null,
    coins: coinReward,
    xp: xpReward,
  });
});
