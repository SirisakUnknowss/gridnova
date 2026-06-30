# 🏆 Leaderboard — M3: ติด Top 10

**Group:** leaderboard | **Mission:** 3 | **ID prefix:** ACH_LB_M3

## เงื่อนไข
ได้อันดับ Top 10 ใน Daily Leaderboard ให้ครบตามจำนวนวัน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Top 10 จำนวน 1 วัน | 300 | 600 | ACH_LB_M3_L1 |
| L2 | 🥈 Silver | Top 10 จำนวน 3 วัน | 900 | 1800 | ACH_LB_M3_L2 |
| L3 | 🥇 Gold | Top 10 จำนวน 10 วัน | 2500 | 5000 | ACH_LB_M3_L3 |
| L4 | 💠 Platinum | Top 10 จำนวน 20 วัน | 5000 | 10000 | ACH_LB_M3_L4 |
| L5 | 💎 Diamond | Top 10 จำนวน 50 วัน | 12000 | 25000 | ACH_LB_M3_L5 |

## SQL (check_and_grant_achievements)
```sql
WITH ranked AS (
  SELECT user_id, date,
    RANK() OVER (PARTITION BY date ORDER BY score DESC, time_seconds ASC) AS rnk
  FROM daily_leaderboard
)
SELECT COUNT(*) INTO v_top10_count
  FROM ranked WHERE user_id = p_user_id AND rnk <= 10;
```

**Status:** ⏳ ยังไม่ได้ implement
