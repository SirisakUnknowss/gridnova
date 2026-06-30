# 🎮 Play — M2: เล่น Practice

**Group:** play | **Mission:** 2 | **ID prefix:** ACH_PLAY_M2

## เงื่อนไข
เล่น Practice mode ให้ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Practice 1 ครั้ง | 50 | 100 | ACH_PLAY_M2_L1 |
| L2 | 🥈 Silver | Practice 10 ครั้ง | 150 | 300 | ACH_PLAY_M2_L2 |
| L3 | 🥇 Gold | Practice 50 ครั้ง | 400 | 800 | ACH_PLAY_M2_L3 |
| L4 | 💠 Platinum | Practice 200 ครั้ง | 1000 | 2000 | ACH_PLAY_M2_L4 |
| L5 | 💎 Diamond | Practice 500 ครั้ง | 3000 | 5000 | ACH_PLAY_M2_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_practice_count
  FROM user_game_history WHERE user_id = p_user_id AND mode = 'practice';
```

**Status:** ⏳ ยังไม่ได้ implement
