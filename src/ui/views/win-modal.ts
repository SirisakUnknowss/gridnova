import celebration from '@images/space/trophyIcon.webp';
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

  const theme = getComputedStyle(document.documentElement);
  const COLORS = ['--brand-primary', '--brand-secondary', '--color-xp'].map(token => theme.getPropertyValue(token).trim());
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
    <div class="modal win-modal">
      <img src="${celebration}" class="space-win-art" width="144" height="180" alt="" decoding="async">
      <h2>You won!</h2>
      <div class="big-number">${result.score.toLocaleString()}</div>
      <p class="small" style="opacity:0.8;">Points</p>

      <div class="win-stats">
        <div class="win-stat">
          <div style="font-size:11px;opacity:0.8;">Time</div>
          <div style="font-size:18px;">${formatTime(result.timeSeconds)}</div>
        </div>
        <div class="win-stat">
          <div style="font-size:11px;opacity:0.8;">Mistakes</div>
          <div style="font-size:18px;">${result.mistakes}</div>
        </div>
        <div class="win-stat">
          <div style="font-size:11px;opacity:0.8;">Hints</div>
          <div style="font-size:18px;">${result.hintsUsed}</div>
        </div>
      </div>

      ${rank ? `<p style="font-size:14px;margin-bottom:8px;">${ic.trophy(14)} Rank #${rank}${totalPlayers ? ` / ${totalPlayers}` : ''}</p>` : ''}
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
