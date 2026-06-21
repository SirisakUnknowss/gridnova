# Share Cards v2 — Implementation Plan

> เป้าหมาย: ทำให้ user อยากแชร์เอง ไม่ใช่แค่กดปุ่มเพราะมีให้กด

---

## Card Types (5 ประเภท)

| # | ชื่อ | Trigger | ขนาด |
|---|---|---|---|
| A | **Win Result Card** | กด Share หลัง submit score | 1:1 (360×360) |
| B | **Profile / Invite Card** | เมนู Profile | 1:1 (360×360) |
| C | **Streak Milestone Card** | อัตโนมัติเมื่อ streak ครบ 7/30/100 | 9:16 (360×640) |
| D | **Achievement Card** | unlock achievement | 1:1 (360×360) |
| E | **Monthly Recap Card** | ต้นเดือน (push notification) | 9:16 (360×640) |

---

## Card A — Win Result Card (ปรับจากของเดิม)

**ข้อมูลที่แสดง:**
- GridNova logo + difficulty badge (Easy / Medium / Hard / Expert)
- เวลา + score + streak ปัจจุบัน
- Percentile — "Faster than 94% of players today" (น่าอวดกว่า rank)
- Pattern grid แบบ Wordle (5×9 = 45 เซลล์แรก) แสดง move quality ไม่ spoil คำตอบ
  - 🟣 = filled correct on first try
  - 🟡 = hint used
  - ⬛ = conflict/mistake
- QR code มุมล่างขวา → gridnova.pages.dev

**ข้อมูลที่ต้องดึง (มีอยู่แล้ว):**
- `score`, `elapsed_seconds`, `streak_count` จาก `daily_leaderboard`
- percentile คำนวณ: `rank / total_players * 100`

---

## Card B — Profile / Invite Card (ใหม่)

**ข้อมูลที่แสดง:**
- Avatar (custom photo / emoji) + ชื่อ + level badge
- Best score + longest streak + total coins
- Referral link: `gridnova.pages.dev?ref=ABC123`
- QR code → referral URL
- Copy link button

**ข้อมูลที่ต้องดึง:**
- profile จาก `profiles` table
- `referral_code` (ต้องเพิ่ม column ใหม่)

---

## Card C — Streak Milestone Card (ใหม่)

**ข้อมูลที่แสดง:**
- เลข streak ใหญ่ + 🔥 icon
- "X days in a row!" / "ครบ X วัน ไม่เคยพลาด!"
- แสดงเดือนที่เล่น (calendar mini grid)
- Username + avatar

**Trigger:** หลัง submit score ถ้า `streak_count` เป็น 7, 30, 100, 200, 365 → แสดง modal แชร์

---

## Card D — Achievement Card (ใหม่)

**ข้อมูลที่แสดง:**
- Achievement badge icon ใหญ่ (SVG icon)
- Achievement title + description
- วันที่ unlock
- Username

**Trigger:** หลัง unlock achievement

---

## Card E — Monthly Recap Card (ใหม่)

**ข้อมูลที่แสดง:**
- เดือน/ปี
- เล่นกี่วัน จาก 30 วัน
- Best score เดือนนี้
- Longest streak เดือนนี้
- Total coins earned

**Trigger:** Push notification ต้นเดือน → กดเปิด app → แสดง recap card ของเดือนที่ผ่านมา

---

## Architecture

### Rendering: HTML Canvas (client-side)

ใช้ Canvas API render แล้ว export เป็น PNG blob → Web Share API หรือ download

```
src/lib/share/
  index.ts          — generateCard(type, data): Promise<Blob>
  card-win.ts       — renderWinCard(ctx, data)
  card-profile.ts   — renderProfileCard(ctx, data)
  card-streak.ts    — renderStreakCard(ctx, data)
  card-achievement.ts
  card-recap.ts
  helpers.ts        — drawRoundRect, drawQR, loadImage, wrapText
src/ui/views/
  share-modal.ts    — เลือก card type + preview + share/download button
```

### QR Code

ใช้ library `qrcode` (npm) render ลง offscreen canvas แล้ว drawImage ลง main canvas

### OG Preview (optional, server-side)

