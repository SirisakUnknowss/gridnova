# 🏆 Leaderboard — M2: ติด Top 50

**Group:** leaderboard | **Mission:** 2 | **ID prefix:** ACH_LB_M2

## เงื่อนไข
ได้อันดับ Top 50 ใน Daily Leaderboard ให้ครบตามจำนวนวัน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Top 50 จำนวน 1 วัน | 200 | 400 | ACH_LB_M2_L1 |
| L2 | 🥈 Silver | Top 50 จำนวน 5 วัน | 600 | 1200 | ACH_LB_M2_L2 |
| L3 | 🥇 Gold | Top 50 จำนวน 15 วัน | 1500 | 3000 | ACH_LB_M2_L3 |
| L4 | 💠 Platinum | Top 50 จำนวน 30 วัน | 3500 | 7000 | ACH_LB_M2_L4 |
| L5 | 💎 Diamond | Top 50 จำนวน 50 วัน | 8000 | 15000 | ACH_LB_M2_L5 |

## SQL (check_and_grant_achievements)
```sql
WITH ranked AS (
  SELECT user_id, date,
    RANK() OVER (PARTITION BY date ORDER BY score DESC, time_seconds ASC) AS rnk
  FROM daily_leaderboard
)
SELECT COUNT(*) INTO v_top50_count
  FROM ranked WHERE user_id = p_user_id AND rnk <= 50;
```

**Status:** ⏳ ยังไม่ได้ implement
