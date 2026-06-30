# 🔥 Streak — M4: เล่นช่วงบ่าย

**Group:** streak | **Mission:** 4 | **ID prefix:** ACH_STREAK_M4

## เงื่อนไข
เล่นเกมในช่วงเวลา 12:00–20:00 (เวลาไทย / Asia/Bangkok) ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | เล่นตอนบ่าย 1 ครั้ง | 50 | 100 | ACH_STREAK_M4_L1 |
| L2 | 🥈 Silver | เล่นตอนบ่าย 5 ครั้ง | 150 | 300 | ACH_STREAK_M4_L2 |
| L3 | 🥇 Gold | เล่นตอนบ่าย 20 ครั้ง | 400 | 800 | ACH_STREAK_M4_L3 |
| L4 | 💠 Platinum | เล่นตอนบ่าย 50 ครั้ง | 1000 | 2000 | ACH_STREAK_M4_L4 |
| L5 | 💎 Diamond | เล่นตอนบ่าย 100 ครั้ง | 3000 | 5000 | ACH_STREAK_M4_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_afternoon_count
  FROM user_game_history WHERE user_id = p_user_id
    AND EXTRACT(HOUR FROM completed_at AT TIME ZONE 'Asia/Bangkok') BETWEEN 12 AND 19;
```

**Status:** ⏳ ยังไม่ได้ implement
