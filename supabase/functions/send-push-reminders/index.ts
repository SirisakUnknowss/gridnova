// send-push-reminders — Send daily puzzle reminder to users who haven't played today
// Triggered by pg_cron at 08:00 local time or on-demand from admin
// Requires Supabase secrets: VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const VAPID_SUBJECT  = Deno.env.get('VAPID_SUBJECT')  ?? 'mailto:admin@gridnova.app';
const VAPID_PUBLIC   = Deno.env.get('VAPID_PUBLIC_KEY')  ?? '';
const VAPID_PRIVATE  = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

// ── Minimal VAPID JWT builder (using Web Crypto API) ─────────────────
async function vapidJwt(audience: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header  = btoa(JSON.stringify({ typ: 'JWT', alg: 'ES256' })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const payload = btoa(JSON.stringify({ aud: audience, exp: now + 12 * 3600, sub: VAPID_SUBJECT })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');

  const privateKeyBytes = Uint8Array.from(atob(VAPID_PRIVATE.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', privateKeyBytes, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(`${header}.${payload}`));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  return `${header}.${payload}.${sigB64}`;
}

async function sendWebPush(token: { token: string; p256dh: string; auth: string }, body: object): Promise<boolean> {
  try {
    const endpoint = token.token;
    const audience = new URL(endpoint).origin;
    const jwt = await vapidJwt(audience);
    const authHeader = `vapid t=${jwt},k=${VAPID_PUBLIC}`;

    const payload = new TextEncoder().encode(JSON.stringify(body));

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Encoding': 'aesgcm',
        'TTL': '86400',
      },
      body: payload,
    });

    if (res.status === 410 || res.status === 404) {
      // Subscription expired — remove it
      await supabase.from('push_tokens').delete().eq('token', endpoint);
    }
    return res.ok;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const today = new Date().toISOString().slice(0, 10);

  // Users who have push tokens but haven't submitted a daily score today
  const { data: tokens, error } = await supabase
    .from('push_tokens')
    .select('user_id, token, p256dh, auth, platform')
    .eq('platform', 'web');

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  if (!tokens?.length) return new Response(JSON.stringify({ sent: 0 }));

  // Filter out users who already played today
  const userIds = tokens.map((t: any) => t.user_id);
  const { data: played } = await supabase
    .from('user_game_history')
    .select('user_id')
    .eq('mode', 'daily')
    .eq('daily_date', today)
    .in('user_id', userIds);

  const playedSet = new Set((played ?? []).map((r: any) => r.user_id));
  const toNotify = (tokens as any[]).filter((t) => !playedSet.has(t.user_id));

  let sent = 0;
  await Promise.all(toNotify.map(async (t) => {
    const ok = await sendWebPush(t, {
      title: "🧩 Daily puzzle is waiting!",
      body: "Play today's GridNova puzzle and climb the leaderboard.",
      url: '/',
    });
    if (ok) sent++;
  }));

  return new Response(JSON.stringify({ sent, total: toNotify.length }));
});
