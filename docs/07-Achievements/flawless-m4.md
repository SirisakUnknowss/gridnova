# ⭐ Flawless — M4: Expert ไม่ผิดเลย

**Group:** flawless | **Mission:** 4 | **ID prefix:** ACH_FLAWLESS_M4

## เงื่อนไข
เล่น difficulty `expert` โดยไม่ผิดเลย (`mistakes_count = 0`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Expert Flawless 1 ครั้ง | 200 | 400 | ACH_FLAWLESS_M4_L1 |
| L2 | 🥈 Silver | Expert Flawless 3 ครั้ง | 600 | 1200 | ACH_FLAWLESS_M4_L2 |
| L3 | 🥇 Gold | Expert Flawless 10 ครั้ง | 1500 | 3000 | ACH_FLAWLESS_M4_L3 |
| L4 | 💠 Platinum | Expert Flawless 25 ครั้ง | 3500 | 7000 | ACH_FLAWLESS_M4_L4 |
| L5 | 💎 Diamond | Expert Flawless 50 ครั้ง | 8000 | 15000 | ACH_FLAWLESS_M4_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_expert_flawless_count
  FROM user_game_history WHERE user_id = p_user_id
    AND mistakes_count = 0 AND level = 'expert'::difficulty_enum;
```

**Status:** ⏳ ยังไม่ได้ implement
