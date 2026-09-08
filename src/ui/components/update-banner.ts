// =====================================================================
// Update banner — shown when a fresh deploy takes control of the page.
// Replaces the old force-reload so a player is never yanked mid-game
// (which could burn a heart, since hearts refund only on a win).
// =====================================================================
import { useStore } from '../../state/store';

let handled = false;

/** Show the "new version available" banner. Idempotent. Defers while the
 *  player is on the board — the banner appears once they leave the game. */
export function showUpdateBanner(): void {
  if (handled) return;
  handled = true;

  if (useStore.getState().currentView === 'game') {
    const unsub = useStore.subscribe((s) => {
      if (s.currentView !== 'game') {
        unsub();
        render();
      }
    });
    return;
  }
  render();
}

function render(): void {
  if (document.querySelector('.update-banner')) return;

  const el = document.createElement('div');
  el.className = 'update-banner';
  el.setAttribute('role', 'status');
  el.innerHTML = `
    <div class="update-banner__text">
      <strong>New version available</strong>
      <span>Finish your game, then tap to update.</span>
    </div>
    <button class="update-banner__update" type="button">Update</button>
    <button class="update-banner__close" type="button" aria-label="Dismiss">&times;</button>
  `;

  el.querySelector('.update-banner__update')!.addEventListener('click', () => {
    window.location.reload();
  });
  el.querySelector('.update-banner__close')!.addEventListener('click', () => {
    el.remove();
  });

  document.body.appendChild(el);
}
