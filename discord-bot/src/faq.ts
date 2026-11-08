// Canned answers for the no-AI mode. Keep in sync with knowledge.md and the game.
// Keywords are matched case-insensitively as substrings for Thai (no word
// spacing) and on word boundaries for Latin text, so "tip" can't match "multiple".

export interface FaqEntry {
  id: string;
  title: { th: string; en: string };
  keywords: string[];
  th: string;
  en: string;
}

export type Lang = "th" | "en";

export const FAQ: FaqEntry[] = [
  {
    id: "hearts",
    title: { th: "หัวใจ / พลังงาน", en: "Hearts (energy)" },
    keywords: ["heart", "hearts", "energy", "หัวใจ", "พลังงาน", "ชีวิต", "infinite", "ไม่จำกัด"],
    th: "❤️ **หัวใจ** มีสูงสุด 5 ดวง เริ่มเล่น Daily / Random / Time Attack / Monthly ใช้ 1 ดวง — **ชนะแล้วได้คืน** เสียจริงเฉพาะตอนแพ้หรือออกกลางคัน\n• สมาชิก: ฟื้น +1 ทุก 30 นาที\n• Guest: ไม่ฟื้นระหว่างวัน รีเซ็ตเต็มตอน 07:00 (เวลาไทย) — สมัครสมาชิกแล้วเติมเต็มทันที\n• หัวใจหมด? เล่น **Practice** หรือ **Book Mode** ได้ฟรีไม่ใช้หัวใจ\n• สมาชิกซื้อ **Infinite Hearts** ด้วยเหรียญได้ (กดที่หัวใจบนหน้า Home): 1 ชม. 800 · 2 ชม. 1,400 · 3 ชม. 1,900 · 5 ชม. 2,800",
    en: "❤️ **Hearts** max out at 5. Starting Daily / Random / Time Attack / Monthly costs 1 — **winning refunds it**, so only a loss or quitting really spends one.\n• Members: +1 every 30 min\n• Guests: no regen, refill at 00:00 UTC — signing up refills instantly\n• Out of hearts? **Practice** and **Book Mode** are always free\n• Members can buy **Infinite Hearts** with coins (tap the hearts pill on Home): 1h 800 · 2h 1,400 · 3h 1,900 · 5h 2,800",
  },
  {
    id: "hints",
    title: { th: "คำใบ้ (Hint)", en: "Hints" },
    keywords: ["hint", "hints", "คำใบ้", "ใบ้", "ฮินท์", "ฮิน"],
    th: "💡 **Hint** ได้ฟรี 3 ครั้งต่อเกมทุกโหมด\n• Practice / Random: เลเวล 20/40/60 ได้ฟรีเพิ่ม +1/+2/+3 และซื้อเพิ่มได้อีก 3 ครั้ง (50 / 75 / 100 เหรียญ)\n• Daily, Time Attack, Book: ได้ 3 ครั้งเท่ากันทุกคน ซื้อเพิ่มไม่ได้ เพื่อให้ leaderboard ยุติธรรม\n• ใช้ hint แล้วคะแนนจะลดลง",
    en: "💡 **Hints**: 3 free per game in every mode.\n• Practice / Random: +1/+2/+3 extra free hints at levels 20/40/60, and up to 3 more for 50 / 75 / 100 coins\n• Daily, Time Attack, Book: fixed at 3 for everyone, no buying — keeps leaderboards fair\n• Hints lower your score",
  },
  {
    id: "continue",
    title: { th: "เล่นต่อหลังผิด 3 ครั้ง", en: "Continue after 3 mistakes" },
    keywords: ["continue", "game over", "เล่นต่อ", "ผิด 3", "ผิดสาม", "แพ้", "ตาย", "เกมโอเวอร์"],
    th: "🔁 ผิดครบ 3 ครั้ง = Game over แต่ซื้อ **Continue** เล่นต่อได้สูงสุด 3 ครั้ง\n• Daily: 2,500 / 4,000 / 10,000 เหรียญ\n• Practice: ราคาตามระดับความยาก (easy เริ่ม 300, expert เริ่ม 2,000)\n• Random / Time Attack / Book ใช้ไม่ได้\n• ความผิดยังนับในคะแนนเหมือนเดิม",
    en: "🔁 3 mistakes = game over, but you can buy up to 3 **Continues**.\n• Daily: 2,500 / 4,000 / 10,000 coins\n• Practice: priced by difficulty (easy from 300, expert from 2,000)\n• Not available in Random / Time Attack / Book\n• Mistakes still count toward your score",
  },
  {
    id: "daily",
    title: { th: "Daily Puzzle", en: "Daily Puzzle" },
    keywords: ["daily", "รายวัน", "ประจำวัน", "โจทย์วันนี้", "puzzle วันนี้", "leaderboard", "อันดับ", "ลีดเดอร์บอร์ด"],
    th: "📅 **Daily Puzzle** — โจทย์เดียวกันทั้งโลก วันละ 1 ครั้ง จัดอันดับตามคะแนน โจทย์ใหม่ทุก **07:00 น. (เวลาไทย)**\nความยาก: จันทร์ easy → อังคาร easy-medium → พุธ medium → พฤหัส medium-hard → ศุกร์ hard → เสาร์ hard-expert → อาทิตย์ expert\nคะแนน: เร็ว ไม่ผิด ไม่ใช้ hint = คะแนนสูง (ไม่ผิดเลย +500, ไม่ใช้ hint +300)",
    en: "📅 **Daily Puzzle** — one puzzle for everyone, once a day, ranked by score. New puzzle at **00:00 UTC**.\nDifficulty: Mon easy → Tue easy-medium → Wed medium → Thu medium-hard → Fri hard → Sat hard-expert → Sun expert\nScore: faster, no mistakes and no hints score highest (+500 flawless, +300 no hints)",
  },
  {
    id: "modes",
    title: { th: "โหมดเกมทั้งหมด", en: "Game modes" },
    keywords: ["mode", "modes", "โหมด", "random", "แรนดอม", "time attack", "ไทม์แอทแทค", "จับเวลา", "book", "บุ๊ค", "practice", "ฝึก"],
    th: "🎮 **โหมดเกม**\n• **Daily** — โจทย์ประจำวัน แข่ง leaderboard\n• **Practice** — เลือกความยากเอง เล่นไม่จำกัด ไม่ใช้หัวใจ\n• **Random** — สุ่มความยาก สะสม win streak (แพ้ครั้งเดียว streak รีเซ็ต) ได้โบนัสทุก 5 ชนะติด\n• **Time Attack** — แข่งกับเวลา: Sprint 3 นาที (easy) · Rush 5 นาที (medium) · Marathon 10 นาที (hard) ต้องมีบัญชี\n• **Book Mode** — ไม่บอกถูกผิดระหว่างเล่น ฟรี\n• **Monthly Challenge** — เล่นครบตามวันรับของรางวัลประจำเดือน",
    en: "🎮 **Game modes**\n• **Daily** — daily puzzle with a leaderboard\n• **Practice** — any difficulty, unlimited, no hearts\n• **Random** — random difficulty, build a win streak (one loss resets it), bonus every 5 wins\n• **Time Attack** — beat the clock: Sprint 3 min (easy) · Rush 5 min (medium) · Marathon 10 min (hard); needs an account\n• **Book Mode** — no right/wrong feedback, free\n• **Monthly Challenge** — complete dates to unlock monthly rewards",
  },
  {
    id: "monthly",
    title: { th: "Monthly Challenge", en: "Monthly Challenge" },
    keywords: ["monthly", "รายเดือน", "ประจำเดือน", "challenge", "ชาเลนจ์", "รางวัลเดือน", "moonlit", "christmas", "คริสต์มาส"],
    th: "🌙 **Monthly Challenge** (ต้องมีบัญชี) — มีโจทย์ medium ให้ทุกวันของเดือน วันที่พลาดย้อนเล่นได้จนจบเดือน\n• เล่นจบแต่ละวันได้ 100 เหรียญ\n• ครบ 5 / 10 / 15 / 20 / 25 / 30 วัน (ไม่ต้องติดกัน) ได้ avatar / frame / theme\n• **กด Claim ก่อนสิ้นเดือน** แล้วใส่ได้ที่ Profile → My Collection",
    en: "🌙 **Monthly Challenge** (account needed) — a medium puzzle for every date of the month; missed dates stay playable until month end.\n• 100 coins per completed date\n• Rewards at 5 / 10 / 15 / 20 / 25 / 30 dates (not necessarily consecutive): avatars, frames, themes\n• **Claim before the month ends**, then equip in Profile → My Collection",
  },
  {
    id: "coins",
    title: { th: "เหรียญ / XP / เลเวล", en: "Coins, XP & levels" },
    keywords: ["coin", "coins", "เหรียญ", "xp", "level", "เลเวล", "เลเวลอัพ", "quest", "เควส", "ภารกิจ", "achievement", "เหรียญรางวัล", "medal"],
    th: "🪙 ได้ **เหรียญ + XP** ทุกครั้งที่เล่นจบ (Daily ได้เยอะสุด 25–100 เหรียญ, ไม่ผิด/ไม่ใช้ hint ได้โบนัส)\nแหล่งอื่น: Daily quests 3 อันต่อวัน, Weekly quests, Monthly Challenge, Medals\nใช้เหรียญซื้อธีม/อวาตาร์/สีกระดาน ใน Shop, ซื้อ hint, continue, Infinite Hearts — XP ใช้เลเวลอัพ (สูงสุด 100)",
    en: "🪙 You earn **coins + XP** for every finished game (Daily gives the most, 25–100 coins, with bonuses for no mistakes / no hints).\nAlso from: 3 daily quests, weekly quests, Monthly Challenge, medals.\nSpend coins on themes/avatars/board colors in the Shop, hints, continues and Infinite Hearts. XP levels you up (max 100).",
  },
  {
    id: "account",
    title: { th: "บัญชี / เซฟข้อมูล", en: "Account & saving progress" },
    keywords: ["account", "login", "log in", "sign in", "sign up", "บัญชี", "สมัคร", "ล็อกอิน", "ล็อคอิน", "เข้าสู่ระบบ", "guest", "เกสต์", "ข้อมูลหาย", "เซฟ", "save", "progress", "เปลี่ยนเครื่อง", "device"],
    th: "👤 เล่นแบบ **Guest** ได้ แต่ข้อมูลอยู่ในเครื่อง/เบราว์เซอร์นั้นเท่านั้น — ล้างข้อมูลเบราว์เซอร์หรือเปลี่ยนเครื่องอาจหาย\n**สมัครสมาชิก** (ที่หน้า Profile) เพื่อเซฟขึ้น cloud เล่นได้ทุกเครื่อง เกมที่เล่นตอนเป็น Guest จะถูกย้ายมาด้วย\nLeaderboard, Time Attack, Monthly Challenge และ Infinite Hearts ต้องมีบัญชี",
    en: "👤 You can play as a **Guest**, but progress lives only in that browser/device — clearing data or switching device can lose it.\n**Create an account** (Profile) to save to the cloud and play anywhere; your guest games carry over.\nLeaderboards, Time Attack, Monthly Challenge and Infinite Hearts need an account.",
  },
  {
    id: "update",
    title: { th: "เกมไม่อัปเดต / ติดตั้งแอป", en: "Updating & installing" },
    keywords: ["update", "อัปเดต", "อัพเดต", "อัพเดท", "เวอร์ชัน", "version", "install", "ติดตั้ง", "ดาวน์โหลด", "download", "แอป", "app", "home screen", "โหลด"],
    th: "📲 **ติดตั้ง:** เปิด https://gridnova.pages.dev ใน Chrome/Safari → เมนู → **Add to Home Screen**\n🔄 **เกมไม่อัปเดต:** ปิดแท็บ/แอป GridNova ให้หมดแล้วเปิดใหม่ เวอร์ชันใหม่จะติดตั้งตอนเปิดครั้งถัดไป",
    en: "📲 **Install:** open https://gridnova.pages.dev in Chrome/Safari → menu → **Add to Home Screen**\n🔄 **Not updating:** close every GridNova tab/app and reopen — the new version installs on the next launch",
  },
  {
    id: "bug",
    title: { th: "แจ้งบั๊ก / ปัญหาบัญชี", en: "Bugs & account problems" },
    keywords: ["bug", "บั๊ก", "บัก", "error", "เออเร่อ", "ค้าง", "เด้ง", "ไม่ได้รับ", "หาย", "refund", "คืนเงิน", "เหรียญหาย", "คะแนนหาย", "ผิดปกติ", "พัง"],
    th: "🐞 ขอโทษที่เจอปัญหานะ แจ้งที่ {bug} ได้เลย พร้อมบอกว่า **ทำอะไรอยู่ · คาดว่าจะเกิดอะไร · เกิดอะไรขึ้นจริง** และแนบ **ภาพหน้าจอ** — ทีมงานจะตรวจสอบให้ (bot ดูหรือแก้ข้อมูลบัญชีไม่ได้)",
    en: "🐞 Sorry about that! Please report it in {bug} with **what you were doing · what you expected · what happened** and a **screenshot** — the team will look into it (the bot can't see or change accounts).",
  },
  {
    id: "upcoming",
    title: { th: "ฟีเจอร์ที่กำลังมา", en: "Upcoming features" },
    keywords: ["season", "ซีซั่น", "star mode", "สตาร์", "แต่งบ้าน", "coming soon", "เร็วๆ นี้", "ฟีเจอร์ใหม่", "new feature", "ios", "android", "play store", "app store"],
    th: "🚀 **Season** และ **Star Mode** (แก้ Sudoku เพื่อตกแต่งบ้าน) ยังอยู่ระหว่างพัฒนา ยังไม่มีวันเปิดตัว ติดตามข่าวได้ที่ห้อง announcements",
    en: "🚀 **Season** and **Star Mode** (solve puzzles to restore a home) are still in development — no release date yet. Watch the announcements channel.",
  },
  {
    id: "rules",
    title: { th: "วิธีเล่น Sudoku", en: "How to play Sudoku" },
    keywords: ["how to play", "rule", "rules", "วิธีเล่น", "กติกา", "เล่นยังไง", "เล่นไง", "note", "โน้ต", "จด", "undo", "เทคนิค", "technique", "tips"],
    th: "🧩 เติมตัวเลข 1–9 ให้ **ทุกแถว ทุกคอลัมน์ และทุกกล่อง 3×3** มีเลขไม่ซ้ำกัน ทุกโจทย์มีคำตอบเดียว ไม่ต้องเดา\nแตะช่อง → แตะตัวเลข · ใช้ **Notes** จดตัวเลขที่เป็นไปได้ · **Undo/Redo/Erase** แก้ไขได้\nเทคนิคเริ่มต้น: หาช่องที่เหลือตัวเลือกเดียว (naked single) และหาเลขที่ลงได้ที่เดียวในแถว/คอลัมน์/กล่อง (hidden single)",
    en: "🧩 Fill digits 1–9 so **every row, column and 3×3 box** has each digit once. Every puzzle has one solution — no guessing.\nTap a cell → tap a number · use **Notes** for candidates · **Undo/Redo/Erase** to fix.\nStarter techniques: naked singles (a cell with one candidate) and hidden singles (a digit with one possible spot in a row/column/box)",
  },
];

