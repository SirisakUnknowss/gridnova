// =====================================================================
// Win modal — shown after game completion
// =====================================================================
import type { GameResult } from './game';
import { formatTime } from '@lib/format';
import { ic } from '@ui/icons';

export interface WinModalProps {
  result: GameResult;
  rank?: number;
  totalPlayers?: number;
  coinsEarned: number;
  xpEarned: number;
  isPersonalBest?: boolean;
  isGuest?: boolean;
  onContinue: () => void;
  onShare?: () => void;
  onSignUp?: () => void;
}

function launchConfetti(container: HTMLElement): () => void {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;

  const COLORS = ['#f97316','#6c5ce7','#f59e0b','#10b981','#ec4899','#3b82f6','#a78bfa','#fbbf24'];
  const COUNT = 120;

  interface Piece {
    x: number; y: number; vx: number; vy: number;
    w: number; h: number; rot: number; rotV: number;
    color: string; sway: number; swayT: number;
    type: 'rect' | 'circle';
  }

  const pieces: Piece[] = Array.from({ length: COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 160,
    vx: (Math.random() - 0.5) * 2.5,
    vy: 1.5 + Math.random() * 3,
    w: 6 + Math.random() * 8,
    h: 10 + Math.random() * 14,
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.18,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    sway: (Math.random() - 0.5) * 0.06,
    swayT: Math.random() * Math.PI * 2,
    type: Math.random() < 0.2 ? 'circle' : 'rect',
  }));

  let raf = 0;
  let done = false;

  function tick() {
    if (done) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of pieces) {
      p.swayT += 0.04;
      p.vx += Math.sin(p.swayT) * p.sway;
      p.vy += 0.06;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      if (p.y < canvas.height + 20) alive++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, p.y - canvas.height * 0.7) / (canvas.height * 0.3));
      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    if (alive > 0) {
      raf = requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  }

  raf = requestAnimationFrame(tick);
  return () => { done = true; cancelAnimationFrame(raf); canvas.remove(); };
}

export function showWinModal(props: WinModalProps): void {
  const { result, rank, totalPlayers, coinsEarned, xpEarned, isPersonalBest, isGuest } = props;

  const existing = document.getElementById('win-modal-root');
  if (existing) existing.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'win-modal-root';
  wrapper.className = 'modal-bg active';

  wrapper.innerHTML = `
    <div class="modal">
      <h2>${ic.celebrate(22)} You won!</h2>
      <div class="big-number">${result.score.toLocaleString()}</div>
      <p class="small" style="opacity:0.8;">Points</p>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0;">
        <div style="background:rgba(108,92,231,0.08);padding:8px;border-radius:12px;">
          <div style="font-size:11px;opacity:0.8;">Time</div>
          <div style="font-size:18px;">${formatTime(result.timeSeconds)}</div>
        </div>
        <div style="background:rgba(108,92,231,0.08);padding:8px;border-radius:12px;">
          <div style="font-size:11px;opacity:0.8;">Mistakes</div>
          <div style="font-size:18px;">${result.mistakes}</div>
        </div>
        <div style="background:rgba(108,92,231,0.08);padding:8px;border-radius:12px;">
          <div style="font-size:11px;opacity:0.8;">Hints</div>
          <div style="font-size:18px;">${result.hintsUsed}</div>
        </div>
      </div>

      ${rank ? `<p style="font-size:14px;margin-bottom:8px;">${ic.trophy(14)} Rank #${rank} / ${totalPlayers}</p>` : ''}
      ${isPersonalBest ? `<p style="color:var(--brand-primary);font-weight:600;">${ic.trophy(14)} New Personal Best!</p>` : ''}

      <p style="margin:12px 0;font-size:14px;">
        ${ic.coin(14)} +${coinsEarned} coins · ${ic.star(14)} +${xpEarned} XP
      </p>

      ${isGuest ? `
        <div class="win-guest-prompt">
          <p>Save your streak & see leaderboard ranks</p>
          <button class="btn btn--accent" id="win-signup">Create free account</button>
        </div>
      ` : ''}

      <div class="modal-buttons">
        ${props.onShare ? `<button class="btn btn--secondary" id="win-share">Share</button>` : ''}
        <button class="btn${isGuest ? ' btn--secondary' : ''}" id="win-continue">${isGuest ? 'Continue as Guest' : 'Continue'}</button>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  // Launch confetti AFTER the modal is in the DOM — calling it before setting
  // innerHTML wiped the canvas immediately, so it never showed.
  const stopConfetti = launchConfetti(wrapper);

  const close = () => { stopConfetti(); wrapper.remove(); };

  wrapper.querySelector('#win-continue')?.addEventListener('click', () => {
    close();
    props.onContinue();
  });
  wrapper.querySelector('#win-share')?.addEventListener('click', () => {
    props.onShare?.();
  });
  wrapper.querySelector('#win-signup')?.addEventListener('click', () => {
    close();
    props.onSignUp?.();
  });
}

