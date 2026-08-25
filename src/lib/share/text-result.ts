// =====================================================================
// Text share — the Wordle-style result string.
//
// The image cards are trophies: nice to look at, but a person scrolling
// past one has no reason to care. This is the other half — a compact,
// spoiler-free block of text that pastes natively into LINE/Facebook/X
// (no image upload, no compression) and reads as a small puzzle in its
// own right to anyone who hasn't played.
//
// The grid encodes only which cells the puzzle *gave* you, never a
// single digit — so it spoils nothing, yet everyone who played the same
// Daily gets the same shape. That shared fingerprint is the hook: you
// recognise today's grid in someone else's post.
// =====================================================================
import type { GameResult } from '@ui/views/game';
import { formatTime } from '@lib/format';

// Exported so every share text uses the same string. Keep the scheme: LINE,
// Facebook and Messenger only auto-link a bare domain inconsistently, so
// "gridnova.pages.dev" pastes as plain text nobody can tap.
export const SITE_URL = 'https://gridnova.pages.dev/';

/** Date of Daily Puzzle #1 — the numbering anchor (UTC). */
const DAILY_EPOCH = Date.UTC(2026, 4, 27); // 2026-05-27

const GIVEN = '🟪'; // clue the puzzle handed you (brand purple)
const SOLVED = '⬜'; // cell you had to work out yourself

const DIFF_LABEL: Record<string, string> = {
  easy: 'Easy',
  'easy-medium': 'Easy-Medium',
  medium: 'Medium',
  'medium-hard': 'Medium-Hard',
  hard: 'Hard',
  'hard-expert': 'Hard-Expert',
  expert: 'Expert',
};

/** Daily puzzle number for a YYYY-MM-DD date, 1-based. */
export function dailyNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const days = Math.round((Date.UTC(y, m - 1, d) - DAILY_EPOCH) / 86_400_000);
  return days + 1;
}

function grid(puzzle: number[][]): string {
  return puzzle.map(row => row.map(v => (v !== 0 ? GIVEN : SOLVED)).join('')).join('\n');
}

export interface TextResultOptions {
  result: GameResult;
  /** YYYY-MM-DD — required for the Daily puzzle number. */
  date?: string;
  rank?: number;
}

/**
 * Build the shareable result text. Kept deliberately short: a header line,
 * the grid, one stat line, and the link.
 */
export function buildResultText({ result, date, rank }: TextResultOptions): string {
  const isDaily = result.mode === 'daily';
  const n = isDaily && date ? dailyNumber(date) : 0;

  const header = isDaily && n > 0
    ? `GridNova Daily #${n}`
    : `GridNova · ${DIFF_LABEL[result.difficulty] ?? result.difficulty}`;

  const stats: string[] = [`⏱️ ${formatTime(result.timeSeconds)}`];
  if (result.mistakes === 0 && result.hintsUsed === 0) stats.push('✨ Perfect');
  else if (result.mistakes === 0) stats.push('✅ No mistakes');
  else stats.push(`❌ ${result.mistakes}`);
  if (rank && rank > 0) stats.push(`🏆 #${rank}`);

  return [
    isDaily && n > 0 ? `${header} · ${DIFF_LABEL[result.difficulty] ?? result.difficulty}` : header,
    '',
    grid(result.puzzle),
    '',
    stats.join('  ·  '),
    SITE_URL,
  ].join('\n');
}
