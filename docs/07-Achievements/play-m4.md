# 🎮 Play — M4: Hard Games

**Group:** play | **Mission:** 4 | **ID prefix:** ACH_PLAY_M4

## เงื่อนไข
เล่น difficulty `hard` หรือ `hard-expert` ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Hard 1 ครั้ง | 50 | 100 | ACH_PLAY_M4_L1 |
| L2 | 🥈 Silver | Hard 5 ครั้ง | 150 | 300 | ACH_PLAY_M4_L2 |
| L3 | 🥇 Gold | Hard 20 ครั้ง | 400 | 800 | ACH_PLAY_M4_L3 |
| L4 | 💠 Platinum | Hard 100 ครั้ง | 1000 | 2000 | ACH_PLAY_M4_L4 |
| L5 | 💎 Diamond | Hard 300 ครั้ง | 3000 | 5000 | ACH_PLAY_M4_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_hard_count
  FROM user_game_history WHERE user_id = p_user_id
    AND level IN ('hard'::difficulty_enum, 'hard-expert'::difficulty_enum);
```

**Status:** ⏳ ยังไม่ได้ implement
