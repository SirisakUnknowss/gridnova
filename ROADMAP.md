# Gridnova Roadmap

> อัปเดตล่าสุด: **2026-08-23** (ข้อมูล production ณ 15:20 ICT) · เวอร์ชันปัจจุบัน **1.8.2** (deploy ล่าสุด 2026-07-27)
> Production: [gridnova.pages.dev](https://gridnova.pages.dev) · กำลังคน: **1 คน**
> อัปเดตก่อนหน้า: 2026-06-18 (แผนแบบ version-based — ยังเก็บไว้ด้านล่าง [ตั้งแต่หัวข้อ v1.2](#v12--monetization-via-revenuecat))

เอกสารนี้เป็น dev-facing (เหมือน `CHANGELOG.md`) ไม่ใช่ข้อความในแอป — ข้อความในแอปยังต้องเป็นภาษาอังกฤษทั้งหมดตาม `CLAUDE.md` ข้อ 8

---

## สถานการณ์ ณ 23 ส.ค. 2026 — ทำไมลำดับความสำคัญเปลี่ยน

วันที่ 22–23 ส.ค. มีทราฟฟิกเข้ามาแบบที่ไม่เคยเกิดขึ้นมาก่อน โดยที่ **ไม่ได้ deploy อะไรเลยมา 4 สัปดาห์**
แปลว่าคนมาจากข้างนอก ไม่ได้มาจากตัวโปรดักต์

| | 16–21 ส.ค. | 22 ส.ค. | 23 ส.ค. |
|---|---|---|---|
| Visitor sessions | ~10/วัน | 336 | **1,378** |
| Engaged sessions | ~2/วัน | 140 | 530 |
| สมัครสมาชิกใหม่ | 0 | 4 | **43** |

### Funnel ของวันที่ 23 ส.ค.

```
1,378 sessions
   ↓ 59%
  816 เปิดหน้า Daily
   ↓ ~11%
  ~90 เล่นจบ
   ↓
   43 สมัครสมาชิก  (3% ของ sessions ทั้งหมด)
```

**ประเด็นหลักไม่ใช่ "ได้สมาชิกใหม่ 43 คน" แต่คือ "มีคนเข้ามา 1,378 คน แล้วหายไป 89% ตั้งแต่ยังเล่นไม่จบด่านแรก"**

สองข้อเท็จจริงที่ทำให้แย่กว่าเดิม:

1. **ไม่รู้ว่าคนมาจากไหน** — `visitor_sessions` ไม่มีคอลัมน์ referrer/UTM และในโค้ด `src/` ไม่มีที่ไหนอ่าน `document.referrer` หรือ `utm_*` เลย
   วันที่ทราฟฟิกสูงที่สุดในประวัติโปรเจกต์ กลับเป็นวันที่หา attribution ไม่ได้
2. **คนใหม่เจอโจทย์ยากที่สุดของรอบพอดี** — Daily หมุนความยากตายตัวรอบ 7 วัน (easy → … → expert)
   22 ส.ค. = `hard-expert`, 23 ส.ค. = `expert` · เวลาเฉลี่ยที่เล่นจบวันนี้ = **21 นาที**

> **24 ส.ค. = `easy`, 25 ส.ค. = `easy-medium`** → ได้ natural experiment ฟรี ไม่ต้องสร้างอะไรเลย

---

## NOW — สัปดาห์นี้

| # | งาน | เหตุผล | แรง | สถานะ |
|---|---|---|---|---|
| 1 | **เก็บ referrer + UTM** ลง `visitor_sessions` | ทำซ้ำ spike ที่หาที่มาไม่ได้ ไม่ได้ · เพิ่ม 1 คอลัมน์ + capture ตอนสร้าง session + กราฟใน admin · ทุกชั่วโมงที่ผ่านไปคือข้อมูลที่หายถาวร | ~2 ชม. | ✅ **เสร็จ 23 ส.ค.** — เก็บ referrer, UTM, click id (fbclid/gclid/ttclid) และ in-app browser hint (LINE/FB) เพราะ referrer ถูก strip เป็นปกติ |
| 2 | **แก้บันไดความยากของ Daily** | 816 เริ่ม → ~90 จบ ในวัน expert · ปรับสัดส่วนรอบให้เอียงไปทาง easy/medium หรือแยกทาง: โจทย์กลางยังอันเดียวเหมือนเดิม แต่คนเข้าครั้งแรกเลือกระดับที่เบากว่าได้ | ~1 วัน | 🔜 |
| 3 | **วัดผลวัน easy (24 ส.ค.) ก่อนลงมือสร้างอย่างอื่น** | ถ้า start→finish กระโดดจาก 11% เป็น 40%+ = ยืนยันว่าปัญหาคือความยาก และข้อ 2 คือคำตอบทั้งหมด · ถ้าไม่ขยับ = ปัญหาอยู่ที่อื่น และข้อ 2 คิดผิด | ~1 ชม. | 🔜 |
| 4 | **ให้รางวัลตอน guest → account** | `migrate_guest_scores` ก๊อป history มาเฉยๆ ไม่ให้ XP / coin / streak / อันดับ · วันนี้มี 12 คนสมัครเสร็จแล้วได้ level 1 + 100 coin ทั้งที่เพิ่งเล่น expert จบ — นี่คือจังหวะที่เรากำลังขอให้เขา commit พอดี | ~4 ชม. | 🔜 |

**ทำไมเรียงแบบนี้:** ข้อ 1 กับ 3 เป็นงาน "วัดผล" ที่มีวันหมดอายุ — โจทย์ easy วันพรุ่งนี้มาแน่นอนไม่ว่าเราจะพร้อมหรือไม่
ส่วนข้อ 2 กับ 4 คือของถูกและคุ้มที่สุด และทั้งคู่ยิงไปที่จุดเดียวกันใน funnel

---

## NEXT — 2–6 สัปดาห์

| งาน | เหตุผล | เริ่มเมื่อ |
|---|---|---|
| **วัด retention D1 / D7** | เพิ่งจะมี cohort ที่ใหญ่พอให้วัดได้เป็นครั้งแรก · ตอนนี้ยังตอบไม่ได้เลยว่า "43 คนของวันนี้กลับมาไหม" | หลังข้อ 1 |
| **เปิดใช้ push จริง** | `push_tokens` มี **0 แถว** — cron `send-push-reminders` วิ่งใส่ตารางเปล่ามาตลอด · ช่องทาง retention ที่โค้ดเขียนเสร็จแล้วแต่ตายสนิท | หลังมี baseline D1 |
| **ปลุก referral loop** | `referrals` มี **0 แถว ตั้งแต่เปิดมา** ทั้งที่มี `referral_code` และการ์ดเชิญเพื่อนอยู่แล้ว | หลังข้อ 1 บอกว่าคนแชร์อะไรจริง |
| **ทำ coin sink** | 23 ส.ค.: coin เข้า 118,084 / ออก 2,500 — `achievement_unlock` 418 ครั้ง (108,010 coin) เทียบกับการซื้อ 1 ครั้ง · คนใหม่รวยภายใน 20 นาที ของในร้าน 39 ชิ้นเลยไม่มีความหมาย | หลังวัด retention ได้ |
| **เก็บ feedback** | ทั้งระบบมี feedback แค่ **4 อัน** · วันนี้คนเข้า 1,378 sessions แล้วเราไม่ได้เรียนรู้อะไรเลย | เมื่อไหร่ก็ได้ |

---

## เสียงจากผู้เล่น (ยังไม่ได้ทำ)

รับมาโดยตรง ไม่ผ่านระบบ feedback ในแอป

### ตัวเลขโจทย์ตั้งต้นควรหนา/เข้มกว่านี้ — *25 ส.ค. 2026*

> "อยากให้ชุดตัวเลขตั้งต้นตัวหนาหรือเข้มกว่านี้ค่ะ จะได้มองสะดวก"

**ตรวจแล้วว่าเป็นเรื่องจริง ไม่ใช่แค่ความชอบส่วนตัว** — `main.css:591` `.cell.given` ตั้ง
`font-weight: 400` และ `color: var(--cell-text)` ซึ่ง**เหมือนกับ `.cell.user` ทุกอย่าง**
เลขโจทย์กับเลขที่ผู้เล่นกรอกเองจึงแยกกันด้วย**สีพื้นหลังอย่างเดียว** (`--cell-bg-given`)
ไม่ได้ต่างกันที่ตัวอักษรเลย บนจอมือถือกลางแดดหรือธีมที่คอนทราสต์ต่ำจะแยกยากมาก

แนวทางแก้: เพิ่ม `font-weight` ของ `.cell.given` (600–700) และ/หรือเพิ่มตัวแปรธีม
`--cell-text-given` แยกออกมา — ตอนนี้ยังไม่มีตัวแปรนี้ มีแต่ `--cell-bg-given`

⚠️ ต้องไล่เช็กทั้ง 11 ธีม (`src/lib/themes.ts`) ไม่ใช่แค่ `theme_classic` — ธีมมืดอย่าง
`theme_dark` / `theme_neon` "เข้มกว่า" อาจกลายเป็นอ่านยากลง ต้องดูทีละธีม

---

## สิ่งที่ "ถอดออก" จากคิว

Roadmap เป็น zero-sum และเรามีคนเดียว

**Season / Weekly Tournament (v1.3) พักไว้ก่อน** — เป็นข้อที่น่าทำที่สุดในลิสต์ (แท็บ Season ใน bottom nav ก็ขึ้น "coming soon" รออยู่แล้ว)
และมันคือสิ่งที่ **ไม่ควรทำตอนนี้** · season pass / tournament เป็นกลไก retention สำหรับคนที่กลับมาเล่นซ้ำ
แต่เรายังไม่มีหลักฐานเลยว่ามีใครกลับมา และ 23 ส.ค. เพิ่งพิสูจน์ว่า ~89% ของคนที่เข้ามาเล่นไม่จบแม้แต่ด่านเดียว
การทำ Season ตอนนี้คือการลงแรงหลายสัปดาห์เพื่อทำให้ประสบการณ์ "ลึกขึ้น" ในจุดที่คนส่วนใหญ่เดินไปไม่ถึง

เหตุผลเดียวกันกับ Time Attack, Challenge mode และ v2.0 — **แก้ 5 นาทีแรกให้ได้ก่อน**

**v1.2 (Monetization) ต้องทบทวนกำหนดเวลา** — แผนเดิมตั้งไว้ Sep 2026 แต่ตอนนี้ยังวัด retention ไม่ได้
และเศรษฐกิจ coin ยังเฟ้ออยู่ 47:1 การเปิดขายของบนฐานแบบนี้จะอ่านผลไม่ออกว่าอะไรได้ผลหรือไม่ได้ผล

---

## แผนระยะยาว (จากอัปเดต 2026-06-18)

> ⚠️ ส่วนด้านล่างนี้เขียนไว้ตั้งแต่ 18 มิ.ย. **กำหนดเวลาทั้งหมดยังไม่ได้ปรับตามข้อมูล 23 ส.ค.**
> อ่านคู่กับหัวข้อ NOW / NEXT ด้านบน ซึ่งมาก่อนเสมอ

| Version | เป้าหมาย | กำหนด (เดิม) | สถานะ |
|---|---|---|---|
| **v1.0** | MVP — Daily puzzle, leaderboard, auth, shop, XP/level | — | ✅ LIVE |
| **v1.1** | Quick wins: heart icons, numpad dim, push notifications, admin actions | July 2026 | ✅ LIVE |
| **v1.2** | Monetization via RevenueCat (Web + Android + iOS) | Sep 2026 | 🔨 ทบทวนกำหนด |
| **v1.3** | Weekly Tournament, Streak Recovery | Oct 2026 | ⏸️ พักไว้ (ดูหัวข้อด้านบน) |
| **v1.4** | Public profile, Share OG card | Nov 2026 | 🔜 (share บางส่วนขึ้นแล้วใน 1.8.0) |
| **v1.5** | Async challenge a friend, Spectator link | Dec 2026 | 🔜 |
| **v2.0** | Real-time multiplayer, Tier Ranking | Q2 2027 | 🔜 |

### v1.2 — Monetization via RevenueCat

**Goal:** เปิด revenue stream จริงบน Web + Android + iOS

> ⚠️ ต้องสร้าง account ที่ [app.revenuecat.com](https://app.revenuecat.com) ก่อน แล้วใส่ `VITE_RC_API_KEY` ใน `.env` + GitHub Secrets

- [ ] สร้าง RevenueCat project + product IDs
- [ ] เพิ่ม `VITE_RC_API_KEY` ใน environment
- [ ] Paywall screen แสดง offerings จริง (ตอนนี้ stub อยู่)
- [ ] Premium badge ใน profile (logic พร้อมแล้ว)
- [ ] Premium-gated items ใน shop
- [ ] Restore purchase flow
- [ ] Submit Play Store + App Store via Capacitor

**Pricing idea:** $2.99/เดือน หรือ $19.99/ปี → no ads + premium themes + cloud save priority

### v1.3 — Weekly Tournament & Streak Recovery

**Goal:** เพิ่ม long-term engagement + reduce churn จาก streak break

#### Weekly Tournament
- [ ] Tournament table ใน DB (`weekly_tournaments`, `tournament_entries`)
- [ ] Edge Function คำนวณ ranking รายสัปดาห์
- [ ] รางวัลพิเศษ: exclusive avatar item + coins
- [ ] UI: Tournament tab ใน Leaderboard screen
- [ ] Countdown timer ถึงสิ้นสัปดาห์

> หมายเหตุ: **Weekly quests** ขึ้นไปแล้ว (`user_weekly_quests`, `claim-weekly-quest-reward`) — คนละอย่างกับ Weekly Tournament

#### Streak Recovery
- [x] Streak Freeze item ใน shop (200c) — `item_streak_freeze` มีขายจริงแล้ว
- [ ] Auto-consume เมื่อ miss วัน
- [ ] Recovery grace period (24h หลัง miss)
- [ ] UI แสดง freeze count ใน profile + home

### v1.4 — Public Profile & Share OG Card

**Goal:** viral loop จาก social sharing

#### Public Profile
- [ ] Route `/u/:username` — public-facing profile page
- [ ] แสดง stats สาธารณะ: streak, rank, achievements
- [ ] Privacy setting: public / friends only / private

#### Share OG Card
- [ ] Edge Function generate OG image (SVG → PNG) per game result
- [ ] Meta tags dynamic บน share URL
- [ ] Share button ใน win modal → copy link / native share
- [x] Wordle-style text share (ไม่ spoil solution) — ขึ้นแล้วใน 1.8.0

### v1.5 — Async Challenge & Spectator

**Goal:** social layer ที่ไม่ต้อง real-time

#### Async Challenge
- [ ] ส่ง challenge link ให้เพื่อน (same puzzle, compare results)
- [ ] Challenge table ใน DB
- [ ] Result comparison screen
- [ ] Notification เมื่อเพื่อน accept + complete

#### Spectator Link
- [ ] Live replay ของ game ที่เล่นเสร็จแล้ว (move-by-move)
- [ ] Share link → `/replay/:gameId`

### v2.0 — Real-time Multiplayer & Tier Ranking

**Goal:** competitive core ที่ทำให้ game sticky ระยะยาว

#### Real-time Multiplayer
- [ ] Room system (2–4 players, same puzzle)
- [ ] Supabase Realtime channels สำหรับ sync state
- [ ] Spectator mode ใน live match
- [ ] Match history

#### Tier Ranking System
- [ ] ELO-style rating หรือ tier (Bronze → Silver → Gold → Diamond → Master)
- [ ] Season-based reset (ทุก 3 เดือน)
- [ ] Tier badge ใน profile + leaderboard
- [ ] Season reward เมื่อจบ season

---

## Infrastructure & Risks

| Risk | Mitigation |
|---|---|
| **ทราฟฟิกอาจไม่กลับมาอีก** | spike ที่หาที่มาไม่ได้ ส่วนใหญ่ไม่เกิดซ้ำ — นี่คือเหตุผลที่ NOW ข้อ 1 อยู่อันดับหนึ่ง |
| **staging ใช้ DB ร่วมกับ production** | ติดโควตา Supabase free tier (ดู `CLAUDE.md`) · เคยไม่มีพิษภัยตอนมีผู้เล่นวันละ 2 คน แต่ตอนนี้มีคนใช้จริงแล้ว — การ seed หรือทดสอบที่เขียนข้อมูลจะโดนของจริง |
| **`submit-daily-score` ขึ้น 403** 3 ครั้ง จาก 2 คน (23 ส.ค.) | edge log เก็บแค่ status ไม่เก็บ reject code เลยแยกไม่ออกว่าโกงจริงหรือเป็น `TIME_MISMATCH` หลอกตอนสลับแท็บบนมือถือ — เพิ่ม log บรรทัดเดียวก็จบ |
| **NOW ข้อ 2 ขัดกับดีไซน์ leaderboard** | leaderboard ของ Daily ต้องใช้โจทย์เดียวกันทุกคน ถ้าทำ adaptive จะเทียบคะแนนไม่ได้ → ทางที่ปลอดภัยคือ **ปรับสัดส่วนของรอบ ไม่ใช่ personalize รายคน** |
| Supabase cost เกิน free tier | Monitor · upgrade เมื่อ DAU > 500 |
| RevenueCat setup ล่าช้า | Paywall stub พร้อมแล้ว ไม่บล็อก launch |
| App Store review reject | Follow HIG + Privacy manifest ก่อน submit |
| Multiplayer latency สูง | ใช้ Supabase Realtime + optimistic UI |
| Real-time infra cost | เปิดเฉพาะ match ที่ active, ปิดทันทีที่จบ |

---

## ที่มาของตัวเลข

ตัวเลขในหัวข้อ "สถานการณ์ ณ 23 ส.ค." query จาก Supabase production (`sudoku-daily` / `sqjllqilozhxbzvfjhra`) เมื่อ 2026-08-23 15:20 ICT
วันถูกตัดตามเขต **Asia/Bangkok** (ไม่ใช่ UTC) — วันที่ 23 ส.ค. ยังไม่จบตอนที่เก็บตัวเลข

ตารางที่ใช้: `visitor_sessions`, `session_views`, `guest_game_history`, `user_game_history`,
`daily_leaderboard`, `daily_puzzles`, `coin_transactions`, `profiles`, `user_progression`,
`user_wallet`, `push_tokens`, `referrals`, `feedbacks`
