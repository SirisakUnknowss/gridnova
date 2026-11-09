// =====================================================================
// Inbox — every live news item, including ones hidden from the launch
// popup, so players can always read them again.
// =====================================================================
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { escapeHtml } from '@lib/format';
import { loadNews, readIds, type NewsItem } from '@lib/news';
import { showAnnouncement } from './announcement';

export interface InboxViewProps {
  onBack: () => void;
  nav: BottomNavCallbacks;
}

function snippet(body: string): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length > 110 ? `${flat.slice(0, 107)}…` : flat;
}

function rowHTML(item: NewsItem, unread: boolean): string {
  const date = new Date(item.date);
  return `
    <button class="inbox-row${unread ? ' is-unread' : ''}" data-news="${escapeHtml(item.id)}">
      <span class="inbox-row-body">
        <span class="inbox-row-title">${unread ? '<span class="inbox-dot" aria-label="Unread"></span>' : ''}${escapeHtml(item.title)}</span>
        <span class="inbox-row-snippet">${escapeHtml(snippet(item.body))}</span>
        <span class="inbox-row-date">${Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </span>
      <span class="inbox-row-chevron">${ic.chevronRight(18)}</span>
    </button>`;
}

export function mountInboxView(root: HTMLElement, props: InboxViewProps): { unmount: () => void } {
  root.innerHTML = `
    <section class="view view--inbox">
      <div class="top-bar">
        <button class="icon-btn" id="inbox-back" aria-label="Back">${ic.back(26)}</button>
        <h2 style="margin:0;">${ic.mail(22)} Inbox</h2>
        <span style="width:38px;"></span>
      </div>
      <div class="inbox-section-label">News</div>
      <div class="inbox-list" id="inbox-list"><p class="inbox-empty">Loading…</p></div>
      ${bottomNavHTML('home')}
    </section>
  `;
  root.querySelector('#inbox-back')?.addEventListener('click', props.onBack);
  wireBottomNav(root, props.nav, 'home');

  let alive = true;
  let items: NewsItem[] = [];
  const list = root.querySelector<HTMLElement>('#inbox-list')!;

  const render = () => {
    const read = readIds();
    list.innerHTML = items.length
      ? items.map((n) => rowHTML(n, !read.has(n.id))).join('')
      : '<p class="inbox-empty">No news yet. Check back soon!</p>';
  };

  list.addEventListener('click', (e) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-news]');
    const item = items.find((n) => n.id === row?.dataset.news);
    if (!item) return;
    void showAnnouncement(item, { allowHide: false }).then(() => { if (alive) render(); });
  });

  void loadNews(true).then((news) => {
    if (!alive) return;
    items = news;
    render();
  });

  return {
    unmount() {
      alive = false;
    },
  };
}
