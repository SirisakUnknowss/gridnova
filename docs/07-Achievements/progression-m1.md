# 📈 Progression — M1: Level

**Group:** progression | **Mission:** 1 | **ID prefix:** ACH_PROG_M1

## เงื่อนไข
ถึง Level ตามที่กำหนด (ดูจาก `user_progression.level`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | ถึง Level 5 | 200 | 400 | ACH_PROG_M1_L1 |
| L2 | 🥈 Silver | ถึง Level 10 | 500 | 1000 | ACH_PROG_M1_L2 |
| L3 | 🥇 Gold | ถึง Level 25 | 1500 | 3000 | ACH_PROG_M1_L3 |
| L4 | 💠 Platinum | ถึง Level 50 | 5000 | 10000 | ACH_PROG_M1_L4 |
| L5 | 💎 Diamond | ถึง Level 100 | 15000 | 30000 | ACH_PROG_M1_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT level INTO v_user_level
  FROM user_progression WHERE user_id = p_user_id;
```

**Status:** ⏳ ยังไม่ได้ implement
