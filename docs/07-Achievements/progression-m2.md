# 📈 Progression — M2: Coins หาได้รวม

**Group:** progression | **Mission:** 2 | **ID prefix:** ACH_PROG_M2

## เงื่อนไข
หาเหรียญสะสมรวมตลอดกาลครบตามจำนวน (ดูจาก `user_wallet.total_earned`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | หาได้รวม 500 เหรียญ | 50 | 100 | ACH_PROG_M2_L1 |
| L2 | 🥈 Silver | หาได้รวม 2,000 เหรียญ | 200 | 400 | ACH_PROG_M2_L2 |
| L3 | 🥇 Gold | หาได้รวม 10,000 เหรียญ | 1000 | 2000 | ACH_PROG_M2_L3 |
| L4 | 💠 Platinum | หาได้รวม 50,000 เหรียญ | 5000 | 10000 | ACH_PROG_M2_L4 |
| L5 | 💎 Diamond | หาได้รวม 200,000 เหรียญ | 20000 | 40000 | ACH_PROG_M2_L5 |

## SQL (check_and_grant_achievements)
```sql
SELECT total_earned INTO v_total_earned
  FROM user_wallet WHERE user_id = p_user_id;
```

**Status:** ⏳ ยังไม่ได้ implement
