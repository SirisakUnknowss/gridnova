# 📋 Quest — M2: Quest เล่น Daily

**Group:** quest | **Mission:** 2 | **ID prefix:** ACH_QUEST_M2

## เงื่อนไข
Claim Quest ประเภท `play_daily` ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Quest play_daily 1 ครั้ง | 50 | 100 | ACH_QUEST_M2_L1 |
| L2 | 🥈 Silver | Quest play_daily 5 ครั้ง | 150 | 300 | ACH_QUEST_M2_L2 |
| L3 | 🥇 Gold | Quest play_daily 20 ครั้ง | 400 | 800 | ACH_QUEST_M2_L3 |
| L4 | 💠 Platinum | Quest play_daily 50 ครั้ง | 1000 | 2000 | ACH_QUEST_M2_L4 |
| L5 | 💎 Diamond | Quest play_daily 100 ครั้ง | 3000 | 5000 | ACH_QUEST_M2_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_quest_daily_count
  FROM user_daily_quests WHERE user_id = p_user_id
    AND claimed_at IS NOT NULL AND quest_type = 'play_daily';
```

**Status:** ⏳ ยังไม่ได้ implement
