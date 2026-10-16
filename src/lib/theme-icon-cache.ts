export const THEME_ICON_CACHE = 'gridnova-theme-icons-v2';

export function isThemeIconRequest(url: URL, origin: string, destination: string): boolean {
  return destination === 'image' && url.origin === origin && /\/assets\/skin-[\w-]+\.webp$/.test(url.pathname);
}

export async function cachedThemeIcon(request: Request, cache: Cache, fetcher: typeof fetch = fetch): Promise<Response> {
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetcher(request);
  if (response.ok) {
    try {
      await cache.put(request, response.clone());
      const keys = await cache.keys();
      await Promise.all(keys.slice(0, Math.max(0, keys.length - 40)).map(key => cache.delete(key)));
    } catch { /* A full cache must not prevent downloaded icons from rendering. */ }
  }
  return response;
}
