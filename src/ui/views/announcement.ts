// =====================================================================
// Full-screen announcement popup. At launch every news item the player
// hasn't hidden on this device is shown one after another; ticking
// "Don't show again" hides that item from future launches (it stays
// readable in the Inbox).
// =====================================================================
import { ic } from '@ui/icons';
import { escapeHtml } from '@lib/format';
import { hideForever, markRead, newsForLaunch, type NewsItem } from '@lib/news';

function bodyHTML(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Resolves when the popup closes. `allowHide` adds the "Don't show again" box (launch only). */
export function showAnnouncement(item: NewsItem, opts: { allowHide: boolean; position?: string }): Promise<void> {
  return new Promise((resolve) => {
    document.getElementById('announce-root')?.remove();
    markRead([item.id]);

    const wrapper = document.createElement('div');
    wrapper.id = 'announce-root';
    wrapper.className = 'announce-bg';
    wrapper.innerHTML = `
      <div class="announce" role="dialog" aria-modal="true" aria-labelledby="announce-title">
        <button class="modal-close announce-close" id="announce-close" aria-label="Close">${ic.close(24)}</button>
        <div class="announce-scroll">
          <p class="announce-kicker">NEWS${opts.position ? ` · ${escapeHtml(opts.position)}` : ''}</p>
          <h2 class="announce-title" id="announce-title">${escapeHtml(item.title)}</h2>
          <p class="announce-date">${escapeHtml(formatDate(item.date))}</p>
          ${item.imageUrl ? `<img class="announce-image" src="${escapeHtml(item.imageUrl)}" alt="" loading="lazy">` : ''}
          <div class="announce-body">${bodyHTML(item.body)}</div>
          ${item.qrUrl ? `
            <figure class="announce-qr">
              <img src="${escapeHtml(item.qrUrl)}" width="168" height="168" alt="${escapeHtml(item.qrAlt ?? 'QR code')}">
              <figcaption>Scan with your phone camera</figcaption>
            </figure>` : ''}
          ${item.cta ? `<button class="btn btn--primary announce-cta" id="announce-cta">${escapeHtml(item.cta.label)}</button>` : ''}
        </div>
        ${opts.allowHide ? `
          <label class="announce-hide">
            <input type="checkbox" id="announce-hide-box">
            <span>Don't show again</span>
          </label>` : ''}
      </div>
    `;
    document.body.appendChild(wrapper);

    const close = () => {
      const hide = wrapper.querySelector<HTMLInputElement>('#announce-hide-box')?.checked;
      if (hide) hideForever(item.id);
      document.removeEventListener('keydown', onKey);
      wrapper.remove();
      window.dispatchEvent(new CustomEvent('gn:news-read'));
      resolve();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };

    wrapper.querySelector('#announce-close')?.addEventListener('click', close);
    wrapper.querySelector('#announce-cta')?.addEventListener('click', () => {
      if (item.cta) window.open(item.cta.url, '_blank', 'noopener');
    });
    document.addEventListener('keydown', onKey);
    wrapper.querySelector<HTMLButtonElement>('#announce-close')?.focus();
  });
}

const OTHER_MODALS = '#onb-root, #whatsnew-root, dialog[open], .modal-bg.active, #announce-root';

function waitForNoModal(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => (document.querySelector(OTHER_MODALS) ? setTimeout(check, 600) : resolve());
    check();
  });
}

let launchRan = false;

/** Shows every un-hidden news item in sequence, once per app launch, after other popups close. */
export async function runLaunchAnnouncements(): Promise<void> {
  if (launchRan) return;
  launchRan = true;
  const queue = await newsForLaunch();
  for (const [i, item] of queue.entries()) {
    await waitForNoModal();
    await showAnnouncement(item, { allowHide: true, position: queue.length > 1 ? `${i + 1} of ${queue.length}` : undefined });
  }
}
