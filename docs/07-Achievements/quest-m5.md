# 📋 Quest — M5: Quest เร็ว

**Group:** quest | **Mission:** 5 | **ID prefix:** ACH_QUEST_M5

## เงื่อนไข
Claim Quest ประเภท `win_fast` ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Quest win_fast 1 ครั้ง | 100 | 200 | ACH_QUEST_M5_L1 |
| L2 | 🥈 Silver | Quest win_fast 5 ครั้ง | 300 | 600 | ACH_QUEST_M5_L2 |
| L3 | 🥇 Gold | Quest win_fast 20 ครั้ง | 800 | 1500 | ACH_QUEST_M5_L3 |
| L4 | 💠 Platinum | Quest win_fast 50 ครั้ง | 2000 | 4000 | ACH_QUEST_M5_L4 |
| L5 | 💎 Diamond | Quest win_fast 100 ครั้ง | 5000 | 10000 | ACH_QUEST_M5_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_quest_fast_count
  FROM user_daily_quests WHERE user_id = p_user_id
    AND claimed_at IS NOT NULL AND quest_type = 'win_fast';
```

**Status:** ⏳ ยังไม่ได้ implement
