// =====================================================================
// Web Push — subscribe, save token, check status
// VAPID_PUBLIC_KEY must be set in .env as VITE_VAPID_PUBLIC_KEY
// Generate with: npx web-push generate-vapid-keys
// =====================================================================
import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function encodeKey(key: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(key))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function isPushSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

export function isPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY);
}

export async function getPushPermission(): Promise<NotificationPermission> {
  return Notification.permission;
}

/** Request notification permission and subscribe. Returns true if granted + subscribed. */
export async function enablePushNotifications(): Promise<boolean> {
  if (!isPushSupported()) return false;
  if (!VAPID_PUBLIC_KEY) {
    console.warn('[push] VITE_VAPID_PUBLIC_KEY not set — push disabled');
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) return false;
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg?.active) return false;
    let previous = await reg.pushManager.getSubscription();
    if (previous?.options?.applicationServerKey && encodeKey(previous.options.applicationServerKey) !== VAPID_PUBLIC_KEY) {
      await previous.unsubscribe();
      previous = null;
    }
    const subscription = previous ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer,
    });

    const endpoint = subscription.endpoint;
    const keys = subscription.toJSON().keys ?? {};

    const { error } = await supabase.from('push_tokens').upsert(
      {
        user_id: user.id,
        token: endpoint,
        p256dh: keys.p256dh ?? '',
        auth: keys.auth ?? '',
        platform: 'web',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform' }
    );

    if (error) throw error;

    const { error: preferenceError } = await supabase.from('user_settings').upsert({ user_id: user.id, notifications_daily: true }, { onConflict: 'user_id' });
    if (preferenceError) throw preferenceError;
    return true;
  } catch (err) {
    console.warn('[push] subscribe failed:', err);
    return false;
  }
}

export async function disablePushNotifications(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: preferenceError } = await supabase.from('user_settings').upsert({ user_id: user.id, notifications_daily: false }, { onConflict: 'user_id' });
    if (preferenceError) throw preferenceError;
    const { error: tokenError } = await supabase.from('push_tokens').delete().eq('user_id', user.id).eq('platform', 'web');
    if (tokenError) throw tokenError;
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
  } catch (err) {
    console.warn('[push] unsubscribe failed:', err);
    throw err;
  }
}
