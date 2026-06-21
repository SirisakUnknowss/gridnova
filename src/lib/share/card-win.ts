// Card A — Win Result Card (600×600)
import type { GameResult } from '@ui/views/game';
import { formatTime } from '@lib/format';
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

export interface WinCardData {
  result: GameResult;
  date?: string;
  rank?: number;
  totalPlayers?: number;
  streak?: number;
}

export async function renderWinCard(data: WinCardData): Promise<Blob | null> {
  const { result, date, rank, totalPlayers, streak } = data;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#3a2d9e');
  bg.addColorStop(0.5, '#6c5ce7');
  bg.addColorStop(1, '#a78bfa');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Noise dots (subtle texture)
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let i = 0; i < 80; i++) {
    const px = Math.sin(i * 7.3) * W / 2 + W / 2;
    const py = Math.cos(i * 5.7) * H / 2 + H / 2;
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner card glass
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  fillRoundRect(ctx, 30, 30, W - 60, H - 60, 24);

  // Top shimmer line
  const shimmer = ctx.createLinearGradient(0, 0, W, 0);
  shimmer.addColorStop(0, 'rgba(255,255,255,0)');
  shimmer.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  shimmer.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(30, 30, W - 60, 2);

  ctx.textAlign = 'center';

  // GRIDNOVA label
  ctx.font = '700 13px "Inter", system-ui, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('GRIDNOVA', W / 2, 72);
  ctx.letterSpacing = '0px';

  // Difficulty badge
  const diffColor = DIFF_COLORS[result.difficulty] ?? '#6c5ce7';
  const diffLabel = result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1).replace('-', ' ');
  const badgeW = 100;
  ctx.fillStyle = diffColor;
  fillRoundRect(ctx, W / 2 - badgeW / 2, 84, badgeW, 26, 13);
  ctx.font = '600 12px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText(diffLabel, W / 2, 101);

  // Date
  if (date) {
    ctx.font = '400 12px "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.fillText(formatDateLabel(date), W / 2, 128);
  }

  // Score
  ctx.font = '700 80px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 24;
  ctx.fillText(result.score.toLocaleString(), W / 2, 232);
  ctx.shadowBlur = 0;

  ctx.font = '500 11px "Inter", system-ui, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('SCORE', W / 2, 252);
  ctx.letterSpacing = '0px';

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 272); ctx.lineTo(W - 80, 272);
  ctx.stroke();

  // Stats row (3 cells)
  const stats = [
    { emoji: '⏱', label: formatTime(result.timeSeconds) },
    { emoji: '❌', label: String(result.mistakes) },
    { emoji: '💡', label: String(result.hintsUsed) },
  ];
  const colW = (W - 80) / 3;
  stats.forEach(({ emoji, label }, i) => {
    const cx = 40 + colW * i + colW / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    fillRoundRect(ctx, cx - 60, 286, 120, 58, 12);
    ctx.font = '400 20px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`${emoji} ${label}`, cx, 316);
    ctx.font = '400 10px "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    const statNames = ['Time', 'Mistakes', 'Hints'];
    ctx.fillText(statNames[i], cx, 332);
  });

  // Percentile / rank
  if (rank && totalPlayers && totalPlayers > 0) {
    const pct = Math.round((1 - rank / totalPlayers) * 100);
    const rankText = pct >= 95
      ? `Top ${100 - pct}% of players today 🏆`
      : `Faster than ${pct}% of players today`;

    ctx.font = '600 15px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = 'rgba(255,215,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    ctx.fillText(rankText, W / 2, 384);
    ctx.shadowBlur = 0;

    ctx.font = '400 12px "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(`Rank #${rank} of ${totalPlayers} players`, W / 2, 404);
  }

  // Streak badge
  if (streak && streak > 1) {
    const sx = rank ? W - 100 : W / 2;
    const sy = 428;
    ctx.fillStyle = 'rgba(255,122,69,0.2)';
    fillRoundRect(ctx, sx - 56, sy - 18, 112, 30, 15);
    ctx.font = '600 14px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#ff7a45';
    ctx.textAlign = 'center';
    ctx.fillText(`🔥 ${streak} day streak`, sx, sy);
  }

  // Footer URL
  ctx.font = '400 12px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.textAlign = 'center';
  ctx.fillText('gridnova.pages.dev', W / 2, H - 36);

  return canvasToBlob(canvas);
}
