# 🏆 Leaderboard — M1: ติด Top 100

**Group:** leaderboard | **Mission:** 1 | **ID prefix:** ACH_LB_M1

## เงื่อนไข
ได้อันดับ Top 100 ใน Daily Leaderboard ให้ครบตามจำนวนวัน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Top 100 จำนวน 1 วัน | 150 | 300 | ACH_LB_M1_L1 |
| L2 | 🥈 Silver | Top 100 จำนวน 5 วัน | 400 | 800 | ACH_LB_M1_L2 |
| L3 | 🥇 Gold | Top 100 จำนวน 20 วัน | 1000 | 2000 | ACH_LB_M1_L3 |
| L4 | 💠 Platinum | Top 100 จำนวน 50 วัน | 2500 | 5000 | ACH_LB_M1_L4 |
| L5 | 💎 Diamond | Top 100 จำนวน 100 วัน | 6000 | 12000 | ACH_LB_M1_L5 |

## SQL (check_and_grant_achievements)
```sql
WITH ranked AS (
  SELECT user_id, date,
    RANK() OVER (PARTITION BY date ORDER BY score DESC, time_seconds ASC) AS rnk
  FROM daily_leaderboard
)
SELECT COUNT(*) INTO v_top100_count
  FROM ranked WHERE user_id = p_user_id AND rnk <= 100;
```

**Status:** ⏳ ยังไม่ได้ implement
