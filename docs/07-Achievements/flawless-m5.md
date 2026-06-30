# ⭐ Flawless — M5: Daily ไม่ผิดเลย (ซ้ำกับ daily-m4)

**Group:** flawless | **Mission:** 5 | **ID prefix:** ACH_FLAWLESS_M5

## เงื่อนไข
เล่น Daily puzzle โดยไม่ผิดเลย (`mistakes_count = 0`) — นับ Daily mode เท่านั้น
> หมายเหตุ: ซ้อนกับ daily-m4 (ACH_DAILY_M4) แนะนำให้ใช้ ID ร่วมกัน หรือ mission นี้เป็น "Daily + ไม่ผิด + ไม่ hint"

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Daily Flawless+Pure 1 ครั้ง | 200 | 400 | ACH_FLAWLESS_M5_L1 |
| L2 | 🥈 Silver | Daily Flawless+Pure 5 ครั้ง | 600 | 1200 | ACH_FLAWLESS_M5_L2 |
| L3 | 🥇 Gold | Daily Flawless+Pure 20 ครั้ง | 1500 | 3000 | ACH_FLAWLESS_M5_L3 |
| L4 | 💠 Platinum | Daily Flawless+Pure 50 ครั้ง | 3500 | 7000 | ACH_FLAWLESS_M5_L4 |
| L5 | 💎 Diamond | Daily Flawless+Pure 100 ครั้ง | 8000 | 15000 | ACH_FLAWLESS_M5_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_daily_perfect_pure_count
  FROM user_game_history WHERE user_id = p_user_id
    AND mode = 'daily' AND mistakes_count = 0 AND hints_used = 0;
```

**Status:** ⏳ ยังไม่ได้ implement
