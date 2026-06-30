# ⭐ Flawless — M3: Hard ไม่ผิดเลย

**Group:** flawless | **Mission:** 3 | **ID prefix:** ACH_FLAWLESS_M3

## เงื่อนไข
เล่น difficulty `hard` หรือ `hard-expert` โดยไม่ผิดเลย (`mistakes_count = 0`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Hard Flawless 1 ครั้ง | 150 | 300 | ACH_FLAWLESS_M3_L1 |
| L2 | 🥈 Silver | Hard Flawless 5 ครั้ง | 400 | 800 | ACH_FLAWLESS_M3_L2 |
| L3 | 🥇 Gold | Hard Flawless 20 ครั้ง | 1000 | 2000 | ACH_FLAWLESS_M3_L3 |
| L4 | 💠 Platinum | Hard Flawless 50 ครั้ง | 2500 | 5000 | ACH_FLAWLESS_M3_L4 |
| L5 | 💎 Diamond | Hard Flawless 100 ครั้ง | 6000 | 12000 | ACH_FLAWLESS_M3_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_hard_flawless_count
  FROM user_game_history WHERE user_id = p_user_id
    AND mistakes_count = 0
    AND level IN ('hard'::difficulty_enum, 'hard-expert'::difficulty_enum);
```

**Status:** ⏳ ยังไม่ได้ implement
