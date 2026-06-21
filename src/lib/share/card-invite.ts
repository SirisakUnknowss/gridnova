// Card F — Daily Invite Card (600×760) — share from game screen to invite friends
import { fillRoundRect, canvasToBlob, formatDateLabel } from './helpers';

const W = 600;
const H = 760;

const DIFF_COLORS: Record<string, string> = {
  easy: '#0bbf9c',
  medium: '#f39c12',
  hard: '#e74c3c',
  'extra-hard': '#6c5ce7',
  expert: '#4a2d9e',
};

const DIFF_EMOJI: Record<string, string> = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
  'extra-hard': '🟣',
  expert: '⚫',
};

// Sparse but realistic-looking sudoku clues
const CLUES: { r: number; c: number; v: string }[] = [
  { r: 0, c: 1, v: '9' }, { r: 0, c: 5, v: '5' },
  { r: 1, c: 2, v: '4' }, { r: 1, c: 6, v: '5' }, { r: 1, c: 7, v: '1' },
  { r: 2, c: 0, v: '8' }, { r: 2, c: 3, v: '7' }, { r: 2, c: 5, v: '2' }, { r: 2, c: 6, v: '6' },
  { r: 3, c: 1, v: '2' }, { r: 3, c: 4, v: '9' },
  { r: 4, c: 2, v: '1' }, { r: 4, c: 4, v: '5' }, { r: 4, c: 7, v: '3' }, { r: 4, c: 8, v: '6' },
  { r: 5, c: 0, v: '4' }, { r: 5, c: 4, v: '8' }, { r: 5, c: 6, v: '7' },
  { r: 6, c: 3, v: '4' }, { r: 6, c: 5, v: '3' }, { r: 6, c: 7, v: '9' },
  { r: 7, c: 2, v: '8' }, { r: 7, c: 8, v: '4' },
  { r: 8, c: 4, v: '8' }, { r: 8, c: 5, v: '2' },
];

export interface InviteCardData {
  date: string;
  difficulty: string;
  referralCode?: string;
  displayName?: string;
}

export async function renderInviteCard(data: InviteCardData): Promise<Blob | null> {
  const { date, difficulty, referralCode, displayName } = data;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // ── Full card background (light lavender) ──────────────────────────
  ctx.fillStyle = '#f0edff';
  ctx.fillRect(0, 0, W, H);

  // ── Purple header section ──────────────────────────────────────────
  const headerH = 172;
  const hg = ctx.createLinearGradient(0, 0, W, headerH);
  hg.addColorStop(0, '#2d1b69');
  hg.addColorStop(1, '#6c5ce7');
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, W, headerH);

  // Shimmer line
  const shimmer = ctx.createLinearGradient(0, 0, W, 0);
  shimmer.addColorStop(0, 'rgba(255,255,255,0)');
  shimmer.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  shimmer.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, headerH - 1, W, 1);

  ctx.textAlign = 'center';

  // GRIDNOVA label
  ctx.font = '700 12px "Inter", system-ui, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('GRIDNOVA', W / 2, 42);
  ctx.letterSpacing = '0px';

  // Headline
  ctx.font = '700 30px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText("Can you solve today's Sudoku?", W / 2, 88);

  // Date
  ctx.font = '400 14px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(formatDateLabel(date), W / 2, 116);

  // Difficulty badge in header
  const diffColor = DIFF_COLORS[difficulty] ?? '#6c5ce7';
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).replace(/-/g, ' ');
  const diffEmoji = DIFF_EMOJI[difficulty] ?? '🟣';
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  fillRoundRect(ctx, W / 2 - 68, 130, 136, 28, 14);
  ctx.font = '600 13px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(`${diffEmoji} ${diffLabel}`, W / 2, 148);

  // ── White sudoku grid card ─────────────────────────────────────────
  const cardPad = 24;
  const cardX = cardPad;
  const cardY = headerH + 20;
  const cardW = W - cardPad * 2;
  const cardH = cardW; // square

  // Card shadow
  ctx.shadowColor = 'rgba(108,92,231,0.18)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#ffffff';
  fillRoundRect(ctx, cardX, cardY, cardW, cardH, 20);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Grid dimensions
  const gridPad = 20;
  const gridX = cardX + gridPad;
  const gridY = cardY + gridPad;
  const gridSize = cardW - gridPad * 2;
  const cell = gridSize / 9;

  // Draw cell thin lines
  ctx.strokeStyle = '#ddd6fe';
  ctx.lineWidth = 1;
  for (let i = 1; i < 9; i++) {
    if (i % 3 === 0) continue; // skip — drawn as thick below
    // vertical
    ctx.beginPath();
    ctx.moveTo(gridX + i * cell, gridY);
    ctx.lineTo(gridX + i * cell, gridY + gridSize);
    ctx.stroke();
    // horizontal
    ctx.beginPath();
    ctx.moveTo(gridX, gridY + i * cell);
    ctx.lineTo(gridX + gridSize, gridY + i * cell);
    ctx.stroke();
  }

  // Draw 3×3 box thick lines + outer border
  ctx.strokeStyle = '#b8a9f5';
  ctx.lineWidth = 2.5;
  for (let i = 0; i <= 9; i += 3) {
    // vertical
    ctx.beginPath();
    ctx.moveTo(gridX + i * cell, gridY);
    ctx.lineTo(gridX + i * cell, gridY + gridSize);
    ctx.stroke();
    // horizontal
    ctx.beginPath();
    ctx.moveTo(gridX, gridY + i * cell);
    ctx.lineTo(gridX + gridSize, gridY + i * cell);
    ctx.stroke();
  }

  // Draw clue numbers
  const fontSize = Math.floor(cell * 0.52);
  CLUES.forEach(({ r, c, v }) => {
    const cx = gridX + c * cell + cell / 2;
    const cy = gridY + r * cell + cell / 2 + fontSize * 0.36;
    ctx.font = `600 ${fontSize}px "Inter", system-ui, sans-serif`;
    ctx.fillStyle = '#1a1440';
    ctx.textAlign = 'center';
    ctx.fillText(v, cx, cy);
  });

  // ── Footer section ─────────────────────────────────────────────────
  const footerY = cardY + cardH + 20;

  // Invite text
  if (displayName) {
    ctx.font = '400 14px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#6b5fa0';
    ctx.textAlign = 'center';
    ctx.fillText(`${displayName} invites you to play`, W / 2, footerY + 18);
  }

  // Referral code pill
  if (referralCode) {
    const pillY = footerY + (displayName ? 34 : 10);
    ctx.fillStyle = diffColor;
    fillRoundRect(ctx, W / 2 - 90, pillY, 180, 34, 17);
    ctx.font = '700 14px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`Code: ${referralCode}`, W / 2, pillY + 22);
  }

  // URL
  ctx.font = '400 13px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#a096c8';
  ctx.textAlign = 'center';
  ctx.fillText('gridnova.pages.dev', W / 2, H - 20);

  return canvasToBlob(canvas);
}
