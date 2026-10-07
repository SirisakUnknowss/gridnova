import type { GameResult } from '@ui/views/game';
import { formatTime } from '@lib/format';
import { canvasToBlob, fillRoundRect, loadImage, sharePalette } from './helpers';
import trophy from '@images/space/trophyIcon.webp';

export interface WinCardData {
  result: GameResult;
  date?: string;
  rank?: number;
  totalPlayers?: number;
  streak?: number;
}

export async function renderWinCard(data: WinCardData): Promise<Blob | null> {
  const palette = sharePalette();
  const background = getComputedStyle(document.documentElement).getPropertyValue('--theme-background').match(/url\(["']?(.*?)["']?\)/)?.[1];
  const [scene, icon] = await Promise.all([background ? loadImage(background) : Promise.resolve(null), loadImage(trophy)]);
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, 600, 600);
  if (scene) {
    const scale = Math.max(600 / scene.width, 600 / scene.height);
    const width = scene.width * scale, height = scene.height * scale;
    ctx.drawImage(scene, (600 - width) / 2, (600 - height) / 2, width, height);
  }
  ctx.fillStyle = palette.surface;
  fillRoundRect(ctx, 28, 28, 544, 544, 32);
  if (icon) ctx.drawImage(icon, 258, 48, 84, 84);
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.text;
  ctx.font = '700 28px "Fredoka", system-ui, sans-serif';
  ctx.fillText('You won!', 300, 166);
  ctx.font = '700 60px "Fredoka", system-ui, sans-serif';
  ctx.fillStyle = palette.primary;
  ctx.fillText(data.result.score.toLocaleString(), 300, 240);
  ctx.font = '400 18px "Fredoka", system-ui, sans-serif';
  ctx.fillStyle = palette.muted;
  ctx.fillText('Points', 300, 270);
  const stats = [['Time', formatTime(data.result.timeSeconds)], ['Mistakes', String(data.result.mistakes)], ['Hints', String(data.result.hintsUsed)]];
  stats.forEach(([label, value], i) => {
    const x = 52 + i * 168;
    ctx.fillStyle = palette.background;
    fillRoundRect(ctx, x, 300, 160, 86, 16);
    ctx.fillStyle = palette.muted;
    ctx.font = '400 16px "Fredoka", system-ui, sans-serif';
    ctx.fillText(label, x + 80, 327);
    ctx.fillStyle = palette.text;
    ctx.font = '600 26px "Fredoka", system-ui, sans-serif';
    ctx.fillText(value, x + 80, 363);
  });
  ctx.fillStyle = palette.text;
  ctx.font = '500 20px "Fredoka", system-ui, sans-serif';
  if (data.rank) ctx.fillText(`Rank #${data.rank}${data.totalPlayers ? ` / ${data.totalPlayers}` : ''}`, 300, 427);
  ctx.fillStyle = palette.muted;
  ctx.font = '400 16px "Fredoka", system-ui, sans-serif';
  const mode = data.result.mode === 'daily' ? 'Daily Puzzle' : 'Sudoku';
  ctx.fillText([mode, data.date, data.streak && data.streak > 1 ? `${data.streak} day streak` : ''].filter(Boolean).join(' · '), 300, 466);
  ctx.fillStyle = palette.primary;
  ctx.font = '700 22px "Fredoka", system-ui, sans-serif';
  ctx.fillText('GridNova', 300, 531);
  return canvasToBlob(canvas);
}
