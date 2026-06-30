# ✨ Special — M5: Consistent Player (เล่นหลายสัปดาห์)

**Group:** special | **Mission:** 5 | **ID prefix:** ACH_SPECIAL_M5

## เงื่อนไข
เล่นเกมครบตามจำนวนสัปดาห์ที่ต่างกัน (distinct ISO weeks เวลาไทย) ไม่จำเป็นต้องติดต่อกัน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | เล่นครบ 4 สัปดาห์ที่ต่างกัน | 150 | 300 | ACH_SPECIAL_M5_L1 |
| L2 | 🥈 Silver | เล่นครบ 12 สัปดาห์ที่ต่างกัน | 500 | 1000 | ACH_SPECIAL_M5_L2 |
| L3 | 🥇 Gold | เล่นครบ 26 สัปดาห์ที่ต่างกัน | 1500 | 3000 | ACH_SPECIAL_M5_L3 |
| L4 | 💠 Platinum | เล่นครบ 52 สัปดาห์ที่ต่างกัน | 5000 | 10000 | ACH_SPECIAL_M5_L4 |
| L5 | 💎 Diamond | เล่นครบ 104 สัปดาห์ที่ต่างกัน | 15000 | 30000 | ACH_SPECIAL_M5_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(DISTINCT DATE_TRUNC('week', completed_at AT TIME ZONE 'Asia/Bangkok'))
  INTO v_distinct_weeks
  FROM user_game_history WHERE user_id = p_user_id;
```

**Status:** ⏳ ยังไม่ได้ implement
