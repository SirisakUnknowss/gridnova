import { IS_CRAZYGAMES } from './platform';
import { enablePushNotifications, isPushConfigured, isPushSupported } from './push';

const PWA_INSTALLED_KEY = 'gn_pwa_installed_v1';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let captureInitialized = false;

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* private browsing */ }
}

export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

export function isPwaInstalled(): boolean {
  return isRunningStandalone() || safeGet(PWA_INSTALLED_KEY) === '1';
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

export function hasNativeInstallPrompt(): boolean {
  return deferredInstallPrompt !== null;
}

export function canEnablePushReminders(): boolean {
  if (IS_CRAZYGAMES || typeof Notification === 'undefined') return false;
  if (!isPushSupported() || !isPushConfigured()) return false;
  return Notification.permission === 'default';
}

export function initInstallPromptCapture(): void {
  if (captureInitialized || IS_CRAZYGAMES || typeof window === 'undefined') return;
  captureInitialized = true;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    safeSet(PWA_INSTALLED_KEY, '1');
  });
}

export async function runInstallPrompt(): Promise<'accepted' | 'dismissed'> {
  if (!deferredInstallPrompt) return 'dismissed';
  const promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;
  await promptEvent.prompt();
  const { outcome } = await promptEvent.userChoice;
  if (outcome === 'accepted') {
    safeSet(PWA_INSTALLED_KEY, '1');
    return 'accepted';
  }
  return 'dismissed';
}

export async function runPushReminderPrompt(): Promise<'accepted' | 'dismissed' | 'blocked'> {
  const ok = await enablePushNotifications();
  if (ok) return 'accepted';
  return typeof Notification !== 'undefined' && Notification.permission === 'denied' ? 'blocked' : 'dismissed';
}
