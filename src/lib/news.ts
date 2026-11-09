// =====================================================================
// News / announcements. Two sources, merged newest-first:
//   • BUILTIN_NEWS — ships with the client (needs a release to change)
//   • the `announcements` table — posted from the admin panel, no release
// "Don't show again" and read state are per device (localStorage).
// =====================================================================
import { getSupabase } from './supabase';
import { IS_CRAZYGAMES } from './platform';
import discordQr from '@images/discord-qr.svg';

/** text = words only · image = picture only (title kept for the Inbox list and screen readers) · image_text = picture on top, words below */
export type NewsLayout = 'text' | 'image' | 'image_text';

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  date: string; // ISO
  layout?: NewsLayout;
  imageUrl?: string;
  qrUrl?: string;
  qrAlt?: string;
  cta?: { label: string; url: string };
}

export const DISCORD_INVITE = 'https://discord.gg/QFRYAaC8qB';

export const BUILTIN_NEWS: NewsItem[] = [
  {
    id: 'builtin:discord-launch-2026-11',
    title: 'Join the GridNova Discord!',
    body: 'Our community and support now live on Discord.\n\nChat with other players, share your best times, get help in #help, and be first to hear about updates in #announcements.',
    date: '2026-11-09T00:00:00Z',
    qrUrl: discordQr,
    qrAlt: 'QR code for the GridNova Discord invite',
    cta: { label: 'Join Discord', url: DISCORD_INVITE },
  },
];

const HIDDEN_KEY = 'gn_news_hidden_v1';
const READ_KEY = 'gn_news_read_v1';

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    const arr: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.filter((v): v is string => typeof v === 'string') : []);
  } catch {
    return new Set();
  }
}

function addToSet(key: string, ids: string[]): void {
  const set = readSet(key);
  ids.forEach((id) => set.add(id));
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch { /* private mode */ }
}

export function hideForever(id: string): void { addToSet(HIDDEN_KEY, [id]); }
export function markRead(ids: string[]): void { addToSet(READ_KEY, ids); }
export function readIds(): Set<string> { return readSet(READ_KEY); }

/** An image layout without an image falls back to text, so a bad row never shows an empty card. */
export function layoutOf(item: NewsItem): NewsLayout {
  if (!item.imageUrl) return 'text';
  return item.layout ?? 'image_text';
}

export function countUnread(items: NewsItem[]): number {
  const read = readSet(READ_KEY);
  return items.filter((n) => !read.has(n.id)).length;
}

interface RemoteRow {
  id: string;
  title: string;
  body: string;
  layout?: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  starts_at: string;
}

const LAYOUTS: readonly NewsLayout[] = ['text', 'image', 'image_text'];

const httpsOnly = (u: string | null | undefined): string | undefined =>
  u && /^https:\/\//i.test(u) ? u : undefined;

async function fetchRemote(): Promise<NewsItem[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const env = (import.meta.env.VITE_APP_ENV as string) === 'production' ? 'production' : 'staging';
  const { data, error } = await sb.rpc('get_announcements', { p_env: env });
  if (error || !Array.isArray(data)) return [];
  return (data as RemoteRow[]).map((r) => {
    const ctaUrl = httpsOnly(r.cta_url);
    return {
      id: `db:${r.id}`,
      title: r.title,
      body: r.body ?? '',
      date: r.starts_at,
      layout: LAYOUTS.find((l) => l === r.layout),
      imageUrl: httpsOnly(r.image_url),
      cta: r.cta_label && ctaUrl ? { label: r.cta_label, url: ctaUrl } : undefined,
    };
  });
}

let cache: Promise<NewsItem[]> | null = null;

/** All live news, newest first. Remote failures fall back to the built-in list. */
export function loadNews(force = false): Promise<NewsItem[]> {
  if (IS_CRAZYGAMES) return Promise.resolve([]);
  if (!cache || force) {
    cache = fetchRemote()
      .catch(() => [])
      .then((remote) => [...remote, ...BUILTIN_NEWS].sort((a, b) => b.date.localeCompare(a.date)));
  }
  return cache;
}

/** News the launch popup should show on this device, in display order. */
export async function newsForLaunch(): Promise<NewsItem[]> {
  const items = await loadNews();
  const hidden = readSet(HIDDEN_KEY);
  return items.filter((n) => !hidden.has(n.id));
}
