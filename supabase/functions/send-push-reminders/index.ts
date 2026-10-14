import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { allowedPushEndpoint, encryptPush, vapidAuthorization } from '../_shared/web-push.ts';
const projectUrl = 'https://xrtgcxofjisqaigaaboy.supabase.co';
Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (Deno.env.get('SUPABASE_URL') !== projectUrl) return new Response('Staging only', { status: 403 });
  const supabase = createClient(projectUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: config, error: configError } = await supabase.rpc('staging_automation_config');
  if (configError || !config?.scheduler_token || req.headers.get('x-gridnova-scheduler') !== config.scheduler_token) return new Response('Unauthorized', { status: 401 });
  const { data: tokens, error } = await supabase.rpc('claim_staging_daily_reminders');
  if (error) return Response.json({ error: 'Could not select reminders' }, { status: 500 });
  let sent = 0, failed = 0;
  try { await Promise.all((tokens ?? []).map(async (token: { id: string; token: string; p256dh: string; auth: string; reminder_date: string }) => {
    let status = 0;
    try {
      if (!allowedPushEndpoint(token.token)) throw new Error('Unsupported push endpoint');
      const body = await encryptPush(token.p256dh, token.auth, JSON.stringify({ title: 'GridNova Daily Puzzle', body: 'Today’s puzzle resets soon. Play today’s puzzle before it closes!', url: '/' }));
      const response = await fetch(token.token, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { Authorization: await vapidAuthorization(token.token, config.vapid_public, config.vapid_private), 'Content-Type': 'application/octet-stream', 'Content-Encoding': 'aes128gcm', TTL: '7200', Urgency: 'normal' }, body,
      });
      status = response.status;
      if (response.ok) sent++; else failed++;
      if (status === 404 || status === 410) await supabase.from('push_tokens').delete().eq('id', token.id).eq('token', token.token);
    } catch { failed++; }
    const { error: finishError } = await supabase.rpc('finish_staging_daily_reminder', { p_token_id: token.id, p_date: token.reminder_date, p_status: status });
    if (finishError) throw new Error('Could not record delivery');
  })); } catch { return Response.json({ sent, failed, error: 'Could not record delivery' }, { status: 500 }); }
  return Response.json({ sent, failed, total: tokens?.length ?? 0 });
});
