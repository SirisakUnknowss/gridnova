const project = 'xrtgcxofjisqaigaaboy';
if (process.env.VITE_SUPABASE_URL !== `https://${project}.supabase.co`) {
  throw new Error('Staging must use its isolated Supabase project. Check staging environment secrets.');
}
const key = process.env.VITE_SUPABASE_ANON_KEY ?? '';
if (!key) throw new Error('Staging frontend API key is missing.');
if (!key.startsWith('sb_publishable_')) {
  const payload = JSON.parse(Buffer.from(key.split('.')[1] ?? '', 'base64url').toString());
  if (payload.ref !== project || payload.role !== 'anon') {
    throw new Error('Staging frontend requires an anon key from its own project.');
  }
}
process.stdout.write('Isolated staging backend verified.\n');
