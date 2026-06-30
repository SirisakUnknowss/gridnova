# ⚡ Speedster — M5: Expert เร็วกว่า 25 นาที

**Group:** speedster | **Mission:** 5 | **ID prefix:** ACH_SPEEDSTER_M5

## เงื่อนไข
เล่น difficulty `expert` เสร็จภายใน 25 นาที (1500 วินาที) ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Expert <25min จำนวน 1 ครั้ง | 200 | 400 | ACH_SPEEDSTER_M5_L1 |
| L2 | 🥈 Silver | Expert <25min จำนวน 3 ครั้ง | 600 | 1200 | ACH_SPEEDSTER_M5_L2 |
| L3 | 🥇 Gold | Expert <25min จำนวน 10 ครั้ง | 1500 | 3000 | ACH_SPEEDSTER_M5_L3 |
| L4 | 💠 Platinum | Expert <25min จำนวน 20 ครั้ง | 3500 | 7000 | ACH_SPEEDSTER_M5_L4 |
| L5 | 💎 Diamond | Expert <25min จำนวน 50 ครั้ง | 8000 | 15000 | ACH_SPEEDSTER_M5_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_speed_expert_count
  FROM user_game_history WHERE user_id = p_user_id
    AND level = 'expert'::difficulty_enum AND time_seconds <= 1500;
```

**Status:** ⏳ ยังไม่ได้ implement
