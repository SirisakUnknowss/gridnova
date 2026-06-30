# 🎮 Play — M3: Easy Games

**Group:** play | **Mission:** 3 | **ID prefix:** ACH_PLAY_M3

## เงื่อนไข
เล่น difficulty `easy` ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Easy 1 ครั้ง | 50 | 100 | ACH_PLAY_M3_L1 |
| L2 | 🥈 Silver | Easy 5 ครั้ง | 150 | 300 | ACH_PLAY_M3_L2 |
| L3 | 🥇 Gold | Easy 20 ครั้ง | 400 | 800 | ACH_PLAY_M3_L3 |
| L4 | 💠 Platinum | Easy 100 ครั้ง | 1000 | 2000 | ACH_PLAY_M3_L4 |
| L5 | 💎 Diamond | Easy 300 ครั้ง | 3000 | 5000 | ACH_PLAY_M3_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_easy_count
  FROM user_game_history WHERE user_id = p_user_id AND level = 'easy'::difficulty_enum;
```

**Status:** ⏳ ยังไม่ได้ implement
