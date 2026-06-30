# 🧠 Pure — M3: Hard ไม่ใช้ Hint

**Group:** pure | **Mission:** 3 | **ID prefix:** ACH_PURE_M3

## เงื่อนไข
เล่น difficulty `hard` หรือ `hard-expert` โดยไม่ใช้ hint เลย (`hints_used = 0`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Hard No Hint 1 ครั้ง | 150 | 300 | ACH_PURE_M3_L1 |
| L2 | 🥈 Silver | Hard No Hint 5 ครั้ง | 400 | 800 | ACH_PURE_M3_L2 |
| L3 | 🥇 Gold | Hard No Hint 15 ครั้ง | 1000 | 2000 | ACH_PURE_M3_L3 |
| L4 | 💠 Platinum | Hard No Hint 30 ครั้ง | 2500 | 5000 | ACH_PURE_M3_L4 |
| L5 | 💎 Diamond | Hard No Hint 50 ครั้ง | 6000 | 12000 | ACH_PURE_M3_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_pure_hard_count
  FROM user_game_history WHERE user_id = p_user_id
    AND hints_used = 0
    AND level IN ('hard'::difficulty_enum, 'hard-expert'::difficulty_enum);
```

**Status:** ⏳ ยังไม่ได้ implement
