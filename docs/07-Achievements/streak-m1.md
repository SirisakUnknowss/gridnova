# 🔥 Streak — M1: Streak ปัจจุบัน

**Group:** streak | **Mission:** 1 | **ID prefix:** ACH_STREAK_M1

## เงื่อนไข
มี current streak ติดต่อกันครบตามจำนวนวัน (ดูจาก `user_progression.current_streak`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Streak 3 วัน | 100 | 200 | ACH_STREAK_M1_L1 |
| L2 | 🥈 Silver | Streak 7 วัน | 300 | 600 | ACH_STREAK_M1_L2 |
| L3 | 🥇 Gold | Streak 14 วัน | 800 | 1500 | ACH_STREAK_M1_L3 |
| L4 | 💠 Platinum | Streak 30 วัน | 2000 | 4000 | ACH_STREAK_M1_L4 |
| L5 | 💎 Diamond | Streak 100 วัน | 5000 | 10000 | ACH_STREAK_M1_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT current_streak INTO v_current_streak
  FROM user_progression WHERE user_id = p_user_id;
```

**Status:** ⏳ ยังไม่ได้ implement
