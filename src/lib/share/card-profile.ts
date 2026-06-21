// Card B — Profile / Invite Card (600×600)
import { fillRoundRect, loadImage, canvasToBlob } from './helpers';

const W = 600;
const H = 600;

export interface ProfileCardData {
  displayName: string;
  avatarUrl?: string | null;
  avatarEmoji?: string;
  level: number;
  bestStreak: number;
  longestStreak: number;
  coins: number;
  referralCode: string;
}

export async function renderProfileCard(data: ProfileCardData): Promise<Blob | null> {
  const { displayName, avatarUrl, avatarEmoji, level, bestStreak, longestStreak, coins, referralCode } = data;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // White background
  ctx.fillStyle = '#f9f7ff';
  ctx.fillRect(0, 0, W, H);

  // Purple header bar
  const headerH = 180;
  const hg = ctx.createLinearGradient(0, 0, W, headerH);
  hg.addColorStop(0, '#4a3aaa');
  hg.addColorStop(1, '#6c5ce7');
  ctx.fillStyle = hg;
  fillRoundRect(ctx, 0, 0, W, headerH + 30, 0);
  ctx.fillRect(0, 0, W, headerH);

  // GRIDNOVA text in header
  ctx.textAlign = 'left';
  ctx.font = '700 14px "Inter", system-ui, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('GRIDNOVA', 40, 44);
  ctx.letterSpacing = '0px';

  // Level badge top right
  const lvlLabel = `Level ${level}`;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  fillRoundRect(ctx, W - 100, 26, 66, 26, 13);
  ctx.font = '600 12px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'right';
  ctx.fillText(lvlLabel, W - 40, 43);

  // Tagline
  ctx.textAlign = 'left';
  ctx.font = '500 22px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText('Come play with me!', 40, 88);
  ctx.font = '400 14px "Inter", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('Sudoku daily challenge — GridNova', 40, 112);

  // Avatar circle (overlapping header & body)
  const avatarY = headerH - 20;
  const avatarR = 54;

  // Try to load avatar image
  let avatarImg: HTMLImageElement | null = null;
  if (avatarUrl) {
    try {
      avatarImg = await loadImage(avatarUrl);
    } catch {
      avatarImg = null;
    }
  }

  // Avatar shadow
  ctx.shadowColor = 'rgba(108,92,231,0.3)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(W / 2, avatarY, avatarR + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Avatar clip + fill
  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, avatarY, avatarR, 0, Math.PI * 2);
  ctx.clip();
  if (avatarImg) {
    // Draw image centered in circle
    const side = avatarR * 2;
    ctx.drawImage(avatarImg, W / 2 - avatarR, avatarY - avatarR, side, side);
  } else {
    // Emoji fallback
    ctx.fillStyle = '#ece9ff';
    ctx.fillRect(W / 2 - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
    ctx.font = `${avatarR}px "Inter", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6c5ce7';
    ctx.fillText(avatarEmoji ?? '👤', W / 2, avatarY + avatarR * 0.35);
  }
  ctx.restore();

  // Name
  const nameY = avatarY + avatarR + 32;
  ctx.textAlign = 'center';
  ctx.font = '700 26px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#1a1440';
  ctx.fillText(displayName, W / 2, nameY);

  // Stats row
  const statsY = nameY + 30;
  const statItems = [
    { label: 'Streak', value: `🔥 ${bestStreak}d` },
    { label: 'Best Streak', value: `⭐ ${longestStreak}d` },
    { label: 'Coins', value: `🪙 ${coins.toLocaleString()}` },
  ];
  const statW = (W - 80) / 3;
  statItems.forEach(({ label, value }, i) => {
    const cx = 40 + statW * i + statW / 2;
    ctx.fillStyle = '#ece9ff';
    fillRoundRect(ctx, cx - 72, statsY, 144, 60, 14);
    ctx.font = '600 16px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#4a3aaa';
    ctx.textAlign = 'center';
    ctx.fillText(value, cx, statsY + 28);
    ctx.font = '400 11px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#8b7dc8';
    ctx.fillText(label, cx, statsY + 46);
  });

  // Divider
  const divY = statsY + 82;
  ctx.strokeStyle = '#e5e1f8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, divY); ctx.lineTo(W - 40, divY);
  ctx.stroke();

  // Invite CTA
  ctx.font = '600 18px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#4a3aaa';
  ctx.textAlign = 'center';
  ctx.fillText('Use my invite code & we both get coins 🪙', W / 2, divY + 34);

  // Referral code pill
  const pillY = divY + 52;
  ctx.fillStyle = '#6c5ce7';
  fillRoundRect(ctx, W / 2 - 100, pillY, 200, 44, 22);
  ctx.font = '700 20px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(referralCode, W / 2, pillY + 28);

  // URL
  ctx.font = '400 12px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#a096d8';
  ctx.textAlign = 'center';
  ctx.fillText(`gridnova.pages.dev?ref=${referralCode}`, W / 2, H - 30);

  return canvasToBlob(canvas);
}
