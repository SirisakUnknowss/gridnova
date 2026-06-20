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
