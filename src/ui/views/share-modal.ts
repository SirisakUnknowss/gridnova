// Share Modal — preview + share/download for Win / Profile / Recap / Invite cards
import { renderWinCard, renderProfileCard, renderRecapCard, renderInviteCard } from '@lib/share/index';
import type { WinCardData, ProfileCardData, RecapCardData, InviteCardData } from '@lib/share/index';
import { track } from '@lib/analytics';

export interface ShareModalProps {
  win?: WinCardData;
  profile?: ProfileCardData;
  recap?: RecapCardData;
  invite?: InviteCardData;
  onClose?: () => void;
  onToast?: (msg: string) => void;
}

type CardType = 'win' | 'profile' | 'recap' | 'invite';

const LABELS: Record<CardType, string> = {
  invite: '📣 Invite',
  win: '🏆 Result',
  profile: '👤 Profile',
  recap: '📅 Recap',
};

export function showShareModal(props: ShareModalProps): void {
  const existing = document.getElementById('share-modal-root');
  if (existing) existing.remove();

  const available: CardType[] = [];
  if (props.invite) available.push('invite');
  if (props.win) available.push('win');
  if (props.profile) available.push('profile');
  if (props.recap) available.push('recap');
  if (available.length === 0) return;

  let activeType: CardType = available[0];
  let activeBlob: Blob | null = null;

  const root = document.createElement('div');
  root.id = 'share-modal-root';
  root.className = 'modal-bg active';
  root.style.cssText = 'align-items:flex-end;padding:0;';
  root.innerHTML = `
    <div class="share-sheet" id="share-sheet">
      <div class="share-sheet-handle"></div>
      <div class="share-sheet-header">
        <span class="share-sheet-title">Share</span>
        <button class="icon-btn" id="share-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      ${available.length > 1 ? `
        <div class="share-tabs">
          ${available.map(t => `
            <button class="share-tab${t === activeType ? ' active' : ''}" data-type="${t}">${LABELS[t]}</button>
          `).join('')}
        </div>
      ` : ''}
      <div class="share-preview-wrap">
        <canvas id="share-preview-canvas" class="share-preview-canvas"></canvas>
        <div class="share-preview-loading" id="share-preview-loading">Generating...</div>
      </div>
      <div class="share-actions">
        <button class="btn btn--secondary" id="share-download">⬇️ Save Image</button>
        <button class="btn" id="share-share">📤 Share</button>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  const canvas = root.querySelector<HTMLCanvasElement>('#share-preview-canvas')!;
  const loading = root.querySelector<HTMLElement>('#share-preview-loading')!;

  async function renderCard(type: CardType) {
    loading.style.display = 'flex';
    canvas.style.opacity = '0.3';
    activeBlob = null;

    let blob: Blob | null = null;
    if (type === 'invite' && props.invite) blob = await renderInviteCard(props.invite);
    if (type === 'win' && props.win) blob = await renderWinCard(props.win);
    if (type === 'profile' && props.profile) blob = await renderProfileCard(props.profile);
    if (type === 'recap' && props.recap) blob = await renderRecapCard(props.recap);

    loading.style.display = 'none';
    canvas.style.opacity = '1';

    if (!blob) return;
    activeBlob = blob;

    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  // Wire tabs
  root.querySelectorAll<HTMLButtonElement>('.share-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.share-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeType = btn.dataset.type as CardType;
      renderCard(activeType);
    });
  });

  // Close
  function close() {
    root.remove();
    props.onClose?.();
  }
  root.querySelector('#share-close')?.addEventListener('click', close);
  root.addEventListener('click', (e) => { if (e.target === root) close(); });

  // Download
  root.querySelector('#share-download')?.addEventListener('click', async () => {
    if (!activeBlob) return;
    track('share_download', { type: activeType });
    const url = URL.createObjectURL(activeBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gridnova-${activeType}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Share
  root.querySelector('#share-share')?.addEventListener('click', async () => {
    if (!activeBlob) return;
    track('share_send', { type: activeType });
    const file = new File([activeBlob], `gridnova-${activeType}.png`, { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: 'gridnova.pages.dev' });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    if (navigator.share) {
      try { await navigator.share({ text: 'gridnova.pages.dev' }); return; } catch { /* ignore */ }
    }
    // Fallback: download
    const url = URL.createObjectURL(activeBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gridnova-${activeType}.png`;
    a.click();
    URL.revokeObjectURL(url);
    props.onToast?.('Image saved!');
  });

  // Initial render
  renderCard(activeType);
}
