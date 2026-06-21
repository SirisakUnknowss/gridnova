// Card E — Monthly Recap Card (600×1000 portrait)
import { fillRoundRect, canvasToBlob, monthName } from './helpers';

const W = 600;
const H = 1000;

export interface RecapCardData {
  year: number;
  month: number; // 1-12
  daysPlayed: number;
  totalDays: number; // days in month
  bestScore: number;
  longestStreak: number;
  wins: number;
  displayName?: string;
}

export async function renderRecapCard(data: RecapCardData): Promise<Blob | null> {
  const { year, month, daysPlayed, totalDays, bestScore, longestStreak, wins, displayName } = data;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Deep purple gradient BG
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1a1040');
  bg.addColorStop(0.5, '#2d1b69');
  bg.addColorStop(1, '#4a2d9e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial glow center
  const glow = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, 300);
  glow.addColorStop(0, 'rgba(108,92,231,0.4)');
  glow.addColorStop(1, 'rgba(108,92,231,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.beginPath(); ctx.arc(W - 60, 80, 120, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(60, H - 100, 90, 0, Math.PI * 2); ctx.fill();

  ctx.textAlign = 'center';

  // GRIDNOVA badge
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  fillRoundRect(ctx, W / 2 - 70, 52, 140, 30, 15);
  ctx.font = '700 12px "Inter", system-ui, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('GRIDNOVA', W / 2, 71);
  ctx.letterSpacing = '0px';

  // Month Year
  ctx.font = '300 38px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(monthName(month).toUpperCase(), W / 2, 140);
  ctx.font = '800 72px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(108,92,231,0.6)';
  ctx.shadowBlur = 30;
  ctx.fillText(String(year), W / 2, 222);
  ctx.shadowBlur = 0;

  ctx.font = '400 16px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Monthly Recap', W / 2, 254);

  if (displayName) {
    ctx.font = '500 15px "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText(displayName, W / 2, 280);
  }

  // Divider
  const shimmer = ctx.createLinearGradient(0, 0, W, 0);
  shimmer.addColorStop(0, 'rgba(255,255,255,0)');
  shimmer.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  shimmer.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(60, 308, W - 120, 1);

  // Stats 2×2 grid
  const statsData = [
    { emoji: '📅', value: `${daysPlayed}/${totalDays}`, label: 'Days Played' },
    { emoji: '🏆', value: bestScore > 0 ? bestScore.toLocaleString() : '—', label: 'Best Score' },
    { emoji: '🔥', value: `${longestStreak}d`, label: 'Longest Streak' },
    { emoji: '✅', value: String(wins), label: 'Games Won' },
  ];

  const startY = 340;
  const cellW = (W - 80) / 2;
  const cellH = 160;
  const gap = 16;

  statsData.forEach(({ emoji, value, label }, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 40 + col * (cellW + gap);
    const cy = startY + row * (cellH + gap);

    // Card BG
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    fillRoundRect(ctx, cx, cy, cellW, cellH, 20);

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    fillRoundRect(ctx, cx, cy, cellW, cellH, 20);
    ctx.stroke();

    // Emoji
    ctx.font = '36px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(emoji, cx + 22, cy + 52);

    // Value
    ctx.font = '700 34px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(value, cx + 22, cy + 100);

    // Label
    ctx.font = '400 13px "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(label, cx + 22, cy + 126);
  });

  // Completion bar
  const barY = startY + 2 * (cellH + gap) + 30;
  const pct = totalDays > 0 ? daysPlayed / totalDays : 0;

  ctx.font = '500 14px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textAlign = 'left';
  ctx.fillText(`Completion`, 40, barY);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(`${Math.round(pct * 100)}%`, W - 40, barY);

  // Bar track
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  fillRoundRect(ctx, 40, barY + 12, W - 80, 12, 6);

  // Bar fill
  const fillGrad = ctx.createLinearGradient(40, 0, 40 + (W - 80) * pct, 0);
  fillGrad.addColorStop(0, '#a78bfa');
  fillGrad.addColorStop(1, '#6c5ce7');
  ctx.fillStyle = fillGrad;
  fillRoundRect(ctx, 40, barY + 12, (W - 80) * pct, 12, 6);

  // Motivational line
  const motivLines: Record<number, string> = {
    100: "Perfect month! You're unstoppable 🏆",
    75: "Great month! Keep the momentum going 💪",
    50: "Solid effort — halfway there next month!",
    0: "New month, fresh start — let's go! 🚀",
  };
  const motivKey = pct >= 1 ? 100 : pct >= 0.75 ? 75 : pct >= 0.5 ? 50 : 0;
  ctx.font = '500 15px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.textAlign = 'center';
  ctx.fillText(motivLines[motivKey], W / 2, barY + 50);

  // Footer
  ctx.font = '400 13px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.textAlign = 'center';
  ctx.fillText('gridnova.pages.dev', W / 2, H - 36);

  return canvasToBlob(canvas);
}
