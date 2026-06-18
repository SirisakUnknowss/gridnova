# Gridnova Roadmap

> อัปเดตล่าสุด: 2026-06-18 · Production: [gridnova.pages.dev](https://gridnova.pages.dev)

---

## ภาพรวม

| Version | เป้าหมาย | กำหนด | สถานะ |
|---|---|---|---|
| **v1.0** | MVP — Daily puzzle, leaderboard, auth, shop, XP/level | — | ✅ LIVE |
| **v1.1** | Quick wins: heart icons, numpad dim, push notifications, admin actions | July 2026 | ✅ LIVE |
| **v1.2** | Monetization via RevenueCat (Web + Android + iOS) | Sep 2026 | 🔨 In progress |
| **v1.3** | Weekly Tournament, Streak Recovery | Oct 2026 | 🔜 |
| **v1.4** | Public profile, Share OG card | Nov 2026 | 🔜 |
| **v1.5** | Async challenge a friend, Spectator link | Dec 2026 | 🔜 |
| **v2.0** | Real-time multiplayer, Tier Ranking | Q2 2027 | 🔜 |

---

## v1.2 — Monetization via RevenueCat

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

---

## v1.3 — Weekly Tournament & Streak Recovery

**Goal:** เพิ่ม long-term engagement + reduce churn จาก streak break

### Weekly Tournament
- [ ] Tournament table ใน DB (`weekly_tournaments`, `tournament_entries`)
- [ ] Edge Function คำนวณ ranking รายสัปดาห์
- [ ] รางวัลพิเศษ: exclusive avatar item + coins
- [ ] UI: Tournament tab ใน Leaderboard screen
- [ ] Countdown timer ถึงสิ้นสัปดาห์

### Streak Recovery
- [ ] Streak Freeze item ใน shop (200c)
- [ ] Auto-consume เมื่อ miss วัน
- [ ] Recovery grace period (24h หลัง miss)
- [ ] UI แสดง freeze count ใน profile + home

---

## v1.4 — Public Profile & Share OG Card

**Goal:** viral loop จาก social sharing

### Public Profile
- [ ] Route `/u/:username` — public-facing profile page
- [ ] แสดง stats สาธารณะ: streak, rank, achievements
- [ ] Privacy setting: public / friends only / private

### Share OG Card
- [ ] Edge Function generate OG image (SVG → PNG) per game result
- [ ] Meta tags dynamic บน share URL
- [ ] Share button ใน win modal → copy link / native share
- [ ] Wordle-style text share (ไม่ spoil solution)

---

## v1.5 — Async Challenge & Spectator

**Goal:** social layer ที่ไม่ต้อง real-time

### Async Challenge
- [ ] ส่ง challenge link ให้เพื่อน (same puzzle, compare results)
- [ ] Challenge table ใน DB
- [ ] Result comparison screen
- [ ] Notification เมื่อเพื่อน accept + complete

### Spectator Link
- [ ] Live replay ของ game ที่เล่นเสร็จแล้ว (move-by-move)
- [ ] Share link → `/replay/:gameId`

---

## v2.0 — Real-time Multiplayer & Tier Ranking

**Goal:** competitive core ที่ทำให้ game sticky ระยะยาว

### Real-time Multiplayer
- [ ] Room system (2–4 players, same puzzle)
- [ ] Supabase Realtime channels สำหรับ sync state
- [ ] Spectator mode ใน live match
- [ ] Match history

### Tier Ranking System
- [ ] ELO-style rating หรือ tier (Bronze → Silver → Gold → Diamond → Master)
- [ ] Season-based reset (ทุก 3 เดือน)
- [ ] Tier badge ใน profile + leaderboard
- [ ] Season reward เมื่อจบ season

---

## Infrastructure & Risks

| Risk | Mitigation |
|---|---|
| Supabase cost เกิน free tier | Monitor · upgrade เมื่อ DAU > 500 |
| RevenueCat setup ล่าช้า | Paywall stub พร้อมแล้ว ไม่บล็อก launch |
| App Store review reject | Follow HIG + Privacy manifest ก่อน submit |
| Multiplayer latency สูง | ใช้ Supabase Realtime + optimistic UI |
| Real-time infra cost | เปิดเฉพาะ match ที่ active, ปิดทันทีที่จบ |
