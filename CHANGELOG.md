# Changelog

## 1.7.0 — 2026-07-24

### Added
- **SEO**: meta description, OG/Twitter card tags, JSON-LD structured data, `robots.txt`, `sitemap.xml` — เว็บไม่มี SEO surface มาก่อนเลย (title เปล่าๆ ไม่มี description/social preview)
- **Profile**: เพิ่ม dropdown เลือกประเทศ (ไทยขึ้นก่อน) บันทึกทันทีตอนเลือก

### Fixed
- **Achievements**: "Globetrotter" (ตั้งค่าประเทศ) เข้าไม่ถึงมาตลอดเพราะไม่มี UI ให้ตั้งค่าเลย — แก้แล้วด้วย dropdown ด้านบน
- **Achievements**: ซ่อน "Theme Collector" กับ "Shopaholic" ออกจากหน้า Medals ชั่วคราว เพราะต้องซื้อของในร้านค้าซึ่งยังไม่ได้เปิดใช้งาน (shop.ts มีอยู่ในโค้ดแต่ไม่ได้ผูกเข้า navigation เลย) — column `hidden` มีอยู่แล้วใน DB แต่ client ไม่เคยกรองตามนี้มาก่อน แก้ให้ respect แล้ว

## 1.6.0 — 2026-07-19

### Added
- **Weekly Quests**: ระบบเควสรายสัปดาห์ใหม่ทั้งหมด (DB table, RPC seed/recompute, edge function `claim-weekly-quest-reward`) รีเซ็ตทุกวันจันทร์ 00:00 UTC
- **Continue**: ซื้อต่อชีวิตด้วยเหรียญหลังพลาดครบ 3 ครั้ง ใช้ได้ทั้ง Daily และ Practice (ปิดใน Random Mode ตามดีไซน์ของโหมด)
- หน้า Quests ใหม่ รวม Daily + Weekly เข้าด้วยกัน สลับดูด้วย tab แทนการ์ดแยกที่เคยเรียงต่อกันยาวบน Home
- แถบ progress + badge "N to claim" บนปุ่ม Quests ที่ Home

### Fixed
- ล็อกไม่ให้เล่นแนวนอนบนมือถือ (แนวนอนทำ UI พัง) ด้วย overlay ขอให้หมุนกลับแนวตั้ง
- Toast แจ้งเตือน text ชิดซ้าย แก้เป็นกึ่งกลาง
- เส้นทับ slider เพลง/เอฟเฟกต์เสียงในหน้า Settings (เกิดจาก `.settings-row` border-bottom ทะลุขึ้นมา)
- ปรับลดรางวัลเหรียญ/XP ของเควส (daily+weekly) ลง ~3.4x ให้สมดุลกับ achievement pool ที่ rebalance ไปก่อนหน้า

## 1.5.0 — 2026-07-18

### Added
- **Settings page**: full redesign — grouped cards for Sound, Notifications, Board,
  Official Community, Help & About, and Account
- **Background music**: calm looping track, with independent volume sliders for
  music and sound effects (each remembers its own on/off + level)
- **Vibration**: real haptic feedback on cell input, toggleable in Settings
- **Daily Puzzle Reminder**: push notifications wired to the UI for the first time
  (the backend existed but was never exposed)
- **Help & About pages**: How to Play, Contact Support, Privacy Policy, Terms of
  Service — all new, real content
- **What's New**: in-app release notes, auto-shown once after an update

### Changed
- App-wide font is now Fredoka (previously only used for game numbers/timer)
- Game is English-only — all in-app text is now English (does not apply to dev
  docs, the admin panel, or this changelog)

## 1.4.0 — 2026-07-16

### Changed
- **เศรษฐกิจเหรียญ**: ปรับ reward เหรียญ/XP ของเหรียญตรารวม 186 แบบใหม่ทั้งหมด ลดปริมาณเหรียญที่แจกลงให้สมดุลกับร้านค้ามากขึ้น พร้อมปรับยอดเหรียญและเลเวลของบัญชีที่มีอยู่แล้วให้ตรงตามสูตรใหม่
- **ระบบเลเวล**: ปรับสูตร XP ให้ไต่เลเวลได้เร็วขึ้นมาก (จากเดิมต้องใช้ XP สะสมกว่า 6 ล้านถึงเลเวล 100 เหลือประมาณ 6.8 แสน) และเพิ่มสิทธิพิเศษแรกให้เลเวล — โหมด Practice/Random ได้ hint ฟรีเพิ่มตามเลเวล (สูงสุด +3) ยกเว้นโหมด Daily ที่ต้องแฟร์เท่ากันทุกคนเพราะมีอันดับกลาง
- **ระบบวัดผล**: เปลี่ยนจาก third-party analytics มาใช้ระบบ funnel + retention ที่พัฒนาเอง แสดงผลในหน้า `/admin`

## 1.3.2 — 2026-07-14

### Fixed
- **Daily Quest**: แก้เวลารีเซ็ตให้ยึด UTC จริงตรงกันทั้งระบบ (เที่ยงคืน UTC = 07:00 น. ไทย) เดิมเควสรีเซ็ตหน้าจอไม่ตรงกับรอบนับผลของระบบ ทำให้เล่นช่วงตี 0–7 โมงเช้าแล้วเควสอาจไม่นับ
- **Daily Quest**: ลดจำนวนเควสต่อวันจาก 6 เหลือ 5 ใบ (ตัดเควสระดับยากสุดจาก 2 เหลือ 1)

