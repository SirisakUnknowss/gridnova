# GridNova — Effects & Sound Feature (Design Notes)

> สถานะ: **planning** · ยังไม่ implement
> Deploy: ทำเสร็จ push **staging เท่านั้น** ตาม policy

---

## สถานะปัจจุบัน (ของที่มีแล้ว)

| ระบบ | สถานะ |
|---|---|
| SFX engine | ✅ `src/lib/sound.ts` — Web Audio API สังเคราะห์เสียงเอง (ไม่มีไฟล์เสียง, ไม่เพิ่ม dep) |
| SFX ที่ wire แล้ว | place, select, error, erase, hint, coin, nav, win, dailyWin, levelUp, questClaim, themeChange, streakMilestone |
| Mute | ✅ global toggle (`isMuted` / `toggleMute` / `setMuted`) ปุ่มที่หน้า home, persist |
| Confetti | ✅ มีแค่หน้า **You Won** (`win-modal.ts` → `launchConfetti`) |
| Background music | ❌ ไม่มี |
| Settings page | ❌ ไม่มีไฟล์ (มี `'settings'` ใน View type + ตาราง `user_settings` แล้ว แต่ยังไม่ build) |
| Haptics | dep `@capacitor/haptics` มีแล้ว แต่ยังไม่ได้ใช้ |

---

## 1. Confetti — ควรมีหน้าไหนอีก?

**หลักการ:** confetti = รางวัลของ "ความสำเร็จจริง" ถ้าใส่ทุกที่จะหมดความขลัง

| จุด | ใส่ confetti? | เหตุผล |
|---|---|---|
| You Won (จบเกม) | ✅ มีแล้ว | flagship moment |
| **Achievement ปลดล็อก** | ✅ ควรเพิ่ม | dopamine สูง ตอนนี้มีแค่ sfx |
| **Level Up** | ✅ ควรเพิ่ม | มี `sfxLevelUp` แล้ว เติม burst |
| **Streak milestone** (3/7/14/30/60/100/365) | ✅ ควรเพิ่ม | ฉลองความต่อเนื่อง |
| Quest reward claim | ⚠️ optional | burst เล็ก ๆ พอ (อย่าให้รก) |
| ทุกครั้งที่ได้เหรียญ/ใส่เลขถูก | ❌ ไม่ | จะเฝือ |

**Implementation:** แยก `launchConfetti()` ออกจาก `win-modal.ts` → ทำเป็น util กลาง `src/lib/confetti.ts`
(รับ container + ระดับความแรง เช่น `burst` เล็ก / `full` ใหญ่) แล้วเรียกซ้ำได้ทุกจุด
> บัคที่เคยเจอ: เรียก confetti **ก่อน** set innerHTML จะโดนลบ — util ใหม่ต้อง append หลัง DOM พร้อมแล้วเสมอ

---

## 2. Settings page — ควรมี

ตอนนี้คุมเสียงได้แค่ปุ่ม mute เดียว — ควรมีหน้า settings จริงเป็นบ้านของ toggle ทั้งหมด

**สิ่งที่ควรอยู่ในหน้า Settings (`src/ui/views/settings.ts`):**
- 🔊 **Sound effects** — เปิด/ปิด (+ slider ความดัง optional)
- 🎵 **Background music** — เปิด/ปิด (default **OFF**)
- 📳 **Haptics / สั่น** — เปิด/ปิด (มือถือ)
- 🎯 ตัวเลือกกระดาน (มีใน board settings แล้ว: `highlightSame`, `showConflict`, `highlightRelated`)
- 🎨 ลิงก์ไป Theme / Shop
- 👤 บัญชี (ออกจากระบบ ฯลฯ)

เก็บค่าใน `user_settings` (มี `getSettings`/`updateSettings` แล้ว) + cache localStorage สำหรับ guest
เข้าได้จากหน้า Profile หรือไอคอนเฟือง

---

## 3. Background music — มีได้ แต่ปิด default

**คำแนะนำ:** Sudoku เป็นเกม **focus** — คนเล่นจริงจังเพลงจะรบกวนสมาธิ
- ✅ มีเป็น **option** แต่ **default OFF** ให้ opt-in เอง
- เลือกเพลง **ambient / lo-fi เบา ๆ** วนลูป ระดับเสียงต่ำ
- แยก toggle จาก SFX ชัดเจน (บางคนอยากได้ SFX แต่ไม่เอาเพลง)
- ลด/หยุดเพลงอัตโนมัติตอน: เปิด modal สำคัญ, แอปถูกย่อ (เชื่อมกับ visibilitychange ที่ทำไว้แล้ว)
- ⚠️ ต้องใช้ไฟล์เสียงจริง (mp3/ogg) → กระทบ bundle/PWA cache — โหลดแบบ lazy + cache แยก ไม่ precache

---

## 4. เสียงตอนแตะจอ (click/touch SFX) — ไม่ควรใส่ทุกการแตะ

**คำแนะนำ:** เสียงทุก tap = ล้า + น่ารำคาญ โดยเฉพาะ Sudoku ที่แตะถี่
- ✅ เก็บเสียง **เฉพาะที่มีความหมาย** (เลือกช่อง, ใส่เลข, ผิด, ปุ่มหลัก) — ซึ่งมีแล้ว
- ❌ ไม่ทำ global tap sound บนทุก element
- ✅ แทนด้วย **haptics เบา ๆ** บนมือถือ (ใช้ `@capacitor/haptics` ที่มีอยู่) — ตอบสนองดีกว่าเสียงบนมือถือ
- ทั้ง SFX และ haptics เคารพ toggle ในหน้า settings

---

## Implementation checklist (ตอนลงมือ)

- [ ] refactor `launchConfetti` → `src/lib/confetti.ts` (param: container, intensity)
- [ ] เพิ่ม confetti: achievement unlock, level-up modal, streak milestone
- [ ] สร้าง `src/ui/views/settings.ts` (sound / music / haptics / board options)
- [ ] เพิ่ม state เสียงแยก: `sfxEnabled`, `musicEnabled`, `hapticsEnabled` (แทน mute เดียว) + persist (`user_settings` + localStorage)
- [ ] background music: lazy-load track, loop, low volume, default off, pause on hidden/modal
- [ ] haptics util: wrap `@capacitor/haptics`, เรียกตอน tap ปุ่ม/ใส่เลข, gate ด้วย toggle
- [ ] ทุกอย่างเคารพ toggle + ไม่เพิ่ม npm dep (ยกเว้นไฟล์เพลงเป็น asset)

## Hard rules ที่เกี่ยวข้อง
- ห้ามเพิ่ม npm dependency (SFX สังเคราะห์เอง, haptics มี dep แล้ว, เพลงเป็น asset)
- รองรับ guest (localStorage) ไม่ใช่แค่ user ที่ login
- ระวัง PWA cache size ถ้าใส่ไฟล์เพลง — lazy-load อย่า precache
