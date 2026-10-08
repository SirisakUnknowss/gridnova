import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

interface Context { request: Request; env: { STAGING_BASIC_USER?: string; STAGING_BASIC_PASS?: string }; next: () => Promise<Response> }
const source = readFileSync('functions/_middleware.js', 'utf8').replace('export async function onRequest', 'async function onRequest');
const handle = new Function(`${source}; return onRequest;`)() as (context: Context) => Promise<Response>;
const env = { STAGING_BASIC_USER: 'test-only-user', STAGING_BASIC_PASS: 'test-only-secret' };
const next = async () => new Response('game');
const context = (request: Request): Context => ({ request, env, next });

it('redirects missing and invalid staging sessions directly to login without caching', async () => {
  for (const cookie of ['', 'staging_session=invalid']) {
    const response = await handle(context(new Request('https://staging.gridnova.pages.dev/?test=1', { headers: { Cookie: cookie } })));
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('https://staging.gridnova.pages.dev/login');
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  }
});

it('serves login without a redirect loop and rejects wrong credentials', async () => {
  const page = await handle(context(new Request('https://staging.gridnova.pages.dev/login')));
  expect(page.status).toBe(200);
  expect(page.headers.get('Cache-Control')).toContain('no-store');
  const rejected = await handle(context(new Request('https://staging.gridnova.pages.dev/login', { method: 'POST', body: new URLSearchParams({ username: env.STAGING_BASIC_USER, password: 'wrong' }) })));
  expect(rejected.status).toBe(401);
  expect(rejected.headers.has('Set-Cookie')).toBe(false);
});

it('logs in with a signed cookie, redirects with GET and serves uncached game HTML', async () => {
  const login = await handle(context(new Request('https://staging.gridnova.pages.dev/login', { method: 'POST', body: new URLSearchParams({ username: env.STAGING_BASIC_USER, password: env.STAGING_BASIC_PASS }) })));
  expect(login.status).toBe(303);
  expect(login.headers.get('Location')).toBe('/');
  const cookie = login.headers.get('Set-Cookie')!.split(';')[0];
  expect(login.headers.get('Set-Cookie')).toContain('HttpOnly; Secure; SameSite=Lax');
  const game = await handle(context(new Request('https://staging.gridnova.pages.dev/', { headers: { Cookie: cookie } })));
  expect(await game.text()).toBe('game');
  expect(game.headers.get('Cache-Control')).toContain('no-store');
  const signedInLogin = await handle(context(new Request('https://staging.gridnova.pages.dev/login', { headers: { Cookie: cookie } })));
  expect(signedInLogin.headers.get('Location')).toBe('https://staging.gridnova.pages.dev/');
});

it('leaves production responses untouched', async () => {
  const response = await handle(context(new Request('https://gridnova.pages.dev/')));
  expect(await response.text()).toBe('game');
  expect(response.headers.has('Cache-Control')).toBe(false);
});
