// Card A — Win Result Card (600×600)
import type { GameResult } from '@ui/views/game';
import { formatTime } from '@lib/format';
import { canvasToBlob } from './helpers';

const W = 600;
const H = 600;

export interface WinCardData {
  result: GameResult;
  date?: string;
  rank?: number;
  totalPlayers?: number;
  streak?: number;
}

function fillRR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fill();
}

function strokeRR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string, lw = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function draw4Star(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 - Math.PI / 4;
    ctx.lineTo(x + Math.cos(a) * size, y + Math.sin(a) * size);
    ctx.lineTo(x + Math.cos(a + Math.PI / 4) * size * 0.38, y + Math.sin(a + Math.PI / 4) * size * 0.38);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawConfetti(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, rot: number) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillRect(-3, -6, 6, 12);
  ctx.restore();
}

export async function renderWinCard(data: WinCardData): Promise<Blob | null> {
  const { result, date, rank, totalPlayers, streak } = data;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // ── Background gradient ───────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#4a3abf');
  bg.addColorStop(0.5, '#6c5ce7');
  bg.addColorStop(1, '#8b7ff5');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial glow
  const gl = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 260);
  gl.addColorStop(0, 'rgba(180,160,255,0.25)');
  gl.addColorStop(1, 'rgba(180,160,255,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, W, H);

  // ── Confetti / sparkle decorations ───────────────────────────────
  const sparkles = [
    { x: 155, y: 155, size: 6 }, { x: 440, y: 130, size: 5 },
    { x: 80,  y: 330, size: 5 }, { x: 530, y: 290, size: 4 },
    { x: 55,  y: 420, size: 5 }, { x: 490, y: 480, size: 5 },
    { x: 320, y: 530, size: 4 }, { x: 470, y: 530, size: 5 },
  ];
  sparkles.forEach(({ x, y, size }) =>
    draw4Star(ctx, x, y, size, 'rgba(255,255,255,0.55)'));

  [
    { x: 100, y: 80,  color: '#f97316', rot: 0.4 },
    { x: 480, y: 60,  color: '#10b981', rot: -0.3 },
    { x: 380, y: 45,  color: '#f59e0b', rot: 0.8 },
    { x: 130, y: 500, color: '#f97316', rot: 0.5 },
    { x: 548, y: 170, color: '#10b981', rot: -0.6 },
    { x: 200, y: 48,  color: '#f97316', rot: 1.1 },
  ].forEach(({ x, y, color, rot }) => drawConfetti(ctx, x, y, color, rot));

  // ── Trophy box ────────────────────────────────────────────────────
  const tbx = W / 2 - 44, tby = 36, tbw = 88, tbh = 88;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  fillRR(ctx, tbx, tby, tbw, tbh, 20);
  strokeRR(ctx, tbx, tby, tbw, tbh, 20, 'rgba(255,255,255,0.35)');

  ctx.font = '46px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏆', W / 2, tby + tbh / 2 + 2);
  ctx.textBaseline = 'alphabetic';

  // ── Frosted glass card ────────────────────────────────────────────
  const cx = 36, cy = 144, cw = W - 72, ch = H - 174;
  ctx.fillStyle = 'rgba(255,255,255,0.13)';
  fillRR(ctx, cx, cy, cw, ch, 24);
  strokeRR(ctx, cx, cy, cw, ch, 24, 'rgba(255,255,255,0.25)');

  // Inner top shimmer
  const ig = ctx.createLinearGradient(0, cy, 0, cy + 60);
  ig.addColorStop(0, 'rgba(255,255,255,0.12)');
  ig.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save();
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.moveTo(cx + 24, cy); ctx.lineTo(cx + cw - 24, cy);
  ctx.arcTo(cx + cw, cy, cx + cw, cy + 24, 24);
  ctx.lineTo(cx + cw, cy + 60); ctx.lineTo(cx, cy + 60);
  ctx.arcTo(cx, cy, cx + 24, cy, 24);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'center';

  // ── Hero: time ────────────────────────────────────────────────────
  ctx.font = '800 86px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 8;
  ctx.fillText(formatTime(result.timeSeconds), W / 2, cy + 98);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.font = '600 12px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('D A I L Y   P U Z Z L E   S O L V E D', W / 2, cy + 126);

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + 50, cy + 144); ctx.lineTo(cx + cw - 50, cy + 144);
  ctx.stroke();

  // ── Stats row ─────────────────────────────────────────────────────
  const dateLabel = date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const stats = [
    { l: 'MISTAKES', v: String(result.mistakes) },
    { l: 'HINTS',    v: String(result.hintsUsed) },
    { l: 'DATE',     v: dateLabel },
  ];

  stats.forEach(({ l, v }, i) => {
    const sx = cx + cw / 6 + i * (cw / 3);
    const sy = cy + 172;
    ctx.font = '600 11px "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(l, sx, sy);
    ctx.font = `700 ${v.length > 5 ? '24' : '32'}px "Inter", system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(v, sx, sy + 42);
  });

  // Vertical dividers
  [1, 2].forEach(i => {
    const dx = cx + i * (cw / 3);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dx, cy + 158); ctx.lineTo(dx, cy + 222);
    ctx.stroke();
  });

  // ── Score ─────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + 50, cy + 234); ctx.lineTo(cx + cw - 50, cy + 234);
  ctx.stroke();

  ctx.font = '600 11px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('S C O R E', W / 2, cy + 262);

  ctx.font = '800 52px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.shadowColor = 'rgba(245,158,11,0.45)';
  ctx.shadowBlur = 20;
  ctx.fillText(result.score.toLocaleString(), W / 2, cy + 320);
  ctx.shadowBlur = 0;

  // ── Percentile (if available) ─────────────────────────────────────
  if (rank && totalPlayers && totalPlayers > 1) {
    const pct = Math.round((1 - (rank - 1) / totalPlayers) * 100);
    const pctText = pct >= 99 ? 'Top 1% today!' :
                    pct >= 95 ? `Top ${100 - pct}% today` :
                    `Faster than ${pct}% of players`;
    ctx.font = '500 13px "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(pctText, W / 2, cy + 346);
  }

  // ── Streak (if available) ─────────────────────────────────────────
  if (streak && streak > 1) {
    const sy2 = rank && totalPlayers ? cy + 370 : cy + 350;
    ctx.font = '500 13px "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,180,100,0.9)';
    ctx.fillText(`🔥 ${streak} day streak`, W / 2, sy2);
  }

  // ── Bottom GridNova pill ──────────────────────────────────────────
  const py = cy + ch - 32, pw = 148, ph = 34;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  fillRR(ctx, W / 2 - pw / 2, py - ph / 2, pw, ph, 17);
  strokeRR(ctx, W / 2 - pw / 2, py - ph / 2, pw, ph, 17, 'rgba(255,255,255,0.3)');
  ctx.font = '600 13px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText('✦ GridNova', W / 2, py + 5);

  return canvasToBlob(canvas);
}
