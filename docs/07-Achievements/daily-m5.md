# 📅 Daily — M5: Daily ไม่ใช้ Hint

**Group:** daily | **Mission:** 5 | **ID prefix:** ACH_DAILY_M5

## เงื่อนไข
เล่น Daily puzzle โดยไม่ใช้ hint เลย (`hints_used = 0`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Daily ไม่ใช้ hint 1 ครั้ง | 100 | 200 | ACH_DAILY_M5_L1 |
| L2 | 🥈 Silver | Daily ไม่ใช้ hint 5 ครั้ง | 300 | 600 | ACH_DAILY_M5_L2 |
| L3 | 🥇 Gold | Daily ไม่ใช้ hint 20 ครั้ง | 800 | 1500 | ACH_DAILY_M5_L3 |
| L4 | 💠 Platinum | Daily ไม่ใช้ hint 50 ครั้ง | 2000 | 4000 | ACH_DAILY_M5_L4 |
| L5 | 💎 Diamond | Daily ไม่ใช้ hint 100 ครั้ง | 5000 | 10000 | ACH_DAILY_M5_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_daily_nohint_count
  FROM user_game_history WHERE user_id = p_user_id
    AND mode = 'daily' AND hints_used = 0;
```

**Status:** ⏳ ยังไม่ได้ implement
