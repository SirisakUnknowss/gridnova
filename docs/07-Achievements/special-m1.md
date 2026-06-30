# ✨ Special — M1: Night Owl (เล่นดึก)

**Group:** special | **Mission:** 1 | **ID prefix:** ACH_SPECIAL_M1

## เงื่อนไข
เล่นเกมในช่วงเวลา 23:00–04:00 (เวลาไทย / Asia/Bangkok) ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | เล่นดึก 1 ครั้ง | 100 | 200 | ACH_SPECIAL_M1_L1 |
| L2 | 🥈 Silver | เล่นดึก 5 ครั้ง | 300 | 600 | ACH_SPECIAL_M1_L2 |
| L3 | 🥇 Gold | เล่นดึก 20 ครั้ง | 800 | 1500 | ACH_SPECIAL_M1_L3 |
| L4 | 💠 Platinum | เล่นดึก 50 ครั้ง | 2000 | 4000 | ACH_SPECIAL_M1_L4 |
| L5 | 💎 Diamond | เล่นดึก 100 ครั้ง | 5000 | 10000 | ACH_SPECIAL_M1_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_night_count
  FROM user_game_history WHERE user_id = p_user_id
    AND (
      EXTRACT(HOUR FROM completed_at AT TIME ZONE 'Asia/Bangkok') >= 23
      OR EXTRACT(HOUR FROM completed_at AT TIME ZONE 'Asia/Bangkok') <= 3
    );
```

**Status:** ⏳ ยังไม่ได้ implement
