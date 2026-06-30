# 📈 Progression — M4: สะสม Theme

**Group:** progression | **Mission:** 4 | **ID prefix:** ACH_PROG_M4

## เงื่อนไข
เป็นเจ้าของ Theme ครบตามจำนวน (ดูจาก `user_inventory` WHERE item_id LIKE 'theme_%')

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | มี Theme 1 อัน | 100 | 200 | ACH_PROG_M4_L1 |
| L2 | 🥈 Silver | มี Theme 3 อัน | 300 | 600 | ACH_PROG_M4_L2 |
| L3 | 🥇 Gold | มี Theme 5 อัน | 800 | 1500 | ACH_PROG_M4_L3 |
| L4 | 💠 Platinum | มี Theme 8 อัน | 2000 | 4000 | ACH_PROG_M4_L4 |
| L5 | 💎 Diamond | มี Theme ครบทุกอัน (11 อัน) | 5000 | 10000 | ACH_PROG_M4_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_theme_count
  FROM user_inventory WHERE user_id = p_user_id AND item_id LIKE 'theme_%';
```

**Status:** ⏳ ยังไม่ได้ implement
