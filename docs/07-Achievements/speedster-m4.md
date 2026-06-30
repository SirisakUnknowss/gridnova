# ⚡ Speedster — M4: Hard-Expert เร็วกว่า 15 นาที

**Group:** speedster | **Mission:** 4 | **ID prefix:** ACH_SPEEDSTER_M4

## เงื่อนไข
เล่น difficulty `hard-expert` เสร็จภายใน 15 นาที (900 วินาที) ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Hard-Expert <15min จำนวน 1 ครั้ง | 200 | 400 | ACH_SPEEDSTER_M4_L1 |
| L2 | 🥈 Silver | Hard-Expert <15min จำนวน 3 ครั้ง | 600 | 1200 | ACH_SPEEDSTER_M4_L2 |
| L3 | 🥇 Gold | Hard-Expert <15min จำนวน 10 ครั้ง | 1500 | 3000 | ACH_SPEEDSTER_M4_L3 |
| L4 | 💠 Platinum | Hard-Expert <15min จำนวน 20 ครั้ง | 3500 | 7000 | ACH_SPEEDSTER_M4_L4 |
| L5 | 💎 Diamond | Hard-Expert <15min จำนวน 50 ครั้ง | 8000 | 15000 | ACH_SPEEDSTER_M4_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_speed_he_count
  FROM user_game_history WHERE user_id = p_user_id
    AND level = 'hard-expert'::difficulty_enum AND time_seconds <= 900;
```

**Status:** ⏳ ยังไม่ได้ implement
