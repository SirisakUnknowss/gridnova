# ✨ Special — M4: Dedicated Player (เล่นหลายวัน)

**Group:** special | **Mission:** 4 | **ID prefix:** ACH_SPECIAL_M4

## เงื่อนไข
เล่นเกมครบตามจำนวนวันที่ต่างกัน (distinct calendar days เวลาไทย) ไม่จำเป็นต้องติดต่อกัน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | เล่นครบ 7 วันที่ต่างกัน | 100 | 200 | ACH_SPECIAL_M4_L1 |
| L2 | 🥈 Silver | เล่นครบ 30 วันที่ต่างกัน | 400 | 800 | ACH_SPECIAL_M4_L2 |
| L3 | 🥇 Gold | เล่นครบ 100 วันที่ต่างกัน | 1500 | 3000 | ACH_SPECIAL_M4_L3 |
| L4 | 💠 Platinum | เล่นครบ 200 วันที่ต่างกัน | 5000 | 10000 | ACH_SPECIAL_M4_L4 |
| L5 | 💎 Diamond | เล่นครบ 365 วันที่ต่างกัน | 15000 | 30000 | ACH_SPECIAL_M4_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(DISTINCT DATE(completed_at AT TIME ZONE 'Asia/Bangkok'))
  INTO v_distinct_days
  FROM user_game_history WHERE user_id = p_user_id;
```

**Status:** ⏳ ยังไม่ได้ implement
