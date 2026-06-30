# ⭐ Flawless — M1: ไม่ผิดเลย (รวม)

**Group:** flawless | **Mission:** 1 | **ID prefix:** ACH_FLAWLESS_M1

## เงื่อนไข
เล่นเกมโดยไม่ผิดเลย (`mistakes_count = 0`) ให้ครบตามจำนวน (ทุก mode / ทุก difficulty)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Flawless 1 ครั้ง | 100 | 200 | ACH_FLAWLESS_M1_L1 |
| L2 | 🥈 Silver | Flawless 5 ครั้ง | 300 | 600 | ACH_FLAWLESS_M1_L2 |
| L3 | 🥇 Gold | Flawless 20 ครั้ง | 800 | 1500 | ACH_FLAWLESS_M1_L3 |
| L4 | 💠 Platinum | Flawless 50 ครั้ง | 2000 | 4000 | ACH_FLAWLESS_M1_L4 |
| L5 | 💎 Diamond | Flawless 100 ครั้ง | 5000 | 10000 | ACH_FLAWLESS_M1_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_flawless_count
  FROM user_game_history WHERE user_id = p_user_id AND mistakes_count = 0;
```

**Status:** ⏳ ยังไม่ได้ implement
