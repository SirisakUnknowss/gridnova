# ✨ Special — M2: Early Bird (ตื่นเช้า)

**Group:** special | **Mission:** 2 | **ID prefix:** ACH_SPECIAL_M2

## เงื่อนไข
เล่นเกมในช่วงเวลา 05:00–07:00 (เวลาไทย / Asia/Bangkok) ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | ตื่นเช้าเล่น 1 ครั้ง | 100 | 200 | ACH_SPECIAL_M2_L1 |
| L2 | 🥈 Silver | ตื่นเช้าเล่น 5 ครั้ง | 300 | 600 | ACH_SPECIAL_M2_L2 |
| L3 | 🥇 Gold | ตื่นเช้าเล่น 20 ครั้ง | 800 | 1500 | ACH_SPECIAL_M2_L3 |
| L4 | 💠 Platinum | ตื่นเช้าเล่น 50 ครั้ง | 2000 | 4000 | ACH_SPECIAL_M2_L4 |
| L5 | 💎 Diamond | ตื่นเช้าเล่น 100 ครั้ง | 5000 | 10000 | ACH_SPECIAL_M2_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_early_count
  FROM user_game_history WHERE user_id = p_user_id
    AND EXTRACT(HOUR FROM completed_at AT TIME ZONE 'Asia/Bangkok') BETWEEN 5 AND 6;
```

**Status:** ⏳ ยังไม่ได้ implement
