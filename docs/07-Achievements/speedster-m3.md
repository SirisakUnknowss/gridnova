# ⚡ Speedster — M3: Hard เร็วกว่า 10 นาที

**Group:** speedster | **Mission:** 3 | **ID prefix:** ACH_SPEEDSTER_M3

## เงื่อนไข
เล่น difficulty `hard` เสร็จภายใน 10 นาที (600 วินาที) ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Hard <10min จำนวน 1 ครั้ง | 150 | 300 | ACH_SPEEDSTER_M3_L1 |
| L2 | 🥈 Silver | Hard <10min จำนวน 5 ครั้ง | 400 | 800 | ACH_SPEEDSTER_M3_L2 |
| L3 | 🥇 Gold | Hard <10min จำนวน 15 ครั้ง | 1000 | 2000 | ACH_SPEEDSTER_M3_L3 |
| L4 | 💠 Platinum | Hard <10min จำนวน 30 ครั้ง | 2500 | 5000 | ACH_SPEEDSTER_M3_L4 |
| L5 | 💎 Diamond | Hard <10min จำนวน 50 ครั้ง | 6000 | 12000 | ACH_SPEEDSTER_M3_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_speed_hard_count
  FROM user_game_history WHERE user_id = p_user_id
    AND level = 'hard'::difficulty_enum AND time_seconds <= 600;
```

**Status:** ⏳ ยังไม่ได้ implement
