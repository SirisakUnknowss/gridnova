# GridNova — Bug Fix & Polish Plan

> จาก playtest ของเจ้าของโปรเจกต์ · สถานะ: **planning (ยังไม่แก้)**
> Deploy: แก้แล้ว push **staging เท่านั้น** ตาม policy

ลำดับแนะนำ: **Phase 1 (logic bugs) → Phase 2 (in-game UI) → Phase 3 (general UI) → Phase 4 (เสริม)**

---

## 📌 Resume note (เริ่มทำ 13:00 — 2026-06-26)

- **Branch:** ทำบน `staging` ตรง ๆ ไม่ต้องแยก feature branch (solo dev, staging = integration)
  → push staging → เช็ค staging.gridnova.pages.dev → merge `main` เฉพาะตอนเจ้าของอนุมัติขึ้น prod
- **Version:** **ยังไม่ bump** ตอนทำ staging — bump ทีเดียวตอน promote ขึ้น prod (พร้อม flow ยืนยัน
  changes + release notes ตาม Deployment Policy ใน CLAUDE.md) · staging แยกด้วย STAGING badge + git sha
- **เริ่มที่:** Phase 1.1 (undo) แก้ได้เลย + 1.2 ต้องดึง Supabase edge function logs ของ
  `submit-daily-score` ก่อน (ผ่าน Supabase MCP) แล้วค่อยแก้

---

## 🔴 Phase 1 — Logic / Correctness bugs (สำคัญสุด)

### 1.1 Undo ย้อนหัวใจได้ → no-lose exploit
- **ยืนยันแล้ว** · `src/ui/views/game.ts:388-391`
- ตอน `undoMove()` มันทำ `mistakes = mistakes - entry.mistakesDelta` + `renderHearts()` → คืนหัวใจ
- **แก้:** undo คืนค่าตัวเลขในช่องได้ แต่ **ห้ามคืน mistakes/หัวใจ** (mistakes ถาวร)
  - ลบ block `if (entry.mistakesDelta > 0) { mistakes = ...; renderHearts() }` ใน `undoMove()`
  - เช็ค `redoMove()` (396-408) ให้ logic สอดคล้อง — ถ้า mistakes ไม่ refund ตอน undo ก็ไม่ต้อง re-add ตอน redo
- **Effort:** S

### 1.2 Daily Puzzle ไม่ได้รางวัล + ไม่ขึ้น Leaderboard (Guest + Login)
- **ต้องสืบ runtime ก่อนแก้** — โค้ดดูครบแต่พังตอนรัน
- เส้นทาง member: `main.ts:447` → `api.submitDailyScore` → edge function `supabase/functions/submit-daily-score`
  - edge function มี: insert `daily_leaderboard`, `grant_coins`, `grant_xp`, insert `user_game_history`, `check_and_grant_achievements` — ครบ
  - error ถูก catch เงียบที่ `main.ts:461` (`console.warn`) → ผู้เล่นไม่เห็น error แต่ไม่ได้อะไร
- **สิ่งที่ต้องเช็ค (ก่อนแก้):**
  1. Supabase **edge function logs** ของ `submit-daily-score` — หา error จริง (RLS? duplicate key ใน `daily_leaderboard`? `leaderboard_view`/`grant_coins`/`grant_xp` หาย?)
  2. coins/xp ฝั่ง client เป็น **optimistic update** (`main.ts:407-411`) → ถ้า server ไม่ persist พอ refresh ก็หาย = "ไม่ได้รางวัล"
- เส้นทาง guest: `main.ts:435` → `submitGuestScore`
  - guest อาจไม่มี wallet ถาวร → coins เป็น client-only (หายตอน reload) = พฤติกรรมที่ต้องตัดสินใจ
  - guest leaderboard แยก (`getGuestLeaderboard`) — เช็คว่าเขียนลงตารางที่หน้า leaderboard อ่านจริงไหม
- **แก้ (หลังรู้ root cause):** ปลด catch เงียบ → โชว์ error/toast, fix RPC/insert ที่พัง, ยืนยัน coins/xp persist
- **Effort:** M–L (ขึ้นกับ root cause)

### 1.3 First Win achievement ไม่ปลดล็อก
- achievement "First Win" มีใน catalog (`achievements_definitions`) แต่ **grep ไม่เจอ rule/เงื่อนไขใน grant logic** เลย
- น่าจะ: `check_and_grant_achievements` RPC ไม่มีเคสปลด First Win (หรือ id ไม่ match)
- **เช็ค:** หา id จริงของ First Win ใน DB + ดู logic ใน `check_and_grant_achievements` ว่าครอบ "เกมแรกที่ชนะ" ไหม
- **แก้:** เพิ่มเงื่อนไขปลด First Win ใน RPC (migration ใหม่ — append only) + ให้ทำงานทั้ง daily & practice path
- **Effort:** M

---

## 🟠 Phase 2 — In-game UI/UX

