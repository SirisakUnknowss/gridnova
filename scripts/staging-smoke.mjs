import { readFileSync, appendFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(line => line.includes('=')).map(line => {
  const i = line.indexOf('=');
  return [line.slice(0, i), line.slice(i + 1)];
}));
if (env.VITE_SUPABASE_URL !== 'https://xrtgcxofjisqaigaaboy.supabase.co') throw new Error('Staging project required');
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const command = process.argv[2];
if (command === 'signup') {
  const { data, error } = await client.auth.signUp({ email: env.STAGING_TEST_EMAIL, password: env.STAGING_TEST_PASSWORD, options: { emailRedirectTo: 'http://127.0.0.1:5173/' } });
  if (error) throw error;
  process.stdout.write(JSON.stringify({ user_id: data.user?.id, confirmation_required: !data.session }));
} else {
  const { data, error } = await client.auth.signInWithPassword({ email: env.STAGING_TEST_EMAIL, password: env.STAGING_TEST_PASSWORD });
  if (error) throw error;
  appendFileSync('.env.local', 'STAGING_TEST_USER_ID=' + data.user.id + '\n');
  const catalog = await client.from('shop_items').select('id,price_coin,metadata').eq('available', true);
  const rare = catalog.data?.filter(item => item.id.startsWith('avatar_rare_')) ?? [];
  process.stdout.write(JSON.stringify({ user_id: data.user.id, items: catalog.data?.length, rare: rare.length, error: catalog.error }) + '\n');
  if (command === 'shop') {
    async function invoke(name, body, expectedCode) {
      const result = await client.functions.invoke(name, { body });
      const response = result.error?.context;
      const payload = response ? await response.json() : result.data;
      if (expectedCode ? payload?.error?.code !== expectedCode : result.error || !payload?.success) throw new Error(JSON.stringify({ name, payload }));
      process.stdout.write(JSON.stringify({ name, body, result: payload }) + '\n');
      return payload;
    }
    const paid = rare.find(item => item.metadata.theme_id === 'theme_ocean');
    const free = rare.find(item => item.metadata.theme_id === 'theme_classic');
    if (!paid || !free) throw new Error('Required Rare catalog missing');
    await invoke('purchase-item', { item_id: paid.id }, 'THEME_REQUIRED');
    await invoke('purchase-item', { item_id: 'theme_ocean' });
    await invoke('purchase-item', { item_id: paid.id });
    await invoke('purchase-item', { item_id: paid.id }, 'ALREADY_OWNED');
    await invoke('purchase-item', { item_id: free.id });
    await invoke('equip-item', { theme_id: 'theme_ocean', avatar: { item_id: paid.id } });
    const inventory = await client.from('user_inventory').select('item_id').eq('user_id', data.user.id);
    const wallet = await client.from('user_wallet').select('coins').eq('user_id', data.user.id).single();
    process.stdout.write(JSON.stringify({ inventory: inventory.data, wallet: wallet.data }) + '\n');
  }
  if (command === 'game') {
    const practice = await client.functions.invoke('submit-practice-score', { body: { level: 'easy', stage: 1, time_seconds: 120, mistakes: 0, hints_used: 0 } });
    if (practice.error) throw practice.error;
    process.stdout.write(JSON.stringify({ practice: practice.data }) + '\n');
    const run = await client.functions.invoke('start-time-attack', { body: { tier: 'sprint' } });
    if (run.error) throw run.error;
    process.stdout.write(JSON.stringify({ time_attack_started: run.data }) + '\n');
    const raw = run.data.puzzle;
    const cells = Array.isArray(raw) ? raw.flat() : [...raw].map(Number);
    const solution = [...cells];
    function solve(index = 0) {
      while (index < 81 && solution[index]) index++;
      if (index === 81) return true;
      const row = Math.floor(index / 9), col = index % 9;
      for (let number = 1; number <= 9; number++) {
        let valid = true;
        for (let i = 0; i < 9; i++) {
          if (solution[row * 9 + i] === number || solution[i * 9 + col] === number || solution[(Math.floor(row / 3) * 3 + Math.floor(i / 3)) * 9 + Math.floor(col / 3) * 3 + i % 3] === number) valid = false;
        }
        if (!valid) continue;
        solution[index] = number;
        if (solve(index + 1)) return true;
        solution[index] = 0;
      }
      return false;
    }
    if (!solve()) throw new Error('Time Attack puzzle has no solution');
    const moves = cells.flatMap((n, i) => n ? [] : [{ r: Math.floor(i / 9), c: i % 9, n: solution[i], t: (i + 1) * 500 }]);
    await new Promise(resolve => setTimeout(resolve, 46000));
    const finish = await client.functions.invoke('submit-time-attack-score', { body: { ticket_id: run.data.ticket_id, time_seconds: 46, mistakes: 0, hints_used: 0, moves } });
    if (finish.error) throw finish.error;
    process.stdout.write(JSON.stringify({ time_attack_finished: finish.data }) + '\n');
  }
}
