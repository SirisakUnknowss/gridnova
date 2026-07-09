# 🕹️ Play Mode Hub — Spec Summary

> หน้าใหม่ที่รวมโหมดเล่นทั้งหมดไว้ที่เดียว แต่ละโหมดมี ranking/leaderboard แยกของตัวเอง

**Status:** ✅ Design decisions confirmed (2026-07-09) — พร้อมส่งให้ Claude ออกแบบ UI ต่อ

## 🎯 Goals

1. ให้ผู้เล่นเห็นทางเลือกการเล่นชัดเจนกว่าปัจจุบัน (ตอนนี้มีแค่ Daily + Practice ซ่อนอยู่คนละที่)
2. แต่ละโหมดมี ranking แยก → แข่งกันได้หลายมิติ ไม่ผูกกับ Daily leaderboard เดียว
3. Reuse engine เดิมให้มากที่สุด (generator/solver/scoring ใน `src/engine/`)

**ไม่ใช่ nav tab ใหม่** — ตาม Hard Rule ข้อ 7 (bottom nav ต้องมี 4 tab พอดี) หน้านี้เข้าถึงผ่านปุ่ม **"Play Mode"** จาก Home คนละปุ่มกับ **"Practice"** (แยกกันชัดเจน ไม่รวม)

## ✅ Confirmed Decisions

| # | คำถาม | คำตอบ |
|---|---|---|
| 1 | Random Mode ranking metric | **Win streak** (ทางเลือก C) |
| 2 | Time Attack tier | **Fix 3 tier** (Sprint/Rush/Marathon) ก่อน ไม่ต้อง custom time ใน v1 |
| 3 | Entry point | ปุ่ม **"Play Mode"** ที่หน้า Home |
| 4 | Practice mode | **แยกปุ่มต่างหาก** จาก Home — ไม่รวมเข้า Play Mode Hub |

### ⚠️ ผลกระทบต่อหน้า Home — ต้อง redesign

หน้า Home จะเหลือ 2 ส่วนหลักคือ **Community** กับ **Daily Quest** บวกปุ่มเข้าโหมดต่างๆ:
- ปุ่ม **Play Mode** → เข้าหน้า hub นี้ (Daily / Time Attack / Random)
- ปุ่ม **Practice** → เข้า practice mode เดิม (แยกต่างหาก ไม่เปลี่ยน)
- ส่วน Community + Daily Quest ที่เหลืออยู่

**Action:** ต้องให้ Claude ออกแบบหน้า Home ใหม่ทั้งหน้าด้วย ไม่ใช่แค่หน้า Play Mode Hub — ควรทำเป็น task แยกต่อจากนี้ (layout, hierarchy ของปุ่ม Play Mode vs Practice, ตำแหน่ง Community/Quest)

---

## 📋 โหมดที่ 1: Daily Puzzle *(มีอยู่แล้ว — ย้ายมาแสดงในหน้านี้)*

ไม่มีการเปลี่ยนแปลง logic ใดๆ — แค่เพิ่ม entry card ในหน้า Play Mode Hub ที่ลิงก์ไปยังโหมด Daily เดิม

- **Ranking:** `daily_leaderboard` (มีอยู่แล้ว) — คะแนนต่อวัน, reset เที่ยงคืน UTC
- **Card ที่แสดงในหน้า hub:** วันที่, ความยากของวันนี้, countdown ถึง reset ถัดไป, อันดับปัจจุบันของผู้เล่น (ถ้าเล่นแล้ว)

รายละเอียดเต็ม: [`daily-puzzle.md`](./daily-puzzle.md)

---

## 📋 โหมดที่ 2: Time Attack *(ใหม่)*

### เงื่อนไข
แก้ให้เสร็จก่อนหมดเวลา — เลือกความยากเอง + เลือกเวลาที่มีให้เอง (tier)

| Time Tier | เวลาที่ให้ | เหมาะกับความยาก |
|---|---|---|
| Sprint | 3 นาที | Easy, Easy-Medium |
| Rush | 5 นาที | Medium, Medium-Hard |
| Marathon | 10 นาที | Hard, Hard-Expert, Expert |

- แก้ไม่ทันตามเวลา = แพ้ (เกมจบทันที ไม่ submit คะแนน)
- แก้ทันตามเวลา = คะแนน = `remaining time bonus + base score - mistake/hint penalty` (สูตรคล้าย practice/daily แต่ให้น้ำหนัก "เวลาที่เหลือ" มากกว่า)

### ✅ Confirmed: ranking แยกตาม Time Tier
**Sprint / Rush / Marathon มี leaderboard ของตัวเองแยกกัน** เพราะเวลาที่ต่างกันเทียบกันตรงๆ ไม่ได้ยุติธรรม เหมือนที่ Daily แยกตามวัน (ไม่ normalize รวมเป็น leaderboard เดียว — เก็บไว้พิจารณาใน v2 ถ้าต้องการ)

