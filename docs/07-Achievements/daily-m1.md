# 📅 Daily — M1: Daily Challenge รวม

**Group:** daily | **Mission:** 1 | **ID prefix:** ACH_DAILY_M1

## เงื่อนไข
เล่น Daily puzzle ให้ครบตามจำนวน (ไม่จำกัด difficulty)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Daily 1 วัน | 50 | 100 | ACH_DAILY_M1_L1 |
| L2 | 🥈 Silver | Daily 10 วัน | 150 | 300 | ACH_DAILY_M1_L2 |
| L3 | 🥇 Gold | Daily 30 วัน | 400 | 800 | ACH_DAILY_M1_L3 |
| L4 | 💠 Platinum | Daily 100 วัน | 1000 | 2000 | ACH_DAILY_M1_L4 |
| L5 | 💎 Diamond | Daily 365 วัน | 3000 | 5000 | ACH_DAILY_M1_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_daily_count
  FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily';
```

**Status:** ⏳ ยังไม่ได้ implement
