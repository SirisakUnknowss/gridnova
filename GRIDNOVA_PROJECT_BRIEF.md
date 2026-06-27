# GridNova — Project Brief

**ประเภท:** Sudoku PWA (Progressive Web App)  
**URL:** https://gridnova.pages.dev  
**Stack:** Vite + TypeScript (vanilla, ไม่มี framework), Supabase (PostgreSQL + Edge Functions + Auth), Cloudflare Pages, VitePWA (Workbox)

---

## Frontend Structure

```
src/
├── main.ts              — app entry, auth, routing, heartbeat, SW update
├── sw.ts                — service worker (Workbox + push notifications)
├── engine/              — puzzle generator, solver, validator, scoring, quests
├── lib/
│   ├── api.ts           — Supabase API wrappers (REST + Edge Functions)
│   ├── local-db.ts      — IndexedDB (idb) สำหรับ save/resume game
│   ├── store.ts         — Zustand global state (user, coins, xp, level, streak, equipped)
│   ├── sound.ts         — SFX
│   ├── themes/backgrounds/board-colors — cosmetic items
│   └── share/           — Canvas share cards (win, profile, invite, recap)
├── state/
│   ├── store.ts         — AppState: user, coins, xp, level, currentStreak, longestStreak, equipped, inventory
│   └── visitor-store.ts — online/today visitor counts
└── ui/
    ├── views/           — game, home, shop, stats, achievements, profile, auth-modal, share-modal
    └── components/      — board, numpad, bottom-nav
```

---

## Game Modes

- **Daily** — puzzle เดียวต่อวัน, global leaderboard, ไม่มี coin hints, บันทึก score + submit ไป Supabase
- **Practice** — เลือก difficulty (easy/medium/medium-hard/hard/expert), มี stages, ซื้อ hint ด้วย coins ได้

---

## Hint System

- ฟรี 3 ครั้ง/เกม (ทุกโหมด)
- Practice เพิ่มเติม: ซื้อได้อีก 3 ครั้ง ราคา 50 / 75 / 100 coins (มี popup ยืนยัน)
- Daily: hint หมดแล้วจบ ซื้อไม่ได้

---

## Economy (Coins & XP)

- ได้ coins/XP จากจบเกม daily/practice, daily quests, achievements, referral
- ใช้ coins ซื้อ: themes, backgrounds, board colors, board icons, hint ระหว่างเกม
- Level system: XP สะสม → level up → แสดง level-up screen
- `user_wallet` table, `spend_coins` RPC (ตรวจ balance ก่อนหัก)
- `coin_transactions` table บันทึก log ทุก transaction

---

## Daily Quests (reset ทุกวัน, quests เดิมทุกวัน)

| Quest ID | เงื่อนไข |
|---|---|
| `play_daily` | เล่น daily puzzle |
| `no_mistakes` | จบ daily โดยไม่ผิด |
| `no_hints` | จบ daily โดยไม่ใช้ hint |
| `fast_finish` | จบ daily ภายใน 5 นาที |
| `practice_streak` | เล่น practice 3 เกมในวันเดียว |

---

## Supabase Edge Functions

| Function | หน้าที่ |
|---|---|
| `submit-daily-score` | บันทึกผล daily + อัพเดต quests + XP/coins |
| `submit-practice-score` | บันทึกผล practice + อัพเดต practice_streak quest |
| `claim-quest-reward` | รับรางวัล quest (coins + XP) |
| `claim-referral` | ใช้ referral code รับรางวัล |
| `purchase-item` | ซื้อ item จาก shop |
| `equip-item` | เปลี่ยน theme/background/board color/avatar |
| `generate-daily-puzzle` | สร้าง puzzle ประจำวัน (cron) |
| `send-push-reminders` | ส่ง push notification เตือนเล่นประจำวัน |

---

## Database Tables (สำคัญ)

| Table | หน้าที่ |
|---|---|
| `profiles` | display_name, username, avatar_url, country, referral_code |
| `user_wallet` | coins balance |
| `user_progression` | xp, level, current_streak, longest_streak |
| `user_game_history` | ประวัติเกม (mode, level, time, mistakes, hints, score, completed_at) |
| `user_daily_quests` | progress + claimed_at ต่อ date+quest_id |
| `daily_puzzles` | puzzle + solution เก็บ encrypted |
| `daily_leaderboard` | rank ประจำวัน |
| `shop_items` | items ขายใน shop (category: theme/background/board_color/icon) |
| `user_inventory` | ของที่มีในครอบครอง |
| `user_equipped` | ของที่ใส่อยู่ในปัจจุบัน |
| `achievements_definitions` | นิยาม badge ทั้งหมด |
| `user_achievements` | progress + unlocked_at ของ user |
| `online_sessions` | heartbeat ทุก 30s เพื่อนับคนออนไลน์ |
| `visitor_sessions` | นับ unique visitors ต่อวัน |
| `coin_transactions` | log การใช้/ได้ coins ทุก transaction |

---

## Save/Resume Game

- บันทึกลง IndexedDB (`idb`) ทุก 30 วินาที + ตอนเปิด menu
- เก็บ: board state, notes, hint cells, elapsed time, mistakes, moves
- home screen แสดง "Continue" banner ถ้ามี game ค้างไว้

---

## PWA

- Add to Home Screen, offline support (Workbox precache)
- Auto-reload เมื่อ SW ใหม่ activate (`controllerchange` event)
- `reg.update()` ทุกครั้งที่ tab กลับมา active

---

## Global State (Zustand — AppState)

```typescript
{
  user: User | null
  profile: { username, display_name, avatar_url, country, bio }
  coins: number
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  equipped: { theme_id, background_id, board_color_id, avatar }
  inventory: string[]   // item ids
  currentView: 'loading' | 'login' | 'home' | 'game' | 'leaderboard' | 'shop' | 'profile' | 'settings' | 'stages'
}
```

---

## Supabase Project

- **Project ID:** `sqjllqilozhxbzvfjhra`
- **Auth:** Email/Password + Google OAuth
- **RLS:** เปิดทุก table, guest (anon role) เข้าถึง online_sessions, visitor_sessions, guest_game_history ได้
