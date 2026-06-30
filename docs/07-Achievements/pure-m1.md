# 🧠 Pure — M1: Easy ไม่ใช้ Hint

**Group:** pure | **Mission:** 1 | **ID prefix:** ACH_PURE_M1

## เงื่อนไข
เล่น difficulty `easy` โดยไม่ใช้ hint เลย (`hints_used = 0`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Easy No Hint 1 ครั้ง | 100 | 200 | ACH_PURE_M1_L1 |
| L2 | 🥈 Silver | Easy No Hint 5 ครั้ง | 300 | 600 | ACH_PURE_M1_L2 |
| L3 | 🥇 Gold | Easy No Hint 20 ครั้ง | 800 | 1500 | ACH_PURE_M1_L3 |
| L4 | 💠 Platinum | Easy No Hint 50 ครั้ง | 2000 | 4000 | ACH_PURE_M1_L4 |
| L5 | 💎 Diamond | Easy No Hint 100 ครั้ง | 5000 | 10000 | ACH_PURE_M1_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_pure_easy_count
  FROM user_game_history WHERE user_id = p_user_id
    AND hints_used = 0 AND level = 'easy'::difficulty_enum;
```

**Status:** ⏳ ยังไม่ได้ implement
