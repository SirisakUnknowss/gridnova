// start-time-attack — issue a Time Attack puzzle and open a ticket.
//
// The solution never leaves this function. issued_at is written by Postgres,
// so it is the only clock the tier's time limit can safely be measured
// against: everything the client reports about timing is a claim.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// ============================================================
// Engine (ported from src/engine/) — self-contained
// ============================================================
type Board = number[][];
type Rng = () => number;
type Difficulty = 'easy'|'easy-medium'|'medium'|'medium-hard'|'hard'|'hard-expert'|'expert';

function seededRng(seed: number): Rng {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function shuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}
function cloneBoard(b: Board): Board { return b.map(r => r.slice()); }
function serialize(b: Board): string { return b.flat().join(''); }

function isValid(board: Board, r: number, c: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (i !== c && board[r][i] === n) return false;
    if (i !== r && board[i][c] === n) return false;
  }
  const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const rr = br+i, cc = bc+j;
    if ((rr !== r || cc !== c) && board[rr][cc] === n) return false;
  }
  return true;
}

function fillBoard(board: Board, rng: Rng): boolean {
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i/9), c = i%9;
    if (board[r][c] !== 0) continue;
    const nums = shuffle([1,2,3,4,5,6,7,8,9], rng);
    for (const n of nums) {
      if (isValid(board, r, c, n)) {
        board[r][c] = n;
        if (fillBoard(board, rng)) return true;
        board[r][c] = 0;
      }
    }
    return false;
  }
  return true;
}

function generateSolved(rng: Rng): Board {
  const b = emptyBoard();
  fillBoard(b, rng);
  return b;
}

function countSolutions(puzzle: Board, cap = 2): number {
  const board = cloneBoard(puzzle);
  const rows = new Array(9).fill(0);
  const cols = new Array(9).fill(0);
  const boxes = new Array(9).fill(0);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    const n = board[r][c];
    if (n) {
      const bit = 1 << n;
      rows[r] |= bit; cols[c] |= bit;
      boxes[Math.floor(r/3)*3 + Math.floor(c/3)] |= bit;
    }
  }
  let count = 0;
  function findBest(): { r: number; c: number; used: number } | null {
    let best: any = null, bestCount = 10;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const b = Math.floor(r/3)*3 + Math.floor(c/3);
      const used = rows[r] | cols[c] | boxes[b];
      let cnt = 0;
      for (let n = 1; n <= 9; n++) if (!(used & (1<<n))) cnt++;
      if (cnt < bestCount) { bestCount = cnt; best = { r, c, used }; if (cnt <= 1) return best; }
    }
    return best;
  }
  function solve(): boolean {
    if (count >= cap) return true;
    const next = findBest();
    if (!next) { count++; return count >= cap; }
    const { r, c, used } = next;
    const b = Math.floor(r/3)*3 + Math.floor(c/3);
    for (let n = 1; n <= 9; n++) {
      const bit = 1 << n;
      if (used & bit) continue;
      board[r][c] = n;
      rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
      if (solve()) { board[r][c] = 0; rows[r] &= ~bit; cols[c] &= ~bit; boxes[b] &= ~bit; return true; }
      board[r][c] = 0; rows[r] &= ~bit; cols[c] &= ~bit; boxes[b] &= ~bit;
    }
    return false;
  }
  solve();
  return count;
}

function removeClues(solved: Board, targetClues: number, rng: Rng): Board {
  const puzzle = cloneBoard(solved);
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => i), rng);
  let remaining = 81;
  for (const pos of positions) {
    if (remaining <= targetClues) break;
    const r = Math.floor(pos / 9), c = pos % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutions(puzzle, 2) !== 1) puzzle[r][c] = backup;
    else remaining--;
  }
  return puzzle;
}

const TARGET_CLUES: Record<Difficulty, number> = {
  'easy': 45, 'easy-medium': 40, 'medium': 35,
  'medium-hard': 32, 'hard': 28, 'hard-expert': 25, 'expert': 22,
};

function generatePuzzle(difficulty: Difficulty, seed: string) {
  const target = TARGET_CLUES[difficulty];
  for (let attempt = 0; attempt < 20; attempt++) {
    const rng = seededRng(hashString(seed + ':' + attempt));
    const solution = generateSolved(rng);
    const puzzle = removeClues(solution, target, rng);
    if (countSolutions(puzzle, 2) === 1) return { solution, puzzle };
  }
  throw new Error('failed to generate unique puzzle');
}

const TIERS = {
  sprint:   { seconds: 180, difficulty: 'easy'   as Difficulty },
  rush:     { seconds: 300, difficulty: 'medium' as Difficulty },
  marathon: { seconds: 600, difficulty: 'hard'   as Difficulty },
};

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
function reject(code: string) {
  return respond(403, { error: { code, message: code } });
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

  let body: { tier?: string };
  try { body = await req.json(); } catch { return reject('INVALID_PAYLOAD'); }

  const tier = body.tier as keyof typeof TIERS;
  if (!tier || !(tier in TIERS)) return reject('INVALID_TIER');
  const { difficulty, seconds } = TIERS[tier];

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // A fresh puzzle per attempt: unlike Daily, nobody is comparing the same
  // grid, so a repeat would only let a player re-run one they already know.
  const seed = `ta:${tier}:${user.id}:${Date.now()}:${Math.random()}`;
  let puzzle: Board, solution: Board;
  try {
    const generated = generatePuzzle(difficulty, seed);
    puzzle = generated.puzzle;
    solution = generated.solution;
  } catch {
    return respond(500, { error: { code: 'GENERATION_FAILED' } });
  }

  const { data: ticket, error: insErr } = await supabaseAdmin
    .from('time_attack_tickets')
    .insert({
      user_id: user.id,
      tier,
      difficulty,
      puzzle: serialize(puzzle),
      solution: serialize(solution),
    })
    .select('id, issued_at')
    .single();

  if (insErr || !ticket) return respond(500, { error: { code: 'TICKET_FAILED', message: insErr?.message } });

  return respond(200, {
    ticket_id: ticket.id,
    issued_at: ticket.issued_at,
    tier,
    difficulty,
    seconds,
    puzzle: serialize(puzzle),
  });
});
