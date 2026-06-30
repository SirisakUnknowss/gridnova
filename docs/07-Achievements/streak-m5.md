# 🔥 Streak — M5: เล่นวันหยุดสุดสัปดาห์

**Group:** streak | **Mission:** 5 | **ID prefix:** ACH_STREAK_M5

## เงื่อนไข
เล่นเกมในวันเสาร์หรือวันอาทิตย์ (เวลาไทย) ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | เล่น Weekend 1 ครั้ง | 50 | 100 | ACH_STREAK_M5_L1 |
| L2 | 🥈 Silver | เล่น Weekend 5 ครั้ง | 150 | 300 | ACH_STREAK_M5_L2 |
| L3 | 🥇 Gold | เล่น Weekend 20 ครั้ง | 400 | 800 | ACH_STREAK_M5_L3 |
| L4 | 💠 Platinum | เล่น Weekend 50 ครั้ง | 1000 | 2000 | ACH_STREAK_M5_L4 |
| L5 | 💎 Diamond | เล่น Weekend 100 ครั้ง | 3000 | 5000 | ACH_STREAK_M5_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_weekend_count
  FROM user_game_history WHERE user_id = p_user_id
    AND EXTRACT(DOW FROM completed_at AT TIME ZONE 'Asia/Bangkok') IN (0, 6);
-- DOW: 0=Sunday, 6=Saturday
```

**Status:** ⏳ ยังไม่ได้ implement
