import logo from '@images/logo.png';
// =====================================================================
// Animated splash screen — shown briefly while app boots
// =====================================================================

export function mountSplash(root: HTMLElement): { unmount: () => Promise<void> } {
  const el = document.createElement('div');
  el.className = 'splash-screen';
  el.innerHTML = `
    <div class="splash-logo-wrap">
      <img class="splash-logo" src="${logo}" alt="GridNova" width="160" height="160">
      <div class="splash-title">Grid<span>Nova</span></div>
      <div class="splash-dots" aria-hidden="true">
        <span></span><span></span><span></span>
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
