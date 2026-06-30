# 📅 Daily — M4: Daily ไม่ผิดเลย

**Group:** daily | **Mission:** 4 | **ID prefix:** ACH_DAILY_M4

## เงื่อนไข
เล่น Daily puzzle โดยไม่มีความผิดพลาดเลย (`mistakes_count = 0`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Daily ไม่ผิด 1 ครั้ง | 100 | 200 | ACH_DAILY_M4_L1 |
| L2 | 🥈 Silver | Daily ไม่ผิด 5 ครั้ง | 300 | 600 | ACH_DAILY_M4_L2 |
| L3 | 🥇 Gold | Daily ไม่ผิด 20 ครั้ง | 800 | 1500 | ACH_DAILY_M4_L3 |
| L4 | 💠 Platinum | Daily ไม่ผิด 50 ครั้ง | 2000 | 4000 | ACH_DAILY_M4_L4 |
| L5 | 💎 Diamond | Daily ไม่ผิด 100 ครั้ง | 5000 | 10000 | ACH_DAILY_M4_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_daily_perfect_count
  FROM user_game_history WHERE user_id = p_user_id
    AND mode = 'daily' AND mistakes_count = 0;
```

**Status:** ⏳ ยังไม่ได้ implement
