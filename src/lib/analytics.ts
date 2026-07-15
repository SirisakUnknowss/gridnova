// =====================================================================
// Error tracking (Sentry). No-op if VITE_SENTRY_DSN is missing.
// =====================================================================
import * as Sentry from '@sentry/browser';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const APP_ENV = (import.meta.env.VITE_APP_ENV as string) || 'local';
const APP_VERSION = (import.meta.env.VITE_APP_VERSION as string) || 'dev';

export function initAnalytics(): void {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: APP_ENV,
      release: APP_VERSION,
      tracesSampleRate: APP_ENV === 'production' ? 0.1 : 1.0,
      integrations: [Sentry.browserTracingIntegration()],
    });
    console.info('[Analytics] Sentry initialized');
  }
}

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  if (APP_ENV === 'local') console.error('[error]', err, context);
  if (!SENTRY_DSN) return;
  Sentry.captureException(err, { extra: context });
}

export function setTag(key: string, value: string): void {
  if (SENTRY_DSN) Sentry.setTag(key, value);
}
