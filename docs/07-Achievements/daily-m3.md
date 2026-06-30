# 📅 Daily — M3: Daily Hard

**Group:** daily | **Mission:** 3 | **ID prefix:** ACH_DAILY_M3

## เงื่อนไข
เล่น Daily puzzle ระดับ `hard` หรือ `hard-expert` ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Daily Hard 1 ครั้ง | 50 | 100 | ACH_DAILY_M3_L1 |
| L2 | 🥈 Silver | Daily Hard 5 ครั้ง | 150 | 300 | ACH_DAILY_M3_L2 |
| L3 | 🥇 Gold | Daily Hard 20 ครั้ง | 400 | 800 | ACH_DAILY_M3_L3 |
| L4 | 💠 Platinum | Daily Hard 50 ครั้ง | 1000 | 2000 | ACH_DAILY_M3_L4 |
| L5 | 💎 Diamond | Daily Hard 200 ครั้ง | 3000 | 5000 | ACH_DAILY_M3_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_daily_hard_count
  FROM user_game_history WHERE user_id = p_user_id
    AND mode = 'daily' AND level IN ('hard'::difficulty_enum, 'hard-expert'::difficulty_enum);
```

**Status:** ⏳ ยังไม่ได้ implement
