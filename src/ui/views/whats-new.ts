// =====================================================================
// "What's New" modal — renders curated release notes from lib/releases.
// Also exposes a "show once after an update" helper for boot.
// =====================================================================
import { RELEASES } from '@lib/releases';
import { APP_VERSION } from '@lib/version';
import { escapeHtml } from '@lib/format';

const SEEN_KEY = 'sudoku_whatsnew_seen_v1';

export function showWhatsNew(): void {
  const existing = document.getElementById('whatsnew-root');
  if (existing) existing.remove();

  const body = RELEASES.map((r, i) => `
    <div class="whatsnew-release${i === 0 ? ' latest' : ''}">
      <div class="whatsnew-ver">
        <span class="whatsnew-badge">v${escapeHtml(r.version)}</span>
        <span class="whatsnew-title">${escapeHtml(r.title)}</span>
      </div>
      <ul class="whatsnew-list">
        ${r.changes.map((c) => `<li><span class="whatsnew-ico">${c.icon}</span><span>${escapeHtml(c.text)}</span></li>`).join('')}
      </ul>
    </div>
  `).join('');

  const wrapper = document.createElement('div');
  wrapper.id = 'whatsnew-root';
  wrapper.className = 'modal-bg active';
  wrapper.innerHTML = `
    <div class="modal whatsnew-modal">
      <button class="modal-close" id="whatsnew-close" aria-label="Close">×</button>
      <h2 style="margin:0 0 4px 0;">✨ มีอะไรใหม่</h2>
      <div class="whatsnew-scroll">${body}</div>
      <div class="modal-buttons">
        <button class="btn btn--primary" id="whatsnew-ok">เยี่ยม!</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const close = () => {
    markWhatsNewSeen();
    wrapper.remove();
  };
  wrapper.querySelector('#whatsnew-close')?.addEventListener('click', close);
  wrapper.querySelector('#whatsnew-ok')?.addEventListener('click', close);
  wrapper.addEventListener('click', (e) => { if (e.target === wrapper) close(); });
}

function markWhatsNewSeen(): void {
  try { localStorage.setItem(SEEN_KEY, APP_VERSION); } catch { /* private mode */ }
}

/** True the first time the app runs after the version changed. */
export function shouldAutoShowWhatsNew(): boolean {
  try {
    const seen = localStorage.getItem(SEEN_KEY);
    // Never show on a fresh install (no prior version to compare against) —
    // only returning players who just updated should get the popup.
    if (seen === null) { markWhatsNewSeen(); return false; }
    return seen !== APP_VERSION && RELEASES.length > 0;
  } catch {
    return false;
  }
}