**Time tier เป็น fix 3 แบบ** (ไม่มี custom time ให้ตั้งเองใน v1)

### Engine ที่ reuse ได้
- Generator/solver เดิมทั้งหมด (`src/engine/`)
- Scoring formula ปรับจาก `scoring.ts` เดิม เพิ่มตัวแปร `timeRemaining`

### Schema ที่ต้องเพิ่ม
```sql
CREATE TABLE time_attack_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  tier TEXT NOT NULL,            -- 'sprint' | 'rush' | 'marathon'
  difficulty difficulty_enum NOT NULL,
  score INTEGER NOT NULL,
  time_seconds INTEGER NOT NULL,
  mistakes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
- Ranking window: แนะนำให้เป็น **all-time best per user per tier** (เก็บ record ที่ดีที่สุดของแต่ละคน ไม่ใช่ทุกครั้งที่เล่น) เพื่อไม่ให้ leaderboard รกด้วยหลาย record ของคนเดียวกัน

### Rewards
- Coin/XP ตามสูตร practice ปกติ + bonus ถ้าติด Top 100/10/1 ของ tier นั้น (คล้าย Daily)
- จับคู่กับ **Speedster achievements ที่มีอยู่แล้ว** — เล่น Time Attack คือทางที่เร็วสุดในการปลดล็อค Speedster medals

---

## 📋 โหมดที่ 3: Random Mode *(ใหม่)*

### เงื่อนไข
กดเล่นปุ่มเดียว ระบบสุ่มความยากให้ (weighted random หรือ uniform — เลือกได้) ไม่ต้องเลือกเอง ลด friction ก่อนเริ่มเกม

### ✅ Confirmed: Win-streak ranking (ทางเลือก C)

ยุติธรรมโดยธรรมชาติเพราะไม่ขึ้นกับความยากที่สุ่มได้ ใครก็แข่งได้ ไม่ต้องคิดสูตร normalize คะแนนข้ามความยาก และทำให้ 3 โหมดมี ranking ที่ "รู้สึกต่างกันจริง" ไม่ซ้ำกัน (Daily = คะแนน/วัน, Time Attack = คะแนน/tier, Random = ความต่อเนื่อง)

### Schema ที่ต้องเพิ่ม (ถ้าเลือกทางเลือก C)
```sql
CREATE TABLE random_mode_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  current_win_streak INTEGER NOT NULL DEFAULT 0,
  longest_win_streak INTEGER NOT NULL DEFAULT 0,
  total_played INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
- Leaderboard = `ORDER BY longest_win_streak DESC` (all-time) และ/หรือ `current_win_streak DESC` (active เดี๋ยวนี้)
- แพ้ 1 เกม (ใช้ mistake เกิน limit หรือ quit กลางคัน) = current_win_streak รีเซ็ตเป็น 0

### Rewards
- Coin/XP ตามความยากที่สุ่มได้ (ใช้สูตร practice เดิม)
- Bonus coin ทุกๆ 5 win streak ติดต่อกัน

---

## 🗂️ สรุปเปรียบเทียบ 3 โหมด

| | Daily | Time Attack | Random Mode |
|---|---|---|---|
| เลือกความยากเอง? | ❌ (fix ตามวัน) | ✅ | ❌ (สุ่ม) |
| จำกัดเวลา? | ❌ | ✅ (3/5/10 นาที) | ❌ |
| เล่นได้กี่ครั้ง | 1/วัน | ไม่จำกัด | ไม่จำกัด |
| Ranking metric | คะแนนต่อวัน | คะแนน best-per-tier | Win streak |
| Reuse engine | 100% เดิม | 100% เดิม (+ timer) | 100% เดิม |
| Schema ใหม่ | ไม่ต้อง | `time_attack_leaderboard` | `random_mode_stats` |

---

## 🔜 Next Steps

1. **ส่งเอกสารนี้ให้ Claude ออกแบบ UI** — ทั้งหน้า Play Mode Hub และหน้า Home ใหม่ (เพราะปุ่ม Play Mode / Practice ต้องอยู่คู่กันบน Home ที่ปรับ layout ใหม่)
2. **Home redesign scope:** Community section, Daily Quest section, ปุ่ม Play Mode, ปุ่ม Practice — ตัดส่วนอื่นที่ไม่ใช่ 4 อย่างนี้ออกจาก Home หรือย้ายไปที่อื่น (เช่น profile stats ถ้ามี)
3. หลัง design เสร็จ → ทำ migration schema (`time_attack_leaderboard`, `random_mode_stats`) + engine changes (timer สำหรับ Time Attack, random difficulty picker สำหรับ Random Mode) + submit-score edge functions ใหม่ 2 ตัว
