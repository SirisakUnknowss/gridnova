// send-push-reminders — Send daily puzzle reminder to users who haven't played today
// Triggered by pg_cron at 09:00 UTC daily
// Requires Supabase secrets: VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@gridnova.app';
const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

// ── Messages for members (streak, leaderboard, coins) ─────────────────
const MEMBER_MESSAGES: { title: string; body: string }[] = [
  { title: 'GridNova Daily', body: 'วันนี้ยังไม่ได้เล่นนะ! มาแก้โจทย์กันซักตา' },
  { title: 'GridNova Daily', body: 'Puzzle วันนี้รอคุณอยู่ อย่าให้ streak หายนะ!' },
  { title: '🎯 มาเล่นกัน!', body: 'คนอื่นเขาเล่นกันหมดแล้ว คุณจะยอมแพ้เหรอ?' },
  { title: '🧠 ฝึกสมองวันนี้', body: 'Sudoku วันละตาช่วยให้สมองแล็บดีขึ้นนะ!' },
  { title: '🔥 Streak alert!', body: 'อย่าให้ไฟมันดับ! มาเล่น GridNova วันนี้กัน' },
  { title: '🏆 Leaderboard รออยู่', body: 'วันนี้ใครจะเป็น #1? อาจจะเป็นคุณก็ได้!' },
  { title: 'GridNova Daily', body: 'Puzzle ใหม่มาแล้ว! มาดูว่าวันนี้ยากแค่ไหน' },
  { title: '⚡ Quick challenge', body: 'แค่ไม่กี่นาทีก็จบได้ มาลองดูกัน!' },
  { title: '🌟 วันใหม่ โอกาสใหม่', body: 'คะแนนสูงสุดของคุณยังเป็นของเมื่อวาน — เปลี่ยนมันซะ!' },
  { title: 'GridNova Daily', body: 'เพื่อนๆ เล่นกันแล้วนะ คุณจะล้าหลังเหรอ?' },
  { title: '💡 ลับสมองกัน', body: 'Sudoku วันนี้รอให้คุณมาพิชิตอยู่!' },
  { title: '🎮 Game time!', body: 'หยุดพักจากงานแป๊บนึง มาเล่น GridNova กัน' },
  { title: 'Daily Puzzle', body: 'ความท้าทายใหม่ของวันนี้มาแล้ว — พร้อมไหม?' },
  { title: '🏅 Top the board!', body: 'Puzzle วันนี้ไม่ยากเกินคุณหรอก ลองดูสิ!' },
  { title: 'GridNova Daily', body: 'ถ้าไม่เล่นวันนี้ streak หายแน่ๆ เลย!' },
  { title: '🎯 Focus mode', body: 'เคลียร์หัวด้วย Sudoku ซักตาก่อนนะ' },
  { title: '🌅 Good morning!', body: 'เริ่มวันด้วย GridNova — ดีกว่า scroll social สิ!' },
  { title: 'GridNova Daily', body: 'วันนี้ difficulty อะไรนะ? ไปเช็คกัน!' },
  { title: '🔢 Numbers calling', body: 'ตัวเลขกำลังเรียกหาคุณอยู่ มาแล้ว!' },
  { title: 'Daily challenge', body: 'ใครว่า Sudoku ยาก? วันนี้พิสูจน์ให้เห็นกัน!' },
  { title: '🏆 Claim your rank', body: 'อีกไม่กี่ชั่วโมง leaderboard จะปิด — รีบหน่อย!' },
  { title: 'GridNova Daily', body: 'Coffee ☕ + GridNova = perfect morning ✨' },
  { title: '⭐ Star player', body: 'คุณเล่นมาหลายวันแล้ว วันนี้อย่าหยุด!' },
  { title: 'Puzzle time!', body: 'มาดูว่าวันนี้คุณเร็วแค่ไหน!' },
  { title: '🎖️ Daily mission', body: 'Mission ประจำวันรอคุณอยู่ อย่าพลาด!' },
  { title: 'GridNova Daily', body: 'คุณไม่ใช่คนที่จะยอมแพ้ง่ายๆ หรอก — มาเล่น!' },
  { title: '🔥 Keep it going!', body: 'Streak ของคุณมีค่ามาก รักษาไว้นะ!' },
  { title: 'Daily Sudoku', body: 'ใช้เวลาแค่ไม่กี่นาที แต่ความสุขทั้งวันเลย!' },
  { title: '🎯 Hit the target', body: 'เป้าหมายวันนี้: เล่นให้จบ, ขึ้น leaderboard!' },
  { title: 'GridNova Daily', body: 'ทุกวันที่เล่น คุณเก่งขึ้นอีกนิด!' },
  { title: '💪 Challenge accepted?', body: 'Puzzle วันนี้ท้าให้คุณลองดู!' },
  { title: 'GridNova Daily', body: 'ไม่มีอะไรดีกว่าการแก้ puzzle ก่อนนอน 😴' },
  { title: '🌙 Night owl?', body: 'ยังตื่นอยู่ใช่ไหม? มาเล่น GridNova กัน!' },
  { title: 'Daily Puzzle', body: 'Puzzle รอมาตั้งแต่เช้า อย่าให้มันรอนานนะ!' },
  { title: '🎮 One more game', body: 'แค่ตาเดียว — แล้วคุณจะติดใจเอง!' },
  { title: 'GridNova Daily', body: 'วันนี้ no mistake challenge รับไหม?' },
  { title: '🏅 Perfect score?', body: 'ไม่มีใครทำ perfect ได้วันนี้เลย — คุณล่ะ?' },
  { title: 'Daily Puzzle', body: 'สมองดีเพราะฝึก ฝึกได้ที่ GridNova วันนี้!' },
  { title: '⚡ Speed run!', body: 'วันนี้ลอง beat เวลาตัวเองดูสิ!' },
  { title: 'GridNova Daily', body: 'มา solve กัน แล้วไป flex ใน leaderboard!' },
  { title: '🎯 Sharp mind', body: 'คนฉลาดเล่น Sudoku ทุกวัน — คุณล่ะ?' },
  { title: 'GridNova Daily', body: 'อีกนิดเดียวก็ขึ้น rank ใหม่แล้ว มาเล่นกัน!' },
  { title: '🔢 Grid is ready', body: '9×9 grid รอให้คุณมาพิชิตอยู่ครับ!' },
  { title: 'Puzzle unlocked!', body: 'Puzzle ใหม่ unlock แล้ว — รีบก่อนคนอื่น!' },
  { title: '🌟 Be the best', body: 'วันนี้ใครจะครอง #1? มาแข่งกัน!' },
  { title: 'GridNova Daily', body: 'คนที่ไม่เล่นวันนี้คือคนที่ยอมแพ้ง่าย — คุณไม่ใช่แน่นอน!' },
  { title: '🎮 Level up!', body: 'XP รอคุณอยู่ใน puzzle วันนี้!' },
  { title: 'Daily Sudoku', body: '5 นาทีก็พอ มาเล่นแล้วรับ coins กัน!' },
  { title: '🏆 Today\'s hero', body: 'Hero ของ leaderboard วันนี้คือใคร? อาจจะคุณ!' },
  { title: 'GridNova Daily', body: 'อย่าให้วันนี้ผ่านไปโดยไม่ได้เล่นนะ!' },
  { title: '💡 Brain workout', body: 'Gym สำหรับสมอง — GridNova Daily Puzzle!' },
  { title: 'GridNova Daily', body: 'Puzzle ของวันนี้สนุกมาก เชื่อผมเถอะ!' },
  { title: '🔥 Streak on fire!', body: 'Streak กำลังลุกแรง อย่าให้มันดับวันนี้นะ!' },
  { title: 'Daily Puzzle', body: 'คนเก่งไม่พักวัน มาเล่นกัน!' },
  { title: '⭐ Daily star', body: 'รับ star ประจำวันได้แล้ว — เล่นเลย!' },
  { title: 'GridNova Daily', body: 'Puzzle วันนี้ท้าทายกว่าเมื่อวาน — กล้าลองไหม?' },
  { title: '🎯 On target', body: 'เล่นให้ครบทุกวันเดือนนี้ — ทำได้สิ!' },
  { title: 'Daily Puzzle', body: 'ช่วงบ่ายง่วงๆ ลอง GridNova ปลุกสมองดูสิ!' },
  { title: '🏅 Daily champion', body: 'Champion ไม่หยุดพัก มาเล่นกัน!' },
  { title: 'GridNova Daily', body: 'แค่วันนี้วันเดียว อย่าเพิ่งหยุด!' },
  { title: '🎮 Play now!', body: 'GridNova puzzle วันนี้ยาก แต่คุณทำได้!' },
  { title: 'GridNova Daily', body: 'Coins รอคุณอยู่ใน puzzle วันนี้นะ!' },
  { title: '💎 Premium challenge', body: 'วันนี้ difficulty พิเศษ มาลองดูกัน!' },
  { title: 'Daily Puzzle', body: 'ฝึกทุกวัน เก่งทุกวัน — นั่นคือคุณ!' },
  { title: '🔢 Number magic', body: 'มนต์ตัวเลขกำลังรอคุณอยู่ใน GridNova!' },
  { title: 'GridNova Daily', body: 'วันนี้ขอให้เล่นให้จบนะ ไม่ยากอย่างที่คิด!' },
  { title: '🌟 Shine today', body: 'ส่องแสงบน leaderboard วันนี้กัน!' },
  { title: 'Daily Puzzle', body: 'อีกแค่ไม่กี่ตาก็ครบ streak สัปดาห์แล้ว!' },
  { title: '⚡ Fast fingers', body: 'ใครจะ solve ได้เร็วที่สุดวันนี้? ลองดู!' },
  { title: 'GridNova Daily', body: 'Start your day right — GridNova ก่อนเลย!' },
  { title: '🎯 Daily goal', body: 'Goal วันนี้: เล่นให้จบ รับ coins กลับบ้าน!' },
  { title: 'GridNova Daily', body: 'Puzzle วันนี้ generate มาเพื่อคุณโดยเฉพาะ!' },
  { title: '🏆 Top of the day', body: 'ยังมีเวลาขึ้น top 3 วันนี้นะ — มาเลย!' },
  { title: 'Daily Puzzle', body: 'ไม่มีอะไรดีกว่าการชนะ puzzle ก่อน deadline!' },
  { title: '💪 Strong mind', body: 'สมองแข็งแกร่งขึ้นทุกวันที่คุณเล่น GridNova!' },
  { title: 'GridNova Daily', body: 'คุณ solve ได้ — ผมเชื่อ มาเลย!' },
  { title: '🔥 Don\'t stop now', body: 'หยุดไม่ได้แล้ว streak กำลังมาแรง!' },
  { title: 'Daily Sudoku', body: 'Sudoku = therapy วันนี้มา therapy กัน!' },
  { title: '🎮 Let\'s go!', body: 'Grid รอ, leaderboard รอ, coins รอ — มาเลย!' },
  { title: 'GridNova Daily', body: 'วันนี้ถ้าไม่เล่น พรุ่งนี้จะเสียใจ 😅' },
  { title: '🌅 New day, new puzzle', body: 'Puzzle ใหม่ทุกวัน ความสนุกไม่มีวันซ้ำ!' },
  { title: 'Daily Puzzle', body: 'คนที่เล่นทุกวันคือคนที่เก่งจริง — คุณใช่ไหม?' },
  { title: '⭐ Daily reward', body: 'Coins รอให้คุณมาเก็บอยู่ มาเร็ว!' },
  { title: 'GridNova Daily', body: 'อย่าให้ใครมาบอกว่าคุณข้ามวันนี้นะ!' },
  { title: '🎯 Precision matters', body: 'ลอง 0 mistake วันนี้ดูสิ — ทำได้แน่!' },
  { title: 'Daily Puzzle', body: 'GridNova รอคุณอยู่ เริ่มได้เลย!' },
  { title: '🏅 Hall of fame', body: 'ชื่อคุณควรอยู่บน leaderboard วันนี้!' },
  { title: 'GridNova Daily', body: 'เพียง 5 นาทีก็ทำให้วันดีขึ้นได้!' },
  { title: '💡 Aha moment', body: 'ความรู้สึกตอน solve ได้ไม่มีอะไรเทียบ!' },
  { title: 'GridNova Daily', body: 'วันนี้ lucky number ของคุณคืออะไร? ไปหาใน puzzle!' },
  { title: '🔢 Solve it!', body: 'ทุกเลขมีที่ของมัน คุณจะหาเจอไหม?' },
  { title: 'Daily Puzzle', body: 'Challenge ตัวเองวันละตา ดีกว่า scroll ไปเรื่อยๆ!' },
  { title: '🌟 Everyday hero', body: 'Hero เล่นทุกวัน — วันนี้คิวคุณแล้ว!' },
  { title: 'GridNova Daily', body: 'Puzzle วันนี้ set มาเพื่อทดสอบคุณโดยเฉพาะ!' },
  { title: '🎮 Game on!', body: 'พร้อมแล้วก็มาเลย! GridNova รอคุณอยู่!' },
  { title: 'GridNova Daily', body: 'วันดีๆ เริ่มต้นด้วย puzzle ดีๆ!' },
  { title: '🏆 Climb higher', body: 'Rank คุณยังไปได้อีก มาเล่นวันนี้กัน!' },
  { title: 'Daily Sudoku', body: 'ไม่ต้องรีบ ค่อยๆ คิด แต่อย่าลืมเล่นนะ!' },
  { title: '⚡ Flash challenge', body: 'เปิด GridNova แล้วลุยเลย ไม่ต้องคิดเยอะ!' },
  { title: 'GridNova Daily', body: 'วันนี้มีโอกาสแค่ครั้งเดียว อย่าพลาด!' },
  { title: '💎 Diamond mind', body: 'สมองคมแบบเพชร ฝึกได้ที่ GridNova ทุกวัน!' },
  { title: 'Daily Puzzle', body: 'คนอื่นเขาเก็บ coins กันไปหมดแล้ว คุณล่ะ?' },
  { title: '🔥 Ignite your brain', body: 'จุดไฟสมองด้วย GridNova puzzle วันนี้!' },
];