export function buildShareText(result: GameResult, date?: string, rank?: number, total?: number): string {
  const lines = [
    `GridNova${date ? ' #' + date : ''}`,
    `⏱ ${formatTime(result.timeSeconds)} · ❌ ${result.mistakes} · 💡 ${result.hintsUsed}`,
  ];
  if (rank && total) lines.push(`🏆 Rank #${rank} / ${total}`);
  lines.push(`Score: ${result.score.toLocaleString()}`);
  lines.push('');
  lines.push('Play: gridnova.pages.dev');
  return lines.join('\n');
}

// ─── Canvas Share Image ───────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00Z');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  } catch {
    return dateStr;
  }
}

/**
 * Generate a beautiful 600×400 PNG share card using Canvas API.
 * Returns a Blob (PNG) or null if canvas is not supported.
 */
export async function generateShareImage(
  result: GameResult,
  date?: string,
  rank?: number,
  total?: number,
): Promise<Blob | null> {
  const W = 600, H = 400;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // ── Background gradient ──────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#6c5ce7');
  grad.addColorStop(0.6, '#8b78f0');
  grad.addColorStop(1, '#a78bfa');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle noise overlay (semi-transparent inner card)
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  roundRect(ctx, 28, 28, W - 56, H - 56, 20);

  // ── Top accent line ──────────────────────────────────────────────────────
  const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
  accentGrad.addColorStop(0, 'rgba(255,255,255,0)');
  accentGrad.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  accentGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(28, 28, W - 56, 2);

  // ── Header ───────────────────────────────────────────────────────────────
  ctx.textAlign = 'center';

  ctx.font = '700 15px "Inter", system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('GRIDNOVA', W / 2, 78);
  ctx.letterSpacing = '0px';

  if (date) {
    ctx.font = '400 13px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(formatDateLabel(date), W / 2, 100);
  }

  // ── Score ────────────────────────────────────────────────────────────────
  ctx.font = '700 76px "Inter", system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 20;
  ctx.fillText(result.score.toLocaleString(), W / 2, 200);
  ctx.shadowBlur = 0;

  ctx.font = '500 12px "Inter", system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText('SCORE', W / 2, 222);
  ctx.letterSpacing = '0px';

  // ── Divider ──────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 248); ctx.lineTo(W - 80, 248);
  ctx.stroke();

  // ── Stats row ────────────────────────────────────────────────────────────
  const stats = [
    { icon: '⏱', label: formatTime(result.timeSeconds) },
    { icon: '❌', label: String(result.mistakes) },
    { icon: '💡', label: String(result.hintsUsed) },
  ];
  const colW = W / 3;
  stats.forEach(({ icon, label }, i) => {
    const cx = colW * i + colW / 2;
    // Small card background
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, cx - 55, 260, 110, 52, 10);

    ctx.font = '500 18px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${icon} ${label}`, cx, 292);
  });

  // ── Rank (if available) ──────────────────────────────────────────────────
  if (rank && total) {
    ctx.font = '600 16px "Inter", system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = 'rgba(255,215,0,0.4)';
    ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    ctx.fillText(`🏆  Rank #${rank} / ${total} players`, W / 2, 340);
    ctx.shadowBlur = 0;
  }

  // ── Footer URL ───────────────────────────────────────────────────────────
  ctx.font = '400 13px "Inter", system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.textAlign = 'center';
  ctx.fillText('gridnova.pages.dev', W / 2, H - 34);

  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
}
