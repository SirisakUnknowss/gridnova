import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: CORS });

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return new Response('Unauthorized', { status: 401, headers: CORS });

    const { ref_code } = await req.json();
    if (!ref_code || typeof ref_code !== 'string') {
      return new Response(JSON.stringify({ error: 'ref_code required' }), { status: 400, headers: CORS });
    }

    // Find referrer by code
    const { data: referrer, error: refErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', ref_code.toUpperCase())
      .maybeSingle();

    if (refErr || !referrer) {
      return new Response(JSON.stringify({ error: 'Invalid referral code' }), { status: 400, headers: CORS });
    }

    // Don't let someone refer themselves
    if (referrer.id === user.id) {
      return new Response(JSON.stringify({ error: 'Cannot refer yourself' }), { status: 400, headers: CORS });
    }

    // Check if already referred
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referee_id', user.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ ok: true, already_claimed: true }), { headers: CORS });
    }

    // Insert referral record (reward granted after 3 days via cron)
    const { error: insertErr } = await supabase
      .from('referrals')
      .insert({ referrer_id: referrer.id, referee_id: user.id });

    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ ok: true }), { headers: CORS });
  } catch (err) {
    console.error('claim-referral error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: CORS });
  }
});
