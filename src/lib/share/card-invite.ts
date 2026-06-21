// Card F — Daily Invite Card (600×600) — share from game screen to invite friends
import { fillRoundRect, canvasToBlob, formatDateLabel } from './helpers';

const W = 600;
const H = 600;

const DIFF_COLORS: Record<string, string> = {
  easy: '#0bbf9c',
  medium: '#f39c12',
  hard: '#e74c3c',
  'extra-hard': '#6c5ce7',
  expert: '#2d1b69',
};

const DIFF_EMOJI: Record<string, string> = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
  'extra-hard': '🟣',
  expert: '⚫',
};

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

  // Deep purple BG
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1a0f4a');
  bg.addColorStop(0.55, '#3d2d9e');
  bg.addColorStop(1, '#6c5ce7');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Decorative grid pattern (subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 9; i++) {
    const x = 60 + i * (480 / 9);
    ctx.beginPath(); ctx.moveTo(x, 200); ctx.lineTo(x, 440); ctx.stroke();
    const y = 200 + i * (240 / 9);
    ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(540, y); ctx.stroke();
  }

  // Thicker 3x3 dividers on grid
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 2;
  for (let i of [0, 3, 6, 9]) {
    const x = 60 + i * (480 / 9);
    ctx.beginPath(); ctx.moveTo(x, 200); ctx.lineTo(x, 440); ctx.stroke();
    const y = 200 + i * (240 / 9);
    ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(540, y); ctx.stroke();
  }

  // Semi-transparent overlay on grid area
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  fillRoundRect(ctx, 60, 200, 480, 240, 12);

  // Top shimmer
  const shimmer = ctx.createLinearGradient(0, 0, W, 0);
  shimmer.addColorStop(0, 'rgba(255,255,255,0)');
  shimmer.addColorStop(0.5, 'rgba(255,255,255,0.25)');
  shimmer.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(40, 40, W - 80, 1.5);

  ctx.textAlign = 'center';

  // GRIDNOVA label
  ctx.font = '700 13px "Inter", system-ui, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('GRIDNOVA', W / 2, 76);
  ctx.letterSpacing = '0px';

  // Main headline
  ctx.font = '700 32px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 16;
  ctx.fillText("Can you solve today's", W / 2, 124);
  ctx.fillText('Sudoku? 🧩', W / 2, 162);
  ctx.shadowBlur = 0;

  // Date label
  ctx.font = '400 14px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(formatDateLabel(date), W / 2, 190);

  // Difficulty badge (centered on grid)
  const diffColor = DIFF_COLORS[difficulty] ?? '#6c5ce7';
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).replace(/-/g, ' ');
  const diffEmoji = DIFF_EMOJI[difficulty] ?? '🟣';

  ctx.fillStyle = diffColor;
  fillRoundRect(ctx, W / 2 - 70, 460, 140, 32, 16);
  ctx.font = '600 14px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(`${diffEmoji} ${diffLabel}`, W / 2, 480);

  // "? ? ?" cells scattered as hint that it's unsolved
  const hints = [
    { r: 0, c: 1, v: '7' }, { r: 0, c: 4, v: '3' }, { r: 0, c: 7, v: '9' },
    { r: 1, c: 0, v: '4' }, { r: 1, c: 3, v: '8' }, { r: 1, c: 6, v: '2' },
    { r: 2, c: 2, v: '6' }, { r: 2, c: 5, v: '1' }, { r: 2, c: 8, v: '5' },
    { r: 3, c: 1, v: '2' }, { r: 3, c: 4, v: '9' }, { r: 3, c: 7, v: '4' },
    { r: 4, c: 0, v: '8' }, { r: 4, c: 3, v: '5' }, { r: 4, c: 6, v: '7' },
    { r: 5, c: 2, v: '3' }, { r: 5, c: 5, v: '6' },
    { r: 6, c: 0, v: '5' }, { r: 6, c: 4, v: '1' }, { r: 6, c: 7, v: '6' },
    { r: 7, c: 2, v: '9' }, { r: 7, c: 5, v: '4' }, { r: 7, c: 8, v: '3' },
    { r: 8, c: 1, v: '1' }, { r: 8, c: 4, v: '7' }, { r: 8, c: 7, v: '8' },
  ];
  const cellW = 480 / 9;
  const cellH = 240 / 9;

  hints.forEach(({ r, c, v }) => {
    const cx = 60 + c * cellW + cellW / 2;
    const cy = 200 + r * cellH + cellH / 2 + 5;
    ctx.font = `600 ${Math.floor(cellH * 0.55)}px "Inter", system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'center';
    ctx.fillText(v, cx, cy);
  });

  // Invite message
  if (displayName) {
    ctx.font = '400 13px "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText(`${displayName} invites you to play`, W / 2, 512);
  }

  // Referral / CTA section
  if (referralCode) {
    // Code pill
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    fillRoundRect(ctx, W / 2 - 110, 526, 220, 34, 17);
    ctx.font = '600 13px "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.textAlign = 'center';
    ctx.fillText(`Invite code: ${referralCode}`, W / 2, 547);
  }

  // URL footer
  ctx.font = '500 14px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.textAlign = 'center';
  ctx.fillText('gridnova.pages.dev', W / 2, H - 28);

  return canvasToBlob(canvas);
}
