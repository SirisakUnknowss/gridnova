# 🏆 Leaderboard — M5: อันดับ 1

**Group:** leaderboard | **Mission:** 5 | **ID prefix:** ACH_LB_M5

## เงื่อนไข
ได้อันดับ #1 ใน Daily Leaderboard ให้ครบตามจำนวนวัน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | อันดับ 1 จำนวน 1 วัน | 1000 | 2000 | ACH_LB_M5_L1 |
| L2 | 🥈 Silver | อันดับ 1 จำนวน 3 วัน | 3000 | 6000 | ACH_LB_M5_L2 |
| L3 | 🥇 Gold | อันดับ 1 จำนวน 5 วัน | 7000 | 14000 | ACH_LB_M5_L3 |
| L4 | 💠 Platinum | อันดับ 1 จำนวน 10 วัน | 15000 | 30000 | ACH_LB_M5_L4 |
| L5 | 💎 Diamond | อันดับ 1 จำนวน 20 วัน | 30000 | 60000 | ACH_LB_M5_L5 |

## SQL (check_and_grant_achievements)
```sql
WITH ranked AS (
  SELECT user_id, date,
    RANK() OVER (PARTITION BY date ORDER BY score DESC, time_seconds ASC) AS rnk
  FROM daily_leaderboard
)
SELECT COUNT(*) INTO v_rank1_count
  FROM ranked WHERE user_id = p_user_id AND rnk = 1;
```

**Status:** ⏳ ยังไม่ได้ implement
