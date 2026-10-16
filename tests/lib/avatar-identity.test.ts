import { beforeEach, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn(), select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() }));
vi.mock('../../src/lib/supabase', () => ({ supabase: { auth: { getUser: mocks.getUser }, from: mocks.from } }));
import { getEquipped } from '../../src/lib/api';
import { useStore } from '../../src/state/store';
import { framedAvatarHTML } from '../../src/ui/components/avatar-frame';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
  mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
});

it('never reads another player equipment for guests', async () => {
  for (const user of [null, { id: 'guest', is_anonymous: true }]) {
    mocks.getUser.mockResolvedValue({ data: { user }, error: null });
    expect(await getEquipped()).toBeNull();
  }
  expect(mocks.from).not.toHaveBeenCalled();
});

it('filters equipment by current member even when no equipment row exists', async () => {
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'new-member' } }, error: null });
  expect(await getEquipped()).toBeNull();
  expect(mocks.eq).toHaveBeenCalledWith('user_id', 'new-member');
});

it('clears previous account cosmetics but preserves them on token refresh', () => {
  const user = { id: 'first' } as User;
  useStore.getState().setUser(user);
  useStore.getState().setEquipped({ avatar: { item_id: 'avatar_monthly_moon_rabbit' }, frame_id: 'frame_monthly_lotus_orbit' });
  useStore.getState().setInventory(['avatar_monthly_moon_rabbit']);
  useStore.getState().setUser({ ...user });
  expect(useStore.getState().equipped.avatar.item_id).toBe('avatar_monthly_moon_rabbit');
  useStore.getState().setUser({ id: 'second' } as User);
  expect(useStore.getState().equipped.avatar).toEqual({ emoji: '👤' });
  expect(useStore.getState().equipped.frame_id).toBeNull();
  expect(useStore.getState().inventory).toEqual([]);
});

it('always wraps unframed avatars in a circular default ring', () => {
  for (const frame of [null, undefined, 'unknown-frame']) {
    const html = framedAvatarHTML('<img src="portrait.webp">', frame, 76);
    expect(html).toContain('avatar-frame--default');
    expect(html).toContain('avatar-frame-content');
    expect(html).toContain('avatar-frame-ring');
  }
});
