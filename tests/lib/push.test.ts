import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const { getUser, upsert, remove, eq } = vi.hoisted(() => ({ getUser: vi.fn(), upsert: vi.fn(), remove: vi.fn(), eq: vi.fn() }));
vi.mock('../../src/lib/supabase', () => ({
  supabase: { auth: { getUser }, from: () => ({ upsert, delete: remove }) },
}));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_VAPID_PUBLIC_KEY', 'AQID');
  vi.stubGlobal('window', { Notification: {}, PushManager: {} });
  vi.stubGlobal('Notification', { requestPermission: vi.fn().mockResolvedValue('granted') });
  getUser.mockResolvedValue({ data: { user: { id: 'test-member', is_anonymous: false } } });
  upsert.mockReset().mockResolvedValue({ error: null });
  eq.mockReset().mockReturnValue({ eq, error: null });
  remove.mockReturnValue({ eq });
  vi.stubGlobal('navigator', { serviceWorker: {
    getRegistration: vi.fn().mockResolvedValue({ active: {}, pushManager: {
      getSubscription: vi.fn().mockResolvedValue({ endpoint: 'https://push.example/test',
        toJSON: () => ({ keys: { p256dh: 'test', auth: 'test' } }) }),
    } }),
  } });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

it('does not report enabled when saving the subscription fails', async () => {
  upsert.mockResolvedValue({ error: { message: 'permission denied' } });
  const { enablePushNotifications } = await import('../../src/lib/push');
  expect(await enablePushNotifications()).toBe(false);
});

it('returns without waiting forever when no worker is registered', async () => {
  vi.stubGlobal('navigator', { serviceWorker: { getRegistration: vi.fn().mockResolvedValue(undefined) } });
  const { enablePushNotifications } = await import('../../src/lib/push');
  expect(await enablePushNotifications()).toBe(false);
});

it('enables an existing subscription only after saving it', async () => {
  const { enablePushNotifications } = await import('../../src/lib/push');
  expect(await enablePushNotifications()).toBe(true);
  expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'test-member' }),
    { onConflict: 'user_id,platform' });
});

it('persists opt-in and refuses success when that write fails', async () => {
  upsert.mockResolvedValueOnce({error:null}).mockResolvedValueOnce({error:{message:'denied'}});
  const { enablePushNotifications } = await import('../../src/lib/push');
  expect(await enablePushNotifications()).toBe(false);
  expect(upsert).toHaveBeenLastCalledWith({user_id:'test-member',notifications_daily:true},{onConflict:'user_id'});
});
it('disables server preference and removes token even without a registered worker', async () => {
  vi.stubGlobal('navigator',{serviceWorker:{getRegistration:vi.fn().mockResolvedValue(undefined)}});
  const { disablePushNotifications } = await import('../../src/lib/push');
  await disablePushNotifications();
  expect(upsert).toHaveBeenCalledWith({user_id:'test-member',notifications_daily:false},{onConflict:'user_id'});
  expect(remove).toHaveBeenCalled();
});
it('reports disabling failure rather than displaying an off switch', async () => {
  upsert.mockResolvedValue({error:{message:'denied'}});
  const { disablePushNotifications } = await import('../../src/lib/push');
  await expect(disablePushNotifications()).rejects.toBeDefined();
});
