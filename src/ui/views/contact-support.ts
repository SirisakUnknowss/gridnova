import { mountStaticContentView, type StaticContentProps } from './static-content';
import { ic } from '@ui/icons';
import { COMMUNITY_LINKS } from './settings';

export function mountContactSupportView(root: HTMLElement, props: Pick<StaticContentProps, 'onBack' | 'nav'>) {
  const view = mountStaticContentView(root, {
    title: 'Contact Support',
    icon: ic.bell(22),
    onBack: props.onBack,
    nav: props.nav,
    sections: [
      {
        body: `<p>Run into a bug, lost progress, or have feedback? Send us a message on
          the official GridNova Facebook page — we read every message and usually
          reply within a day.</p>
          <button class="btn btn--primary" id="contact-fb-btn" style="width:100%;margin-top:12px;">
            Message us on Facebook
          </button>
          <p style="margin-top:16px;color:var(--app-text-secondary);font-size:13px;">
            When reporting a bug, it helps a lot to include: what you were doing,
            what you expected to happen, and a screenshot if you have one.
          </p>`,
      },
    ],
  });

  root.querySelector('#contact-fb-btn')?.addEventListener('click', () => {
    window.open(COMMUNITY_LINKS.fbPage, '_blank', 'noopener');
  });

  return view;
}
