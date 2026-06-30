# 🔥 Streak — M2: Streak สูงสุดตลอดกาล

**Group:** streak | **Mission:** 2 | **ID prefix:** ACH_STREAK_M2

## เงื่อนไข
มี longest streak ตลอดกาลครบตามจำนวนวัน (ดูจาก `user_progression.longest_streak`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Longest streak 3 วัน | 100 | 200 | ACH_STREAK_M2_L1 |
| L2 | 🥈 Silver | Longest streak 7 วัน | 300 | 600 | ACH_STREAK_M2_L2 |
| L3 | 🥇 Gold | Longest streak 30 วัน | 800 | 1500 | ACH_STREAK_M2_L3 |
| L4 | 💠 Platinum | Longest streak 100 วัน | 2000 | 4000 | ACH_STREAK_M2_L4 |
| L5 | 💎 Diamond | Longest streak 365 วัน | 5000 | 10000 | ACH_STREAK_M2_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT longest_streak INTO v_longest_streak
  FROM user_progression WHERE user_id = p_user_id;
```

**Status:** ⏳ ยังไม่ได้ implement
