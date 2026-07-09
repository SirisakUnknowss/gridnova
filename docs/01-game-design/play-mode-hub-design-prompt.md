# Design Prompt — Play Mode Hub + Home Redesign

ออกแบบ UI ให้ GridNova (Sudoku PWA, vanilla TS/Vite, single stylesheet, mobile-first, ผู้ใช้พูดไทย) สำหรับ 2 หน้า: **Home ใหม่** และ **Play Mode Hub หน้าใหม่**

## Constraints ที่ต้องเคารพ

- **ไม่มี framework** — DOM/HTML string ล้วน ไม่ใช่ React/Vue
- **`.view` pattern** — ทุกหน้าเต็มจอห่อด้วย `<section class="view">`, `max-width:520px`, จัดกลาง
- **Bottom nav ต้องมี 4 tab พอดี** (Home, Medals, Season, Profile) — ห้ามเพิ่ม/ลบ tab เพื่อเข้าถึงหน้าใหม่นี้
- **สีทั้งหมดใช้ CSS custom properties** ที่มีอยู่แล้ว (`--brand-primary`, `--app-bg`, `--app-card` ฯลฯ) ห้าม hardcode
- Theme system มีอยู่แล้ว 11 แบบ ต้องรองรับทุก theme

## หน้า 1: Home (redesign)

Home ปัจจุบันมี: guest banner, Daily Puzzle card, Practice difficulty picker, Community/visitor stats, Quests — **จะตัดเหลือ 4 ส่วนหลัก:**

1. ปุ่ม **"Play Mode"** — ทางเข้าสู่ Play Mode Hub (โหมดใหม่)
2. ปุ่ม **"Practice"** — แยกต่างหาก ไม่รวมกับ Play Mode (ของเดิม พาไปหน้าเลือก difficulty เดิม)
3. **Community** — สถิติผู้เล่นออนไลน์/visitor (ของเดิม)
4. **Daily Quest** — เควสประจำวัน (ของเดิม)

**โจทย์การออกแบบ:** จัด hierarchy ของปุ่ม Play Mode vs Practice ให้ชัดว่าอันไหนคือ "ทางหลัก" (Play Mode ควรเด่นกว่า เพราะรวม Daily+Time Attack+Random ไว้ในที่เดียว), จัดวาง Community/Quest ให้ไม่แย่งความสนใจจากปุ่มเล่นเกม

## หน้า 2: Play Mode Hub (ใหม่ทั้งหมด)

หน้าที่รวม 3 โหมดเป็น card แนวตั้ง หรือ tab — แต่ละโหมดมี ranking แยกกันเด็ดขาด

### Card/Mode 1 — Daily Puzzle (ของเดิม ลิงก์เข้า)
แสดง: วันที่, ความยากวันนี้, countdown ถึง reset เที่ยงคืน UTC, อันดับปัจจุบัน (ถ้าเล่นแล้ว)

### Card/Mode 2 — Time Attack (ใหม่)
- เลือกความยาก + เลือก **time tier**: Sprint (3นาที, Easy/Easy-Medium), Rush (5นาที, Medium/Medium-Hard), Marathon (10นาที, Hard ขึ้นไป)
- แก้ไม่ทัน = แพ้ทันที ไม่ submit คะแนน
- **Ranking แยกตาม tier** (Sprint/Rush/Marathon คนละ leaderboard) — ต้องออกแบบ UI ให้เลือกดู leaderboard ของแต่ละ tier ได้ (เช่น sub-tab ภายใน mode)

### Card/Mode 3 — Random Mode (ใหม่)
- กดเล่นปุ่มเดียว ระบบสุ่มความยากให้ ไม่ต้องเลือกเอง
- **Ranking = win streak** (ไม่ใช่คะแนน) — แสดง current streak และ longest streak ของผู้เล่น + leaderboard แยกต่างหาก
- แพ้ 1 เกม = streak รีเซ็ต — ต้องสื่อสาร UI ให้ผู้เล่นรู้ก่อนเริ่มว่าเดิมพันด้วย streak

## สิ่งที่อยากได้จาก design

1. Wireframe/mockup ของหน้า Home ใหม่ (mobile, 375px width)
2. Wireframe/mockup ของหน้า Play Mode Hub พร้อม 3 mode card
3. Wireframe ของหน้า leaderboard ย่อยใน Time Attack (แสดงยังไงเมื่อมี 3 tier แยกกัน)
4. Empty state / first-time-user state สำหรับ Random Mode (ยังไม่มี streak เลย)

## Reference

สเปคเต็มอยู่ที่ [`docs/01-game-design/play-mode-hub.md`](./play-mode-hub.md) ในโปรเจกต์ — อ่านก่อนเริ่ม design เพื่อดู schema, scoring formula, และ edge case ที่ confirm ไว้แล้ว
