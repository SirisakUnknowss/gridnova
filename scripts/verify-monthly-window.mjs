import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(line => line.includes('=')).map(line => { const split = line.indexOf('='); return [line.slice(0, split), line.slice(split + 1)]; }));
if (env.VITE_SUPABASE_URL !== 'https://xrtgcxofjisqaigaaboy.supabase.co') throw Error('Isolated staging required');
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const login = await client.auth.signInWithPassword({ email: env.STAGING_TEST_EMAIL, password: env.STAGING_TEST_PASSWORD });
if (login.error) throw Error('Staging test login failed');
const user = login.data.user.id;
async function snapshot() {
  const [inventory, wallet] = await Promise.all([client.from('user_inventory').select('item_id').eq('user_id', user).order('item_id'), client.from('user_wallet').select('coins').eq('user_id', user).single()]);
  if (inventory.error || wallet.error) throw Error('Could not verify test ownership');
  return JSON.stringify([inventory.data, wallet.data]);
}
try {
  const before = await snapshot();
  const current = await client.rpc('get_monthly_challenge');
  if (current.error || current.data.today !== '2026-12-15') throw Error('Expected unchanged December staging preview');
  const cases = [
    ['get_monthly_collection', { p_month: '2026-11' }, 'Collection is not active'],
    ['get_monthly_collection', { p_month: '2027-01' }, 'Collection is not active'],
    ['start_monthly_puzzle', { p_date: '2026-11-30' }, 'Puzzle date is not available'],
    ['start_monthly_puzzle', { p_date: '2027-01-01' }, 'Puzzle date is not available'],
    ['claim_monthly_reward', { p_item: 'avatar_monthly_lotus_otter' }, 'Collection is not active'],
  ];
  for (const [name, args, message] of cases) {
    const response = await client.rpc(name, args);
    if (!response.error?.message.includes(message)) throw Error(`Window guard failed: ${name}`);
  }
  if (before !== await snapshot()) throw Error('Inventory or coins changed');
  process.stdout.write('PASS: current collection, past/future reads and starts, expired claim, unchanged inventory and coins\n');
} finally { await client.auth.signOut({ scope: 'local' }); }
