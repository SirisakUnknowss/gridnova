import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function respond(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
function reject(code: string, message?: string) {
  return respond(403, { error: { code, message: message ?? code } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return respond(405, { error: 'Method Not Allowed' });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return reject('UNAUTHORIZED');

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
  if (authErr || !user) return reject('UNAUTHORIZED');

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let body: { week_start: string; quest_id: string };
  try { body = await req.json(); } catch { return reject('INVALID_PAYLOAD'); }

  const { week_start, quest_id } = body;
  if (!week_start || !quest_id) return reject('INVALID_PAYLOAD');

  // Fetch the quest row
  const { data: quest, error: qErr } = await supabaseAdmin
    .from('user_weekly_quests')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', week_start)
    .eq('quest_id', quest_id)
    .maybeSingle();

  if (qErr || !quest) return reject('QUEST_NOT_FOUND');
  if (!quest.completed_at) return reject('QUEST_NOT_COMPLETED');
  if (quest.claimed_at) return reject('ALREADY_CLAIMED');

  // Mark claimed
  const { error: updateErr } = await supabaseAdmin
    .from('user_weekly_quests')
    .update({ claimed_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('week_start', week_start)
    .eq('quest_id', quest_id);

  if (updateErr) return respond(500, { error: updateErr.message });

  // Grant rewards
  const coinReward = quest.reward_coin ?? 0;
  const xpReward = quest.reward_xp ?? 0;

  if (coinReward > 0) {
    await supabaseAdmin.rpc('grant_coins', {
      p_user_id: user.id,
      p_amount: coinReward,
      p_reason: 'weekly_quest_claim',
      p_metadata: { quest_id, week_start },
    });
  }

  let leveledUp = false;
  let newLevel: number | null = null;
  if (xpReward > 0) {
    const { data: xpResult } = await supabaseAdmin.rpc('grant_xp', {
      p_user_id: user.id,
      p_amount: xpReward,
    });
    leveledUp = xpResult?.[0]?.leveled_up ?? false;
    newLevel = xpResult?.[0]?.new_level ?? null;
  }

  return respond(200, {
    success: true,
    rewards: { coins: coinReward, xp: xpReward, leveled_up: leveledUp, new_level: newLevel },
  });
});
