import { getThemeLogoUrl } from '../../lib/theme-logo';
// =====================================================================
// Animated splash screen — shown briefly while app boots
// =====================================================================

export function mountSplash(root: HTMLElement): { unmount: () => Promise<void> } {
  const el = document.createElement('div');
  el.className = 'splash-screen';
  el.innerHTML = `
    <div class="splash-logo-wrap">
      <div class="splash-orbit-stage">
        <div class="splash-orbit splash-orbit-outer" aria-hidden="true"></div>
        <div class="splash-orbit splash-orbit-inner" aria-hidden="true"></div>
        <img class="splash-logo" src="${getThemeLogoUrl()}" alt="GridNova" width="160" height="160">
      </div>
      <div class="splash-title">Grid<span>Nova</span></div>
      <div class="splash-loading" role="status" aria-live="polite">
        <span>Preparing your universe</span>
        <div class="splash-loading-track" aria-hidden="true"><span></span></div>
      </div>
    </div>
  `;
  root.appendChild(el);

  return {
    async unmount() {
      el.classList.add('splash-leave');
      await new Promise<void>((resolve) => setTimeout(resolve, 350));
      el.remove();
    },
  };
}
