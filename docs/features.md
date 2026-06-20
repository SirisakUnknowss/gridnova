# Feature Ideas

รวม feature ideas ที่อยากทำ ยังไม่ได้อยู่ใน ROADMAP.md

---

## Daily Challenge Calendar

**แรงบันดาลใจ:** Calendar view แสดงวันที่เล่น daily challenge ในแต่ละเดือน

**UI:**
- Header — trophy image + ชื่อ "Daily Challenges"
- Month nav — `< June 2026 >` + counter ⭐ 12/30
- Calendar grid 7 คอลัมน์
  - วันที่ผ่านมา + เล่นแล้ว → วงสี (completed)
  - วันที่ผ่านมา + ไม่ได้เล่น → เทา (missed)
  - วันนี้ → highlight วงน้ำเงิน
  - อนาคต → เทาจาง (locked)
- ปุ่ม **Play** → เล่น daily วันนี้

**Data ที่มีอยู่แล้ว:**
- `daily_leaderboard` — รู้ว่า user เล่นวันไหน
- `daily_puzzles` — รู้ว่าแต่ละวันมี puzzle

**สิ่งที่ต้องสร้าง:**
- `src/lib/api.ts` — เพิ่ม `getMonthlyCompletions(userId, year, month)`
- `src/ui/views/daily-calendar.ts` — calendar view
- Bottom nav: เพิ่ม tab หรือ entry point จาก home

**ประมาณเวลา:** 3-4 ชม.

---

## Coin Utility — ของที่ซื้อได้และมีประโยชน์จริง

**ปัญหาตอนนี้:** coin สะสมได้ แต่ใช้แล้วไม่รู้สึกว่าคุ้ม ของในร้านส่วนใหญ่เป็น cosmetic

### Consumables ที่มีผลต่อ gameplay จริง

| ไอเทม | ราคา | ผล |
|---|---|---|
| **Hint Pack +3** | 100c | เพิ่ม hint อีก 3 ครั้งสำหรับเกมถัดไป |
| **Streak Freeze** | 200c | กันสาย streak หาย 1 วัน (มีอยู่แล้วใน schema) |
| **Coin Boost 2×** | 500c | coin ที่ได้จากเกมคูณ 2 เป็นเวลา 24 ชม. |
| **Error Shield** | 150c | ป้องกันนับ mistake 1 ครั้ง (ใส่ผิดไม่นับ) |
| **Time Freeze** | 80c | หยุด timer ได้ 60 วินาที (ใช้ระหว่างเล่น) |

### Daily Shop Rotation
- ของ consumable หมุนเวียนทุกวัน 3-4 รายการ
- **Flash sale** บางวัน ลด 50% — สร้าง urgency

### สิ่งที่ต้องสร้าง
- Migration: `consumable_inventory` table (user_id, item_type, quantity)
- Shop UI: tab "Consumables" แยกจาก cosmetic
- Game UI: ปุ่มใช้ consumable ก่อนเริ่มเกม / ระหว่างเกม
- Edge Function: validate + consume item ตอน submit score

**ประมาณเวลา:** 4-6 ชม.

---

## Game Resume — กลับมาเล่นต่อจากที่ค้างไว้

**ปัญหาตอนนี้:** ปิด browser / switch app → เกมหาย ต้องเริ่มใหม่

### แนวทาง: Save State ใน localStorage + sync ขึ้น DB

**ข้อมูลที่ต้อง save:**
- puzzle date / level / stage
- board state ปัจจุบัน (81 ตัวเลข)
- moves history (สำหรับ replay + anti-cheat)
- elapsed time, mistakes, hints used
- timestamp ล่าสุดที่ save

### Flow
1. **Auto-save ทุก move** → `localStorage['gridnova_draft']`
2. **Sync ขึ้น DB** → `user_game_drafts` table ทุก 30 วินาที (debounce)
3. **ตอน boot** → เช็คว่ามี draft ค้างไหม → แสดง banner "Continue your game?"
4. **Submit หรือ abandon** → ลบ draft

### Resume Banner (Home Screen)
```
┌─────────────────────────────────┐
│ 🎮 Continue Medium  •  05:32   │
│ 47 cells filled  [Continue] [✕] │
└─────────────────────────────────┘
```

### สิ่งที่ต้องสร้าง
- `src/lib/draft.ts` — `saveDraft()`, `loadDraft()`, `clearDraft()`
- Migration: `user_game_drafts` table (user_id, mode, puzzle_ref, board_state, moves, elapsed, updated_at)
- Home UI: resume banner ถ้ามี draft
- Game engine: `resumeGame(draft)` โหลด state กลับมา
- Anti-cheat: ส่ง moves ทั้งหมดตั้งแต่ต้นตอน submit (ไม่ใช่แค่ draft)

**ประมาณเวลา:** 4-5 ชม.

---

## Share Cards (v2 — Social)

**เป้าหมาย:** คนอยากแชร์เอง ไม่ใช่แค่มีปุ่มให้กด

### เครื่องมือออกแบบ
- **Figma** — ออกแบบ template ก่อน export spec
- **HTML Canvas / SVG** — render ฝั่ง client (ทำอยู่แล้ว)
- หรือ **Supabase Edge Function + Satori** — render server-side เป็น PNG จริง → Twitter/LINE preview ได้เลยโดยไม่ต้อง screenshot

### ประเภท Share Card

#### 1. Win Result Card (ปรับปรุงจากของเดิม)
- แสดง **percentile** — "Faster than 94% today" น่าอวดกว่า "#3/47"
- **Difficulty badge** — Expert / Hard ให้เด่น
- Pattern grid แบบ Wordle 🟩🟨⬛ แสดง move quality โดยไม่ spoil
- Score + เวลา + streak ปัจจุบัน
- QR code มุมล่าง → gridnova.pages.dev

#### 2. Streak Milestone Card
- trigger อัตโนมัติเมื่อ streak ครบ 7 / 30 / 100 วัน
- เลข streak ใหญ่ + flame 🔥
- "I've played GridNova X days in a row"

#### 3. Profile Card (ชวนเพื่อน)
- avatar + ชื่อ + level + best stats
- **Referral link** พร้อม code — `/invite/:code`
- เพื่อนกดลิ้งค์ → สมัคร → ทั้งคู่ได้ bonus coins (+300c / +200c)

#### 4. Achievement Card
- unlock achievement แล้วแชร์ได้เลย
- badge icon ใหญ่ + ชื่อ + วันที่ unlock

#### 5. Monthly Recap Card
- สรุปเดือน: เล่นกี่วัน, best score, longest streak, total coins
- push notification แจ้งต้นเดือนถัดไป

### Referral System
- `profiles.referral_code` — 6 ตัวอักษร สร้างตอน signup
- `referrals` table — (referrer_id, referee_id, rewarded_at)
- เงื่อนไข: referee ต้องเล่นครบ 3 วันก่อนได้ coin
- URL: `gridnova.pages.dev?ref=ABC123`

### สิ่งที่ต้องสร้าง
- Figma design ก่อน (ทำเองหรือใช้ template)
- `src/lib/share.ts` — `generateCard(type, data)` → canvas blob
- `src/ui/views/share-modal.ts` — เลือก card ที่จะแชร์
- Edge Function `render-og-image` (Satori) — สำหรับ OG preview
- Migration: `referral_code` ใน profiles + `referrals` table
- Edge Function `claim-referral` — validate + grant coins

### ประมาณเวลา
- Share card ปรับปรุง: 3-4 ชม.
- Referral system: 4-6 ชม.
- Server-side OG image: 3-4 ชม.

---
