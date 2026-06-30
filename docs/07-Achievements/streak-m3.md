# 🔥 Streak — M3: เล่นช่วงเช้า

**Group:** streak | **Mission:** 3 | **ID prefix:** ACH_STREAK_M3

## เงื่อนไข
เล่นเกมในช่วงเวลา 05:00–12:00 (เวลาไทย / Asia/Bangkok) ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | เล่นตอนเช้า 1 ครั้ง | 50 | 100 | ACH_STREAK_M3_L1 |
| L2 | 🥈 Silver | เล่นตอนเช้า 5 ครั้ง | 150 | 300 | ACH_STREAK_M3_L2 |
| L3 | 🥇 Gold | เล่นตอนเช้า 20 ครั้ง | 400 | 800 | ACH_STREAK_M3_L3 |
| L4 | 💠 Platinum | เล่นตอนเช้า 50 ครั้ง | 1000 | 2000 | ACH_STREAK_M3_L4 |
| L5 | 💎 Diamond | เล่นตอนเช้า 100 ครั้ง | 3000 | 5000 | ACH_STREAK_M3_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_morning_count
  FROM user_game_history WHERE user_id = p_user_id
    AND EXTRACT(HOUR FROM completed_at AT TIME ZONE 'Asia/Bangkok') BETWEEN 5 AND 11;
```

**Status:** ⏳ ยังไม่ได้ implement
