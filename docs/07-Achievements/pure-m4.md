# 🧠 Pure — M4: Expert ไม่ใช้ Hint

**Group:** pure | **Mission:** 4 | **ID prefix:** ACH_PURE_M4

## เงื่อนไข
เล่น difficulty `expert` โดยไม่ใช้ hint เลย (`hints_used = 0`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Expert No Hint 1 ครั้ง | 200 | 400 | ACH_PURE_M4_L1 |
| L2 | 🥈 Silver | Expert No Hint 3 ครั้ง | 600 | 1200 | ACH_PURE_M4_L2 |
| L3 | 🥇 Gold | Expert No Hint 10 ครั้ง | 1500 | 3000 | ACH_PURE_M4_L3 |
| L4 | 💠 Platinum | Expert No Hint 20 ครั้ง | 3500 | 7000 | ACH_PURE_M4_L4 |
| L5 | 💎 Diamond | Expert No Hint 50 ครั้ง | 8000 | 15000 | ACH_PURE_M4_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_pure_expert_count
  FROM user_game_history WHERE user_id = p_user_id
    AND hints_used = 0 AND level = 'expert'::difficulty_enum;
```

**Status:** ⏳ ยังไม่ได้ implement
