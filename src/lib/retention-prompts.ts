import { IS_CRAZYGAMES } from './platform';
import { enablePushNotifications, isPushConfigured, isPushSupported } from './push';

const WINS_KEY = 'gn_retention_wins_v1';
const PWA_DISMISSED_KEY = 'gn_pwa_prompt_dismissed_v1';
const PWA_INSTALLED_KEY = 'gn_pwa_installed_v1';
const PUSH_DISMISSED_KEY = 'gn_push_prompt_dismissed_v1';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type RetentionOfferKind = 'pwa-native' | 'pwa-ios' | 'pwa-manual' | 'push';

export interface RetentionOffer {
  kind: RetentionOfferKind;
  title: string;
  body: string;
  ctaLabel: string;
  dismissLabel: string;
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

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
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

export function recordWinAndGetCount(): number {
  const prev = Number.parseInt(safeGet(WINS_KEY) ?? '0', 10);
  const next = (Number.isFinite(prev) && prev > 0 ? prev : 0) + 1;
  safeSet(WINS_KEY, String(next));
  return next;
}

function canOfferPwa(): 'pwa-native' | 'pwa-ios' | 'pwa-manual' | null {
  if (isRunningStandalone() || safeGet(PWA_INSTALLED_KEY) === '1' || safeGet(PWA_DISMISSED_KEY) === '1') {
    return null;
  }
  if (deferredInstallPrompt) return 'pwa-native';
  if (isIosDevice()) return 'pwa-ios';
  return 'pwa-manual';
}

function canOfferPush(isGuest: boolean): boolean {
  if (isGuest) return false;
  if (safeGet(PUSH_DISMISSED_KEY) === '1') return false;
  if (!isPushSupported() || !isPushConfigured()) return false;
  return Notification.permission === 'default';
}

// Show on Win #1 or #2 (the highest-drop-off window before players forget the URL).
// Sequence PWA install first, then Daily Puzzle push reminders so we never stack two asks.
export function getPostWinRetentionOffer(winCount: number, isGuest: boolean): RetentionOffer | null {
  if (IS_CRAZYGAMES || (winCount !== 1 && winCount !== 2)) return null;

  const pwaKind = canOfferPwa();
  if (pwaKind === 'pwa-native') {
    return {
      kind: 'pwa-native',
      title: 'Add GridNova to Home Screen',
      body: 'Launch in 1 tap and keep your Daily Puzzle streak alive.',
      ctaLabel: 'Install App',
      dismissLabel: 'Not now',
    };
  }
  if (pwaKind === 'pwa-ios') {
    return {
      kind: 'pwa-ios',
      title: 'Add GridNova to Home Screen',
      body: 'Tap Share, then "Add to Home Screen" for 1-tap Daily Puzzles.',
      ctaLabel: 'Got it',
      dismissLabel: 'Not now',
    };
  }
  if (pwaKind === 'pwa-manual') {
    return {
      kind: 'pwa-manual',
      title: 'Add GridNova to Home Screen',
      body: 'Open your browser menu and choose "Add to Home Screen" for 1-tap Daily Puzzles.',
      ctaLabel: 'Got it',
      dismissLabel: 'Not now',
    };
  }

  if (canOfferPush(isGuest)) {
    return {
      kind: 'push',
      title: 'Daily Puzzle Reminders',
      body: 'Get a quick ping each day when a fresh puzzle drops.',
      ctaLabel: 'Enable Reminders',
      dismissLabel: 'Not now',
    };
  }

  return null;
}

export function dismissRetentionOffer(kind: RetentionOfferKind): void {
  if (kind === 'push') {
    safeSet(PUSH_DISMISSED_KEY, '1');
  } else {
    safeSet(PWA_DISMISSED_KEY, '1');
  }
}

export async function triggerRetentionOffer(kind: RetentionOfferKind): Promise<'accepted' | 'dismissed' | 'blocked'> {
  if (kind === 'pwa-native') {
    if (!deferredInstallPrompt) {
      safeSet(PWA_DISMISSED_KEY, '1');
      return 'dismissed';
    }
    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      safeSet(PWA_INSTALLED_KEY, '1');
      return 'accepted';
    }
    safeSet(PWA_DISMISSED_KEY, '1');
    return 'dismissed';
  }

  if (kind === 'pwa-ios' || kind === 'pwa-manual') {
    safeSet(PWA_DISMISSED_KEY, '1');
    return 'accepted';
  }

  const ok = await enablePushNotifications();
  safeSet(PUSH_DISMISSED_KEY, '1');
  if (ok) return 'accepted';
  return typeof Notification !== 'undefined' && Notification.permission === 'denied' ? 'blocked' : 'dismissed';
}
