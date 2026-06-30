# 🏆 Leaderboard — M4: ติด Top 3

**Group:** leaderboard | **Mission:** 4 | **ID prefix:** ACH_LB_M4

## เงื่อนไข
ได้อันดับ Top 3 (🥇🥈🥉) ใน Daily Leaderboard ให้ครบตามจำนวนวัน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Top 3 จำนวน 1 วัน | 500 | 1000 | ACH_LB_M4_L1 |
| L2 | 🥈 Silver | Top 3 จำนวน 3 วัน | 1500 | 3000 | ACH_LB_M4_L2 |
| L3 | 🥇 Gold | Top 3 จำนวน 5 วัน | 3500 | 7000 | ACH_LB_M4_L3 |
| L4 | 💠 Platinum | Top 3 จำนวน 10 วัน | 8000 | 15000 | ACH_LB_M4_L4 |
| L5 | 💎 Diamond | Top 3 จำนวน 20 วัน | 20000 | 40000 | ACH_LB_M4_L5 |

## SQL (check_and_grant_achievements)
```sql
WITH ranked AS (
  SELECT user_id, date,
    RANK() OVER (PARTITION BY date ORDER BY score DESC, time_seconds ASC) AS rnk
  FROM daily_leaderboard
)
SELECT COUNT(*) INTO v_top3_count
  FROM ranked WHERE user_id = p_user_id AND rnk <= 3;
```

**Status:** ⏳ ยังไม่ได้ implement
