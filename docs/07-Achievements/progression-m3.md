# 📈 Progression — M3: Coins ถือครอง

**Group:** progression | **Mission:** 3 | **ID prefix:** ACH_PROG_M3

## เงื่อนไข
มีเหรียญในกระเป๋า (balance) ครบตามจำนวนพร้อมกัน (ดูจาก `user_wallet.coins`)

## ระดับ

| Level | Tier | เงื่อนไข | Coin | XP | Achievement ID |
|---|---|---|---|---|---|
| L1 | 🥉 Bronze | ถือ 100 เหรียญ | 0 | 100 | ACH_PROG_M3_L1 |
| L2 | 🥈 Silver | ถือ 500 เหรียญ | 0 | 300 | ACH_PROG_M3_L2 |
| L3 | 🥇 Gold | ถือ 2,000 เหรียญ | 0 | 1000 | ACH_PROG_M3_L3 |
| L4 | 💠 Platinum | ถือ 10,000 เหรียญ | 0 | 5000 | ACH_PROG_M3_L4 |
| L5 | 💎 Diamond | ถือ 50,000 เหรียญ | 0 | 20000 | ACH_PROG_M3_L5 |

> หมายเหตุ: รางวัล Coin = 0 เพราะถ้าให้ coin จะผ่านเกณฑ์เดิมซ้ำทันที

## SQL (check_and_grant_achievements)
```sql
SELECT coins INTO v_coins_held
  FROM user_wallet WHERE user_id = p_user_id;
```

**Status:** ⏳ ยังไม่ได้ implement
