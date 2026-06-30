# ⚡ Speedster — M2: Medium เร็วกว่า 5 นาที

**Group:** speedster | **Mission:** 2 | **ID prefix:** ACH_SPEEDSTER_M2

## เงื่อนไข
เล่น difficulty `medium` หรือ `easy-medium` เสร็จภายใน 5 นาที (300 วินาที) ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Medium <5min จำนวน 1 ครั้ง | 100 | 200 | ACH_SPEEDSTER_M2_L1 |
| L2 | 🥈 Silver | Medium <5min จำนวน 5 ครั้ง | 300 | 600 | ACH_SPEEDSTER_M2_L2 |
| L3 | 🥇 Gold | Medium <5min จำนวน 20 ครั้ง | 800 | 1500 | ACH_SPEEDSTER_M2_L3 |
| L4 | 💠 Platinum | Medium <5min จำนวน 50 ครั้ง | 2000 | 4000 | ACH_SPEEDSTER_M2_L4 |
| L5 | 💎 Diamond | Medium <5min จำนวน 100 ครั้ง | 5000 | 10000 | ACH_SPEEDSTER_M2_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_speed_medium_count
  FROM user_game_history WHERE user_id = p_user_id
    AND level IN ('medium'::difficulty_enum, 'easy-medium'::difficulty_enum)
    AND time_seconds <= 300;
```

**Status:** ⏳ ยังไม่ได้ implement
