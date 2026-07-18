// =====================================================================
// Shared renderer for simple static content pages (How to Play, Privacy
// Policy, Terms of Service, Contact Support) — same top-bar + prose
// layout, only the body content differs per page.
// =====================================================================
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';

export interface StaticContentSection {
  heading?: string;
  body: string; // pre-escaped HTML (paragraphs, lists — trusted, authored copy only)
}

export interface StaticContentProps {
  title: string;
  icon: string; // pre-rendered icon markup (ic.xxx(24))
  sections: StaticContentSection[];
  onBack: () => void;
  nav: BottomNavCallbacks;
}

export function mountStaticContentView(root: HTMLElement, props: StaticContentProps): { unmount: () => void } {
  root.innerHTML = `
    <section class="view">
      <div class="top-bar">
        <button class="icon-btn" id="static-back" aria-label="Back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <h2 style="margin:0;">${props.icon} ${props.title}</h2>
        <span style="width:38px;"></span>
      </div>
      <div class="card static-content">
        ${props.sections.map((s) => `
          ${s.heading ? `<h3>${s.heading}</h3>` : ''}
          ${s.body}
        `).join('')}
      </div>
      ${bottomNavHTML('profile')}
    </section>
  `;

  root.querySelector('#static-back')?.addEventListener('click', props.onBack);
  wireBottomNav(root, props.nav, 'profile');

  return { unmount() { /* nothing to clean up */ } };
}
