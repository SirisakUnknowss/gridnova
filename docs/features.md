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
