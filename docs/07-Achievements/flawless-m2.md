# ⭐ Flawless — M2: Easy ไม่ผิดเลย

**Group:** flawless | **Mission:** 2 | **ID prefix:** ACH_FLAWLESS_M2

## เงื่อนไข
เล่น difficulty `easy` โดยไม่ผิดเลย (`mistakes_count = 0`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Easy Flawless 1 ครั้ง | 100 | 200 | ACH_FLAWLESS_M2_L1 |
| L2 | 🥈 Silver | Easy Flawless 5 ครั้ง | 300 | 600 | ACH_FLAWLESS_M2_L2 |
| L3 | 🥇 Gold | Easy Flawless 20 ครั้ง | 800 | 1500 | ACH_FLAWLESS_M2_L3 |
| L4 | 💠 Platinum | Easy Flawless 50 ครั้ง | 2000 | 4000 | ACH_FLAWLESS_M2_L4 |
| L5 | 💎 Diamond | Easy Flawless 100 ครั้ง | 5000 | 10000 | ACH_FLAWLESS_M2_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_easy_flawless_count
  FROM user_game_history WHERE user_id = p_user_id
    AND mistakes_count = 0 AND level = 'easy'::difficulty_enum;
```

**Status:** ⏳ ยังไม่ได้ implement
