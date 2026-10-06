import { beforeEach, afterEach, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  vi.stubGlobal('crypto', { getRandomValues: (values: Uint32Array) => { values.fill(0); return values; } });
});
afterEach(() => { vi.unstubAllGlobals(); });

it('assigns a stable themed name on first visit', async () => {
  const { getGuestIdentity } = await import('../../src/lib/guest-identity');
  expect(getGuestIdentity().name).toBe('Nova');
  expect(getGuestIdentity()).toEqual(getGuestIdentity());
});
it('keeps a renamed guest and avatar after reloading the module', async () => {
  const { saveGuestIdentity } = await import('../../src/lib/guest-identity');
  saveGuestIdentity({ name: 'LunarAthena', emoji: '🤖' });
  vi.resetModules();
  const { getGuestIdentity } = await import('../../src/lib/guest-identity');
  expect(getGuestIdentity()).toEqual({ name: 'LunarAthena', emoji: '🤖', generated: false });
});
it('recovers from malformed stored identity', async () => {
  localStorage.setItem('gn_guest_identity_v1', '{broken');
  const { getGuestIdentity } = await import('../../src/lib/guest-identity');
  expect(getGuestIdentity().name).toBe('Nova');
});
it('still allows naming when storage is unavailable', async () => {
  vi.stubGlobal('localStorage', { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); } });
  const { getGuestIdentity, saveGuestIdentity } = await import('../../src/lib/guest-identity');
  expect(getGuestIdentity().name).toBe('Nova');
  saveGuestIdentity({ name: 'AstralNyx', emoji: '👤' });
  expect(getGuestIdentity().name).toBe('AstralNyx');
});

it('migrates an earlier combined generated name to one name', async () => {
  localStorage.setItem('gn_guest_identity_v1', JSON.stringify({ name: 'StellarAthena', emoji: '👤' }));
  const { getGuestIdentity } = await import('../../src/lib/guest-identity');
  expect(getGuestIdentity().name).toBe('Stellar');
});

it('removes a paid avatar from an older guest identity and persists the repair', async () => {
  localStorage.setItem('gn_guest_identity_v1', JSON.stringify({ name: 'Comet', emoji: 'avatar_rare_ocean', generated: false }));
  const { getGuestIdentity } = await import('../../src/lib/guest-identity');
  expect(getGuestIdentity().emoji).toBe('👤');
  expect(JSON.parse(localStorage.getItem('gn_guest_identity_v1')!).emoji).toBe('👤');
});

it('rejects paid shop aliases when saving a guest avatar', async () => {
  const { saveGuestIdentity, getGuestIdentity } = await import('../../src/lib/guest-identity');
  for (const emoji of ['space_lunar-fox', 'avatar_pet_dog', 'avatar_rare_ocean']) {
    saveGuestIdentity({ name: 'Comet', emoji });
    expect(getGuestIdentity().emoji).toBe('👤');
  }
  saveGuestIdentity({ name: 'Comet', emoji: 'space_orbit-bunny' });
  expect(getGuestIdentity().emoji).toBe('space_orbit-bunny');
});