// ── Messages for guests (no streak/coins/rank references) ──────────────
const GUEST_MESSAGES: { title: string; body: string }[] = [
  { title: 'GridNova Daily', body: 'Puzzle ใหม่มาแล้ว! มาลองดูว่าวันนี้ยากแค่ไหน' },
  { title: '🧠 ลับสมองกัน', body: 'Sudoku วันละตาช่วยให้สมองแล็บดีขึ้นนะ!' },
  { title: '🎯 Daily Puzzle', body: 'ความท้าทายใหม่ของวันนี้มาแล้ว — พร้อมไหม?' },
  { title: 'มาเล่นกัน!', body: 'แค่ไม่กี่นาทีก็จบได้ มาลองดูกัน!' },
  { title: '💡 ฝึกสมองวันนี้', body: 'Puzzle รอคุณอยู่ มาแก้โจทย์กันซักตา!' },
  { title: 'GridNova Daily', body: 'เริ่มวันด้วย Sudoku — ดีกว่า scroll social แน่นอน!' },
  { title: '🎮 Game time!', body: 'หยุดพักจากงานแป๊บนึง มาเล่น GridNova กัน' },
  { title: 'Daily Puzzle', body: 'วันนี้ difficulty อะไรนะ? ไปเช็คกัน!' },
  { title: '⚡ Quick challenge', body: 'Puzzle วันนี้รอให้คุณมาพิชิตอยู่!' },
  { title: '🌅 Good morning!', body: 'เริ่มวันใหม่กับ GridNova — puzzle รอคุณอยู่!' },
  { title: 'GridNova Daily', body: 'ลับสมองด้วย Sudoku วันละตา ทำได้ทุกวัน!' },
  { title: '🔢 Numbers calling', body: 'ตัวเลขกำลังเรียกหาคุณอยู่ มาเลย!' },
  { title: 'Daily Puzzle', body: 'Puzzle ใหม่ทุกวัน ความสนุกไม่มีวันซ้ำ!' },
  { title: '💪 Challenge yourself', body: 'Puzzle วันนี้ท้าให้คุณลองดู!' },
  { title: 'GridNova Daily', body: 'สมัครบัญชีฟรี แล้วบันทึกคะแนนของคุณไว้ได้เลย!' },
  { title: '🌟 Join the community', body: 'คนเล่น GridNova วันนี้มีเยอะมาก มาร่วมด้วยกัน!' },
  { title: 'Daily Puzzle', body: 'คุณ solve ได้ — ผมเชื่อ มาเลย!' },
  { title: '🎯 Solve it!', body: 'ทุกเลขมีที่ของมัน คุณจะหาเจอไหม?' },
  { title: 'GridNova Daily', body: 'Challenge ตัวเองวันละตา ดีกว่า scroll ไปเรื่อยๆ!' },
  { title: '🔥 Brain workout', body: 'Gym สำหรับสมอง — GridNova Daily Puzzle!' },
  { title: 'GridNova Daily', body: 'สมัครฟรี เล่นทุกวัน ติด leaderboard ได้เลย!' },
  { title: '🎮 Let\'s go!', body: 'Puzzle รอ — มาเลย!' },
  { title: 'Daily Sudoku', body: 'Sudoku = therapy วันนี้มา therapy กัน!' },
  { title: '💡 Aha moment', body: 'ความรู้สึกตอน solve ได้ไม่มีอะไรเทียบ!' },
  { title: 'GridNova Daily', body: 'วันนี้มีโอกาสแค่ครั้งเดียว อย่าพลาด!' },
];

// ── Seeded random (deterministic per user per day) ─────────────────────
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 2147483647;
}

function pickMessage(userId: string, date: string, isGuest: boolean) {
  const pool = isGuest ? GUEST_MESSAGES : MEMBER_MESSAGES;
  const seed = `${userId}:${date}`;
  const idx = Math.floor(seededRandom(seed) * pool.length);
  return pool[idx];
}

// ── VAPID JWT builder ──────────────────────────────────────────────────
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

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Encoding': 'aesgcm',
        'TTL': '86400',
      },
      body: new TextEncoder().encode(JSON.stringify(body)),
    });

    if (res.status === 410 || res.status === 404) {
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

  // Join push_tokens with profiles to know guest vs member
  const { data: tokens, error } = await supabase
    .from('push_tokens')
    .select('user_id, token, p256dh, auth, platform, profiles!inner(is_anonymous)')
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
    const isGuest = t.profiles?.is_anonymous === true;
    const msg = pickMessage(t.user_id, today, isGuest);
    const ok = await sendWebPush(t, {
      title: msg.title,
      body: msg.body,
      url: '/',
    });
    if (ok) sent++;
  }));

  return new Response(JSON.stringify({ sent, total: toNotify.length, date: today }));
});
