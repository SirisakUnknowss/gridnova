import type { GameResult } from '@ui/views/game';
import { formatTime } from '@lib/format';

// Exported so every share text uses the same string. Keep the scheme: LINE,
// Facebook and Messenger only auto-link a bare domain inconsistently, so
// "gridnova.pages.dev" pastes as plain text nobody can tap.
export const SITE_URL = 'https://gridnova.pages.dev/';

/** Date of Daily Puzzle #1 — the numbering anchor (UTC). */
const DAILY_EPOCH = Date.UTC(2026, 4, 27); // 2026-05-27


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


export interface TextResultOptions {
  result: GameResult;
  /** YYYY-MM-DD — required for the Daily puzzle number. */
  date?: string;
  rank?: number;
}

/**
 * Build the shareable result text. Kept deliberately short: a header line,
 * one stat line, and the link.
 */
export function buildResultText({ result, date, rank }: TextResultOptions): string {
  const isDaily = result.mode === 'daily';
  const n = isDaily && date ? dailyNumber(date) : 0;

  const header = isDaily && n > 0
    ? `GridNova Daily #${n}`
    : `GridNova · ${DIFF_LABEL[result.difficulty] ?? result.difficulty}`;

  const stats: string[] = [`Time ${formatTime(result.timeSeconds)}`];
  if (result.mistakes === 0 && result.hintsUsed === 0) stats.push('Perfect');
  else if (result.mistakes === 0) stats.push('No mistakes');
  else stats.push(`Mistakes ${result.mistakes}`);
  if (rank && rank > 0) stats.push(`Rank #${rank}`);

  return [
    isDaily && n > 0 ? `${header} · ${DIFF_LABEL[result.difficulty] ?? result.difficulty}` : header,
    '',
    stats.join('  ·  '),
    SITE_URL,
  ].join('\n');
}
