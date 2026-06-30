# 🧠 Pure — M5: Expert ไม่ Hint + ไม่ผิด

**Group:** pure | **Mission:** 5 | **ID prefix:** ACH_PURE_M5

## เงื่อนไข
เล่น difficulty `expert` โดยไม่ใช้ hint เลย AND ไม่มีความผิดพลาด (`hints_used = 0 AND mistakes_count = 0`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Expert Perfect Pure 1 ครั้ง | 300 | 600 | ACH_PURE_M5_L1 |
| L2 | 🥈 Silver | Expert Perfect Pure 3 ครั้ง | 900 | 1800 | ACH_PURE_M5_L2 |
| L3 | 🥇 Gold | Expert Perfect Pure 5 ครั้ง | 2000 | 4000 | ACH_PURE_M5_L3 |
| L4 | 💠 Platinum | Expert Perfect Pure 10 ครั้ง | 5000 | 10000 | ACH_PURE_M5_L4 |
| L5 | 💎 Diamond | Expert Perfect Pure 20 ครั้ง | 12000 | 25000 | ACH_PURE_M5_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_pure_expert_perfect_count
  FROM user_game_history WHERE user_id = p_user_id
    AND hints_used = 0 AND mistakes_count = 0 AND level = 'expert'::difficulty_enum;
```

**Status:** ⏳ ยังไม่ได้ implement
