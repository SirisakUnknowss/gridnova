# 🎮 Play — M5: Expert Games

**Group:** play | **Mission:** 5 | **ID prefix:** ACH_PLAY_M5

## เงื่อนไข
เล่น difficulty `expert` ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Expert 1 ครั้ง | 50 | 100 | ACH_PLAY_M5_L1 |
| L2 | 🥈 Silver | Expert 5 ครั้ง | 150 | 300 | ACH_PLAY_M5_L2 |
| L3 | 🥇 Gold | Expert 20 ครั้ง | 400 | 800 | ACH_PLAY_M5_L3 |
| L4 | 💠 Platinum | Expert 100 ครั้ง | 1000 | 2000 | ACH_PLAY_M5_L4 |
| L5 | 💎 Diamond | Expert 300 ครั้ง | 3000 | 5000 | ACH_PLAY_M5_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_expert_count
  FROM user_game_history WHERE user_id = p_user_id AND level = 'expert'::difficulty_enum;
```

**Status:** ⏳ ยังไม่ได้ implement
