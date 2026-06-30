# 📈 Progression — M5: สะสม Items รวม

**Group:** progression | **Mission:** 5 | **ID prefix:** ACH_PROG_M5

## เงื่อนไข
เป็นเจ้าของ item ใน inventory รวมครบตามจำนวน (ทุก category: theme, background, board_color, avatar)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | มี Item รวม 1 อัน | 100 | 200 | ACH_PROG_M5_L1 |
| L2 | 🥈 Silver | มี Item รวม 5 อัน | 300 | 600 | ACH_PROG_M5_L2 |
| L3 | 🥇 Gold | มี Item รวม 10 อัน | 800 | 1500 | ACH_PROG_M5_L3 |
| L4 | 💠 Platinum | มี Item รวม 20 อัน | 2000 | 4000 | ACH_PROG_M5_L4 |
| L5 | 💎 Diamond | มี Item รวม 30 อัน | 5000 | 10000 | ACH_PROG_M5_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT COUNT(*) INTO v_inventory_count
  FROM user_inventory WHERE user_id = p_user_id;
```

**Status:** ⏳ ยังไม่ได้ implement
