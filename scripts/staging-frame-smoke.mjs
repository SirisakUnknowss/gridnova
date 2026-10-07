import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(line => line.includes('=')).map(line => {
  const index = line.indexOf('=');
  return [line.slice(0, index), line.slice(index + 1)];
}));
assert.equal(env.VITE_SUPABASE_URL, 'https://xrtgcxofjisqaigaaboy.supabase.co');
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const guest = await client.rpc('equip_avatar_frame', { p_frame_id: null });
assert.ok(guest.error, 'guest frame mutation must be rejected');
const { error: loginError } = await client.auth.signInWithPassword({ email: env.STAGING_TEST_EMAIL, password: env.STAGING_TEST_PASSWORD });
assert.ifError(loginError);
const catalog = await client.from('shop_items').select('id,price_coin').eq('category', 'avatar_frame');
assert.ifError(catalog.error);
assert.equal(catalog.data.length, 24);
const inventory = await client.from('user_inventory').select('item_id');
assert.ifError(inventory.error);
const owned = new Set(inventory.data.map(item => item.item_id));
const before = await client.from('user_equipped').select('*').single();
assert.ifError(before.error);
const unowned = catalog.data.find(item => !owned.has(item.id));
if (unowned) {
  const denied = await client.rpc('equip_avatar_frame', { p_frame_id: unowned.id });
  assert.match(denied.error?.message ?? '', /frame_not_owned/);
}
const existing = catalog.data.find(item => owned.has(item.id));
assert.ok(existing, 'purchase a test frame through the UI first');
try {
  const equipped = await client.rpc('equip_avatar_frame', { p_frame_id: existing.id });
  assert.ifError(equipped.error);
  assert.equal(equipped.data.frame_id, existing.id);
  assert.deepEqual(equipped.data.avatar, before.data.avatar);
  const duplicate = await client.functions.invoke('purchase-item', { body: { item_id: existing.id } });
  assert.ok(duplicate.error);
  const body = await duplicate.error.context.json();
  assert.equal(body.error.code, 'ALREADY_OWNED');
  const removed = await client.rpc('equip_avatar_frame', { p_frame_id: null });
  assert.ifError(removed.error);
  assert.equal(removed.data.frame_id, null);
} finally {
  const restored = await client.rpc('equip_avatar_frame', { p_frame_id: before.data.frame_id });
  assert.ifError(restored.error);
}
process.stdout.write('Staging frames: catalog, guest rejection, ownership, equip, duplicate rejection, remove and restore passed.\n');
