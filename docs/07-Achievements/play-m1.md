# 🎮 Play — M1: เล่นเกมทั้งหมด

**Group:** play | **Mission:** 1 | **ID prefix:** ACH_PLAY_M1

## เงื่อนไข
เล่นเกมให้ครบตามจำนวน (นับทุก mode และทุก difficulty)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | เล่น 1 ครั้ง | 50 | 100 | ACH_PLAY_M1_L1 |
| L2 | 🥈 Silver | เล่น 10 ครั้ง | 150 | 300 | ACH_PLAY_M1_L2 |
| L3 | 🥇 Gold | เล่น 50 ครั้ง | 400 | 800 | ACH_PLAY_M1_L3 |
| L4 | 💠 Platinum | เล่น 200 ครั้ง | 1000 | 2000 | ACH_PLAY_M1_L4 |
| L5 | 💎 Diamond | เล่น 500 ครั้ง | 3000 | 5000 | ACH_PLAY_M1_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_total_games
  FROM user_game_history WHERE user_id = p_user_id;
```

**Status:** ⏳ ยังไม่ได้ implement
