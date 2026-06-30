# ⚡ Speedster — M1: Easy เร็วกว่า 3 นาที

**Group:** speedster | **Mission:** 1 | **ID prefix:** ACH_SPEEDSTER_M1

## เงื่อนไข
เล่น difficulty `easy` เสร็จภายใน 3 นาที (180 วินาที) ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Easy <3min จำนวน 1 ครั้ง | 100 | 200 | ACH_SPEEDSTER_M1_L1 |
| L2 | 🥈 Silver | Easy <3min จำนวน 5 ครั้ง | 300 | 600 | ACH_SPEEDSTER_M1_L2 |
| L3 | 🥇 Gold | Easy <3min จำนวน 20 ครั้ง | 800 | 1500 | ACH_SPEEDSTER_M1_L3 |
| L4 | 💠 Platinum | Easy <3min จำนวน 50 ครั้ง | 2000 | 4000 | ACH_SPEEDSTER_M1_L4 |
| L5 | 💎 Diamond | Easy <3min จำนวน 100 ครั้ง | 5000 | 10000 | ACH_SPEEDSTER_M1_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_speed_easy_count
  FROM user_game_history WHERE user_id = p_user_id
    AND level = 'easy'::difficulty_enum AND time_seconds <= 180;
```

**Status:** ⏳ ยังไม่ได้ implement
