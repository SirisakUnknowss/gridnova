# 📋 Quest — M1: Quest รวม

**Group:** quest | **Mission:** 1 | **ID prefix:** ACH_QUEST_M1

## เงื่อนไข
ทำ Daily Quest สำเร็จและ claim รางวัลครบตามจำนวน (ทุกประเภท Quest)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | Claim Quest 1 ครั้ง | 50 | 100 | ACH_QUEST_M1_L1 |
| L2 | 🥈 Silver | Claim Quest 10 ครั้ง | 150 | 300 | ACH_QUEST_M1_L2 |
| L3 | 🥇 Gold | Claim Quest 50 ครั้ง | 400 | 800 | ACH_QUEST_M1_L3 |
| L4 | 💠 Platinum | Claim Quest 200 ครั้ง | 1000 | 2000 | ACH_QUEST_M1_L4 |
| L5 | 💎 Diamond | Claim Quest 500 ครั้ง | 3000 | 5000 | ACH_QUEST_M1_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_quest_count
  FROM user_daily_quests WHERE user_id = p_user_id AND claimed_at IS NOT NULL;
```

**Status:** ⏳ ยังไม่ได้ implement
