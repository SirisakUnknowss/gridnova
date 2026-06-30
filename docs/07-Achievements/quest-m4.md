# 📋 Quest — M4: Quest ไม่ใช้ Hint

**Group:** quest | **Mission:** 4 | **ID prefix:** ACH_QUEST_M4

## เงื่อนไข
Claim Quest ประเภท `win_no_hint` ครบตามจำนวน

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Quest win_no_hint 1 ครั้ง | 100 | 200 | ACH_QUEST_M4_L1 |
| L2 | 🥈 Silver | Quest win_no_hint 5 ครั้ง | 300 | 600 | ACH_QUEST_M4_L2 |
| L3 | 🥇 Gold | Quest win_no_hint 20 ครั้ง | 800 | 1500 | ACH_QUEST_M4_L3 |
| L4 | 💠 Platinum | Quest win_no_hint 50 ครั้ง | 2000 | 4000 | ACH_QUEST_M4_L4 |
| L5 | 💎 Diamond | Quest win_no_hint 100 ครั้ง | 5000 | 10000 | ACH_QUEST_M4_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_quest_nohint_count
  FROM user_daily_quests WHERE user_id = p_user_id
    AND claimed_at IS NOT NULL AND quest_type = 'win_no_hint';
```

**Status:** ⏳ ยังไม่ได้ implement
