// =====================================================================
// Where a session came from.
//
// document.referrer is empty for most of our traffic: the LINE and Facebook
// in-app browsers strip it. The User-Agent and the click-id query params are
// what keep those visits from being indistinguishable from someone typing the
// URL by hand. See supabase/migrations/20260823110000_visitor_attribution.sql
// =====================================================================

const KEY = 'sudoku_attrib_v1';

export interface Attribution {
  referrer: string;
  referrer_host: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  click_id_kind: string;
  app_hint: string;
  landing_path: string;
}

function appHintFromUA(ua: string): string {
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'facebook-app';
  if (/\bLine\//i.test(ua)) return 'line';
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/Messenger/i.test(ua)) return 'messenger';
  if (/TikTok/i.test(ua)) return 'tiktok';
  if (/Twitter/i.test(ua)) return 'twitter';
  return '';
}

function clickIdKind(params: URLSearchParams): string {
  if (params.has('fbclid')) return 'facebook';
  if (params.has('gclid')) return 'google-ads';
  if (params.has('ttclid')) return 'tiktok';
  if (params.has('igshid')) return 'instagram';
  return '';
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * First touch for this tab, cached in sessionStorage.
 *
 * The cache is the point, not an optimisation: once the app navigates
 * internally, document.referrer becomes our own host, so reading it a second
 * time would overwrite a real origin with noise.
 */
export function getAttribution(): Attribution {
  try {
    const cached = sessionStorage.getItem(KEY);
    if (cached) return JSON.parse(cached) as Attribution;
  } catch { /* private mode, or corrupt entry — fall through and rebuild */ }

  const params = new URLSearchParams(location.search);
  const referrer = document.referrer || '';
  const host = hostOf(referrer);
  const self = location.hostname.replace(/^www\./, '');

  const attrib: Attribution = {
    referrer: referrer.slice(0, 500),
    referrer_host: host === self ? '' : host,
    utm_source: (params.get('utm_source') ?? '').slice(0, 100),
    utm_medium: (params.get('utm_medium') ?? '').slice(0, 100),
    utm_campaign: (params.get('utm_campaign') ?? '').slice(0, 100),
    click_id_kind: clickIdKind(params),
    app_hint: appHintFromUA(navigator.userAgent),
    landing_path: location.pathname.slice(0, 200),
  };

  try { sessionStorage.setItem(KEY, JSON.stringify(attrib)); } catch { /* private mode */ }
  return attrib;
}
