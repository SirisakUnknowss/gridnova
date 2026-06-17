// admin-actions — Privileged admin operations on user accounts
// Caller must be an admin (verified via profiles.is_admin = true)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function isAdmin(jwt: string): Promise<boolean> {
  const { data: { user }, error } = await supabase.auth.getUser(jwt);
  if (error || !user) return false;
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  return data?.is_admin === true;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
  if (!(await isAdmin(jwt))) return new Response('Forbidden', { status: 403 });

  const body = await req.json() as {
    action: 'adjust_coins' | 'reset_streak' | 'give_item' | 'ban' | 'unban';
    user_id: string;
    amount?: number;
    item_id?: string;
    reason?: string;
  };

  const { action, user_id } = body;
  if (!action || !user_id) return new Response('Missing action or user_id', { status: 400 });

  switch (action) {
    case 'adjust_coins': {
      const amount = body.amount ?? 0;
      const { error } = await supabase.rpc('admin_adjust_coins', { p_user_id: user_id, p_amount: amount, p_reason: body.reason ?? 'admin_adjust' });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify({ ok: true, adjusted: amount }));
    }

    case 'reset_streak': {
      const { error } = await supabase
        .from('user_progression')
        .update({ current_streak: 0 })
        .eq('user_id', user_id);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify({ ok: true }));
    }

    case 'give_item': {
      const item_id = body.item_id;
      if (!item_id) return new Response('Missing item_id', { status: 400 });
      const { error } = await supabase
        .from('user_inventory')
        .upsert({ user_id, item_id, acquired_at: new Date().toISOString() }, { onConflict: 'user_id,item_id' });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify({ ok: true, item_id }));
    }

    case 'ban': {
      const { error } = await supabase.from('profiles').update({ is_banned: true, ban_reason: body.reason ?? '' }).eq('id', user_id);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify({ ok: true }));
    }

    case 'unban': {
      const { error } = await supabase.from('profiles').update({ is_banned: false, ban_reason: null }).eq('id', user_id);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      return new Response(JSON.stringify({ ok: true }));
    }

    default:
      return new Response('Unknown action', { status: 400 });
  }
});
