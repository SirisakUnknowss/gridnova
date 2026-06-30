# 📋 Quest — M3: Quest ไม่ผิด

**Group:** quest | **Mission:** 3 | **ID prefix:** ACH_QUEST_M3

## เงื่อนไข
Claim Quest ประเภท `win_no_mistake` ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Quest win_no_mistake 1 ครั้ง | 100 | 200 | ACH_QUEST_M3_L1 |
| L2 | 🥈 Silver | Quest win_no_mistake 5 ครั้ง | 300 | 600 | ACH_QUEST_M3_L2 |
| L3 | 🥇 Gold | Quest win_no_mistake 20 ครั้ง | 800 | 1500 | ACH_QUEST_M3_L3 |
| L4 | 💠 Platinum | Quest win_no_mistake 50 ครั้ง | 2000 | 4000 | ACH_QUEST_M3_L4 |
| L5 | 💎 Diamond | Quest win_no_mistake 100 ครั้ง | 5000 | 10000 | ACH_QUEST_M3_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_quest_nomistake_count
  FROM user_daily_quests WHERE user_id = p_user_id
    AND claimed_at IS NOT NULL AND quest_type = 'win_no_mistake';
```

**Status:** ⏳ ยังไม่ได้ implement