## 1.3.1 — 2026-07-13

### Added
- **Daily Recap**: ปฏิทินดูประวัติ Daily Puzzle ย้อนหลัง พร้อม streak และสถิติรายเดือน
- **Daily Quest**: เควสประจำวันสุ่มหมุนเวียนใหม่ทุกวัน (สุ่มจาก 19 เควส) มีให้ลุ้นหลากหลายกว่าเดิม

### Fixed
- **Daily Puzzle**: เล่นได้วันละครั้งตามกติกา ไม่เล่นซ้ำได้อีก และตัดการเล่นย้อนหลังวันที่พลาด
- แก้ป๊อปอัป Level Up ที่เคยขึ้นเลขเลเวลผิด (client เดาก่อน server ตอบ)
- แก้ปุ่มย้อนกลับจากหน้าอันดับ Daily ให้กลับหน้า Daily Puzzle แทนหน้าแรก

## 1.3.0 — 2026-07-11

### Added
- **Random Mode**: เล่นแบบสุ่มความยาก แข่งกันด้วย win streak มีอันดับของตัวเอง

### Improved
- **Medals, Play Mode, และทั้งแอป**: เปลี่ยนไอคอนเป็นภาพจริงทั้งหมด สวยขึ้นชัดเจน
- **Medals**: แยกหมวด Clean Solve (เดิม Pure) เป็น 4 การ์ดตามความยาก
- **Daily Puzzle**: ดู leaderboard ได้ในหน้าเดียว ไม่ต้องกดดูแยก

### Fixed
- **Daily Puzzle**: ปุ่มเล่นไม่ค้างที่ "Continue" อีกต่อไปถ้ายังไม่เคยเล่นจริง
- บันทึกภาพแชร์บนมือถือ เซฟเข้า Photos/Gallery ได้แล้ว

## 1.2.0 — 2026-07-09

### Added
- **Play Mode**: หน้าใหม่รวมโหมดเล่นทั้งหมด (Daily Puzzle เล่นได้เลย, Time Attack/Random Mode เร็วๆ นี้)
- **Practice**: แยกหน้าเลือกความยากออกมาต่างหาก เล่นซ้ำได้สะดวกขึ้น

### Improved
- **Medals**: เปลี่ยนไอคอนบางจุดเป็นภาพจริงแทน emoji

## 1.1.0 — 2026-07-09

### Improved
- **Medals**: เพิ่มเหรียญรางวัลใหม่ 125 แบบ ใน 5 หมวดหมู่ (Play, Daily, Streak, Flawless, Speedster) แต่ละหมวดมี 5 ภารกิจ x 5 ระดับ ให้ผู้เล่นมีเป้าหมายเล่นต่อเนื่องมากขึ้น
- **Medals**: แก้ไข progress bar ที่ขาดหายในบางหมวดให้แสดงผลถูกต้อง

## 1.0.5 — 2026-06-30

### Fixed
- **Daily Score**: แก้บั๊ก submit daily score ค้าง (edge function timeout 504) — redeploy v9

### Improved
- **Medals**: ขยาย achievement เป็น 100 ข้อ (10 หมวด × 10 ระดับ)
- **Admin Dashboard**: เพิ่ม KPI "Coins in Circulation" แสดงเหรียญรวมของ user ทั้งหมด

## 1.0.4 — 2026-06-29

### Fixed
- **Daily Puzzle**: leaderboard and quests now update correctly after completing a daily puzzle (cron was calling wrong function — backfilled 30 days of missing puzzles).
- **Practice in-progress**: finishing a game now clears the "continue" banner; starting a new practice game no longer loads stale saved state.

### Improved
- **Home**: "Visitors Today" label is now clearer (was "Today").
- **Admin**: new Leaderboard tab with score breakdown (base → penalties → bonuses → total), date picker, and quick shortcuts.

## 1.0.3 — 2026-06-26

### Fixed
- **Timer**: pauses when the app/tab is minimised or backgrounded.
- **Board**: rounded corner cells; removed doubled hairline on the last row/column.
- **Leaderboard tabs**: inactive tabs no longer blend into the background.
- **Icon buttons**: back/edit glyphs are now centred.
- **You Won! confetti**: now actually renders (was wiped before display).

### Added
- In-game keyboard shortcuts (N = notes, H = hint) + button tooltips.
- Desktop drag-to-scroll for the Medals filter chips.
- Share sheet drag-to-dismiss.

### Changed
- Unified "Medals" naming across nav, Medals page, and profile.
- Home screen top spacing aligned with other views.

## 1.0.2 — 2026-06-26

### Fixed
- **Daily Puzzle**: scores now submit to the leaderboard and rewards are granted
  (root cause: server `TIME_MISMATCH` 403 when a game was paused or resumed —
  client now reports an effective `started_at` that matches actual play time).
- **Undo**: no longer refunds a lost heart (was a no-lose exploit).
- **Achievements**: "First Win" / "First Daily" now unlock
  (`check_and_grant_achievements` had no branch for them).

### Added
- Home screen shows the app version (and a STAGING badge on staging builds).

## 1.0.1
- Force SW cache bust; earlier fixes.