Supabase Edge Function `render-og-image` ใช้ [Satori](https://github.com/vercel/satori) + resvg-wasm:
- รับ query params: `?type=win&score=9450&rank=3&total=47`
- return PNG
- ใส่ใน `<meta og:image>` ของ share URL
- ทำทีหลัง (ไม่ block launch)

---

## Database Changes

### Migration 1 — referral_code + referrals table

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substring(md5(NEW.id::text) from 1 for 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- backfill existing users
UPDATE profiles SET referral_code = upper(substring(md5(id::text) from 1 for 6))
WHERE referral_code IS NULL;

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  referee_id  UUID NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  rewarded_at TIMESTAMPTZ,
  UNIQUE(referee_id)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can read own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
```

### Migration 2 — handle referral on signup

Landing URL: `gridnova.pages.dev?ref=ABC123`
→ save `ref` ใน `localStorage['gridnova_ref']` ตอน boot
→ หลัง signup ส่ง ref ไป Edge Function `claim-referral`

---

## Edge Functions

### `claim-referral`

```
POST /functions/v1/claim-referral
Body: { ref_code: "ABC123" }
Auth: Bearer <user JWT>
```

Logic:
1. lookup referrer จาก `referral_code`
2. ตรวจว่า referee ยังไม่เคยถูก refer
3. insert `referrals` row
4. เมื่อ referee เล่นครบ 3 วัน (cron หรือ trigger) → grant coins: referrer +300, referee +200

---

## Share Modal UI

```
┌─────────────────────────────────────┐
│  แชร์ผลการเล่น                      │
│                                     │
│  [Win Card] [Profile] [Achievement] │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   [preview ของ card]        │    │
│  └─────────────────────────────┘    │
│                                     │
│  [📤 Share]   [⬇️ Save Image]       │
└─────────────────────────────────────┘
```

Web Share API: `navigator.share({ files: [blob] })` บน mobile
fallback: download PNG

---

## Implementation Order

### Phase 1 — Win Card ปรับปรุง (3-4 ชม.)
- [ ] `src/lib/share/card-win.ts` — canvas render
- [ ] เพิ่ม percentile calculation จาก leaderboard data
- [ ] `src/ui/views/share-modal.ts` — modal พื้นฐาน
- [ ] ทดสอบ Web Share API + download fallback

### Phase 2 — Profile Card + Referral (4-6 ชม.)
- [ ] Migration: `referral_code` column + `referrals` table
- [ ] `src/lib/share/card-profile.ts`
- [ ] Edge Function `claim-referral`
- [ ] Handle `?ref=` param ตอน boot ใน `src/main.ts`
- [ ] QR code ใน card

### Phase 3 — Streak + Achievement Cards (2-3 ชม.)
- [ ] `src/lib/share/card-streak.ts` — trigger modal หลัง milestone
- [ ] `src/lib/share/card-achievement.ts`
- [ ] Integrate กับ achievement unlock flow

### Phase 4 — Monthly Recap (2-3 ชม.)
- [ ] `src/lib/share/card-recap.ts`
- [ ] Query เดือนที่ผ่านมาจาก `daily_leaderboard`
- [ ] Push notification trigger ต้นเดือน

### Phase 5 — OG Image (optional, 3-4 ชม.)
- [ ] Edge Function `render-og-image` (Satori)
- [ ] Share URL: `gridnova.pages.dev/share?type=win&...`
- [ ] `<meta og:image>` dynamic

---

## Dependencies

| Package | ใช้ทำอะไร | ขนาด |
|---|---|---|
| `qrcode` | QR code บน canvas | ~40KB |
| `satori` + `@resvg/resvg-wasm` | OG image (Edge Function เท่านั้น) | server-only |

---

## เวลาทั้งหมด

| Phase | เวลา |
|---|---|
| Win Card ปรับปรุง | 3-4 ชม. |
| Profile Card + Referral | 4-6 ชม. |
| Streak + Achievement Cards | 2-3 ชม. |
| Monthly Recap | 2-3 ชม. |
| OG Image (optional) | 3-4 ชม. |
| **รวม (ไม่รวม OG)** | **~12-16 ชม.** |

---

## ลำดับความสำคัญ

1. **Win Card** — high ROI ทำได้เลย ไม่ต้องเพิ่ม DB
2. **Profile Card + Referral** — growth mechanism หลัก
3. **Streak Card** — emotional moment ที่คนอยากแชร์มากสุด
4. **Achievement Card** — ต่อจาก achievement system
5. **Monthly Recap** — ทำสุดท้าย ต้องมี data สะสมก่อน