const THAI = /[฀-๿]/;
const QUESTION_HINTS = [
  "?", "？", "ไหม", "มั้ย", "หรอ", "เหรอ", "ยังไง", "อย่างไร", "ทำไม", "อะไร", "เท่าไร", "เท่าไหร่", "เมื่อไร", "เมื่อไหร่", "ตรงไหน", "ที่ไหน", "ได้ไง", "ช่วย", "สงสัย", "ถาม",
];
const EN_QUESTION_WORDS = /\b(how|what|why|when|where|which|anyone|help)\b/i;

export function detectLang(text: string): Lang {
  return THAI.test(text) ? "th" : "en";
}

export function looksLikeQuestion(text: string): boolean {
  const t = text.toLowerCase();
  return QUESTION_HINTS.some((q) => t.includes(q)) || EN_QUESTION_WORDS.test(t);
}

function keywordHits(text: string, keyword: string): boolean {
  if (THAI.test(keyword)) return text.includes(keyword);
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i").test(text);
}

/** Best-matching entry; null when nothing matches. Hits are weighted by keyword
 *  length so a specific phrase ("star mode") beats a generic word ("mode"). */
export function matchFaq(text: string): FaqEntry | null {
  const t = text.toLowerCase();
  let best: FaqEntry | null = null;
  let bestScore = 0;
  for (const entry of FAQ) {
    const score = entry.keywords.filter((k) => keywordHits(t, k)).reduce((sum, k) => sum + k.length, 0);
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return best;
}

export function isMenuRequest(text: string): boolean {
  return /^(!faq|!help|faq|help|menu|เมนู|หัวข้อ|ช่วยด้วย)$/i.test(text.trim());
}

export function menuText(lang: Lang): string {
  const list = FAQ.map((e) => `• ${e.title[lang]}`).join("\n");
  return lang === "th"
    ? `📖 **หัวข้อที่ตอบได้** — พิมพ์ถามเรื่องที่สนใจได้เลย เช่น "หัวใจหมดทำไง"\n${list}`
    : `📖 **Topics I can answer** — just ask, e.g. "how do hearts work?"\n${list}`;
}

export function fallbackText(lang: Lang, bugMention: string): string {
  return lang === "th"
    ? `🤔 ขอโทษนะ คำถามนี้ bot ยังตอบไม่ได้ — บันทึกไว้ให้ทีมงานแล้ว ทีมงานจะมาตอบในห้องนี้ ถ้าเป็นบั๊กแจ้งที่ ${bugMention} ได้เลย\nพิมพ์ \`faq\` เพื่อดูหัวข้อที่ bot ตอบได้`
    : `🤔 Sorry, I can't answer that one yet — I've logged it for the team, and someone will reply here. For bugs, please use ${bugMention}.\nType \`faq\` to see the topics I can answer.`;
}

export function answerFaq(entry: FaqEntry, lang: Lang, bugMention: string): string {
  return entry[lang].replaceAll("{bug}", bugMention);
}