### 2.1 Leaderboard tabs กลืนพื้นหลัง
- `src/ui/views/leaderboard.ts` + css `.lb-tabs` — tab ที่ไม่ถูกเลือก bg กลืน app-bg
- **แก้:** tab inactive ใช้ `--app-card-bg`/border ให้แยกออกจากพื้นหลัง

### 2.2 ตาราง 4 ช่องมุม board ไม่มน
- `src/ui/components/board.ts` — เพิ่ม rounded ที่ 4 cell มุม (หรือ overflow:hidden + radius ที่ board container)

### 2.3 เส้นแถวล่างสุดของ board ไม่เสมอ (ดูเหมือนเส้นเกิน)
- board border-bottom ซ้อนกับเส้น cell — `board.ts` / css `.board .cell`
- **แก้:** จัด border-collapse / ตัด border ซ้ำขอบล่าง

### 2.4 ปุ่ม action 5 ปุ่ม — เพิ่ม keyboard hint (Kbd/tooltip บน hover)
- `game.ts` action buttons (undo/erase/notes/hint/…) — เพิ่ม `title`/tooltip + แสดงคีย์ลัด
- **Effort:** S–M

### 2.5 Difficulty badge มุมบนซ้าย — ถ้ากดไม่ได้อย่าใส่ cursor-pointer
- `game.ts` mode/difficulty pill — มี class `mode-pill` (มี `.no-click` อยู่แล้วที่ css:257)
- **แก้:** ตอน daily/กดไม่ได้ ใส่ `.no-click` + เอา cursor-pointer ออก

---

## 🟡 Phase 3 — General UI/UX

### 3.1 ชื่อเมนูไม่ตรงกัน: nav "Medals" vs หน้า "Achievements"
- `src/ui/components/bottom-nav.ts:29` label `'Medals'` ↔ หน้า title `'Achievements'`
- **แก้:** เลือกใช้ชื่อเดียว (แนะนำ "Medals" ทั้งคู่ หรือ "Achievements" ทั้งคู่ — ให้เจ้าของเลือก)

### 3.2 หน้าแรก mobile มี scroll-x (navbar ยาวเกิน)
- ตรวจ overflow ใน `home.ts` / bottom-nav / `.view` — น่าจะ element กว้างเกิน 100vw
- **แก้:** หา element ที่ล้น (เพิ่ม `overflow-x:hidden` ที่ระดับเหมาะสม + แก้ตัวต้นเหตุ ไม่ใช่ซ่อนเฉย ๆ)

### 3.3 ปุ่ม back (ChevronLeft) ไอคอนไม่อยู่กลางปุ่ม
### 3.4 ปุ่มไอคอน "ทุกปุ่ม" ไอคอนไม่กลาง
- น่าจะ root cause เดียว — `.icon-btn`/`.ach-back` ใช้ flex/grid center ไม่ครบ หรือ svg มี baseline offset
- **แก้:** `display:grid; place-items:center` + `svg{display:block}` ที่ class ปุ่มไอคอนกลาง
- **Effort:** S (แก้ทีเดียวครอบหลายปุ่ม)

### 3.5 ปุ่ม Edit Profile name ไม่กึ่งกลางแกน x
- `src/ui/views/profile.ts` `.profile-name` / `.icon-btn--ghost`

### 3.6 ปุ่มใน group เดียวกัน padding ไม่เท่า
- หาจุดที่ปุ่มกลุ่มเดียวกันคนละ padding (ระบุหน้าเพิ่มตอนแก้)

### 3.7 Share Profile drawer ลากแกน y ไม่ได้ (drawer เก๊)
- `src/ui/views/share-modal.ts` — ตอนนี้เป็น drawer แบบ static
- **แก้:** เพิ่ม drag-to-dismiss แกน y (touch/pointer events) — **Effort:** M

### 3.8 Achievements filter chips ลากแกน x ไม่ได้บน desktop
- `achievements.ts` `.ach-filter` — mobile scroll ได้ แต่ desktop ลากด้วยเมาส์ไม่ได้
- **แก้:** เพิ่ม drag-to-scroll (pointer events) ให้ `.ach-filter` — **Effort:** S–M

---

## 🟢 Phase 4 — ส่วนเสริม

### 4.1 Confetti effect ในหน้า You Won! dialog
- `src/ui/views/win-modal.ts`
- **แก้:** เพิ่ม confetti (canvas เล็ก ๆ เองตาม style โปรเจกต์ — ไม่เพิ่ม npm dep ตาม Hard Rule)
- **Effort:** S–M

---

## หมายเหตุ
- **ห้ามเพิ่ม npm dependency** (confetti ทำเอง), ห้าม hardcode สี (ใช้ CSS var), migration = append-only
- บัค 1.2 **ต้องดู edge function logs ก่อน** — อย่าเดาแล้วแก้มั่ว
- หลายข้อ UI (3.3/3.4) แก้ที่ class กลางได้ทีเดียวครอบหลายจุด
