# ✨ Special — M3: Weekend Warrior

**Group:** special | **Mission:** 3 | **ID prefix:** ACH_SPECIAL_M3

## เงื่อนไข
เล่นเกมในวันเสาร์และวันอาทิตย์ในสัปดาห์เดียวกัน (เวลาไทย) ให้ครบตามจำนวนสัปดาห์
(นับสัปดาห์ที่เล่นทั้ง Sat และ Sun)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Weekend ครบ 1 สัปดาห์ | 150 | 300 | ACH_SPECIAL_M3_L1 |
| L2 | 🥈 Silver | Weekend ครบ 5 สัปดาห์ | 400 | 800 | ACH_SPECIAL_M3_L2 |
| L3 | 🥇 Gold | Weekend ครบ 20 สัปดาห์ | 1000 | 2000 | ACH_SPECIAL_M3_L3 |
| L4 | 💠 Platinum | Weekend ครบ 50 สัปดาห์ | 2500 | 5000 | ACH_SPECIAL_M3_L4 |
| L5 | 💎 Diamond | Weekend ครบ 100 สัปดาห์ | 6000 | 12000 | ACH_SPECIAL_M3_L5 |

## SQL (check_and_grant_achievements)
```sql
WITH weekend_plays AS (
  SELECT
    DATE_TRUNC('week', completed_at AT TIME ZONE 'Asia/Bangkok') AS week_start,
    EXTRACT(DOW FROM completed_at AT TIME ZONE 'Asia/Bangkok') AS dow
  FROM user_game_history WHERE user_id = p_user_id
    AND EXTRACT(DOW FROM completed_at AT TIME ZONE 'Asia/Bangkok') IN (0, 6)
),
full_weekends AS (
  SELECT week_start FROM weekend_plays
  GROUP BY week_start
  HAVING COUNT(DISTINCT dow) = 2
)
SELECT COUNT(*) INTO v_full_weekend_count FROM full_weekends;
```

**Status:** ⏳ ยังไม่ได้ implement
