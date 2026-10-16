import { expect, it, vi } from 'vitest';
import { cachedThemeIcon, isThemeIconRequest } from '../../src/lib/theme-icon-cache';

const request = new Request('https://gridnova.pages.dev/assets/skin-theme_classic-hash.webp');

function fakeCache(cached?: Response) {
  const methods = { match: vi.fn().mockResolvedValue(cached), put: vi.fn().mockResolvedValue(undefined), keys: vi.fn().mockResolvedValue([]), delete: vi.fn().mockResolvedValue(true) };
  return { methods, cache: methods as unknown as Cache };
}

it('only caches same-origin icon pack images, never navigation or APIs', () => {
  expect(isThemeIconRequest(new URL(request.url), 'https://gridnova.pages.dev', 'image')).toBe(true);
  expect(isThemeIconRequest(new URL(request.url), 'https://other.example', 'image')).toBe(false);
  expect(isThemeIconRequest(new URL(request.url), 'https://gridnova.pages.dev', 'document')).toBe(false);
  expect(isThemeIconRequest(new URL('https://gridnova.pages.dev/rest/v1/user_inventory'), 'https://gridnova.pages.dev', 'image')).toBe(false);
});

it('serves an already-used pack offline without fetching', async () => {
  const response = new Response('cached pack');
  const { cache } = fakeCache(response);
  const fetcher = vi.fn().mockRejectedValue(new Error('offline'));
  expect(await cachedThemeIcon(request, cache, fetcher)).toBe(response);
  expect(fetcher).not.toHaveBeenCalled();
});

it('stores a downloaded pack and caps the runtime cache at forty packs', async () => {
  const { cache, methods } = fakeCache();
  const keys = Array.from({ length: 42 }, (_, i) => new Request(`https://gridnova.pages.dev/assets/skin-old-${i}.webp`));
  methods.keys.mockResolvedValue(keys);
  const response = new Response('new pack');
  expect(await cachedThemeIcon(request, cache, vi.fn().mockResolvedValue(response))).toBe(response);
  expect(methods.put).toHaveBeenCalledOnce();
  expect(methods.delete.mock.calls.map(call => call[0])).toEqual(keys.slice(0, 2));
});

it('does not retain failed responses and still displays successful downloads when cache storage is full', async () => {
  const { cache, methods } = fakeCache();
  const failed = new Response('unavailable', { status: 503 });
  expect(await cachedThemeIcon(request, cache, vi.fn().mockResolvedValue(failed))).toBe(failed);
  expect(methods.put).not.toHaveBeenCalled();
  methods.put.mockRejectedValue(new Error('quota exceeded'));
  const response = new Response('downloaded pack');
  expect(await cachedThemeIcon(request, cache, vi.fn().mockResolvedValue(response))).toBe(response);
});
