# 💸 Coin Sink Plan

> ต่อยอดจาก ROADMAP.md → NEXT → "ทำ coin sink"
> ตัวเลขจาก production DB (`sudoku-daily`) วันที่ 3 ก.ย. 2026
> ตัวเลข balance ของเกม ยึด [coin-economy.md](./coin-economy.md) เป็น source of truth

> ✅ **อัปเดต 3 ก.ย. 2026 (v1.11.0):** sink ตัวแรกขึ้นแล้ว — **Global Hearts + Infinite
> Hearts buff** (ดูรายละเอียดใน CLAUDE.md → Hearts System) ต่างจากไอเดีย "Refill Hearts"
> เดิมตรงที่ทำเป็น **ระบบพลังงาน global** (start โหมด gated เสียหัวใจ, ซื้อ infinite ราย
> ชั่วโมง 800/1,400/1,900/2,800) ซึ่งเป็น sink ที่ **ซื้อซ้ำได้** ตามหลักด้านล่าง · ยังเหลือ:
> อุด inflow (achievement drip), consumable ที่ค้าง, Mystery Box, Flex items, และการ์ด
> economy ใน /admin เพื่อวัด spend rate

---

## 📊 ทำไมต้องทำ (ตัวเลขจริง)

- **Spend rate 7 วัน = 8.9%** (เป้าเดิมในเอกสาร 70%)
- coin คงในระบบ **1,704,789** จาก 293 wallet · median 4,778 · p90 15,250 · max 57,035
- รายได้จริง **~1,530 coin/คน/วัน** (เอกสารเดิมประเมิน 260 — ต่ำกว่าจริง 6 เท่า)
- inflow 90.5% มาจาก `achievement_unlock` แหล่งเดียว (จ่ายครั้งเดียวจบ)
- **`continue_purchase` = 97.7% ของ coin ที่ถูกใช้ทั้งประวัติศาสตร์เกม** (94 ครั้ง, เฉลี่ย 1,666/ครั้ง)
- `purchase_item` = **4 ครั้งตลอดกาล ครั้งสุดท้าย 22 มิ.ย.** — ร้านตายมา 2 เดือนครึ่ง

**บทเรียนเดียวที่ข้อมูลบอก:** sink ที่ได้ผล = **ซื้อซ้ำได้ + ราคาหลักพัน + ขายตอนกำลังจะเสียของ**
(continue มีครบ 3 ข้อ) · ร้าน cosmetic ล้มเพราะเป็น unlock ถาวร ดูดครั้งเดียวจบ
→ ทิศทางที่เลือก: **เททรัพยากรไปที่ระบบหัวใจ (ซึ่งพิสูจน์แล้วว่าคนจ่าย) ก่อน แล้วค่อยขยายไป sink อื่น**

---

## 🧱 ชิ้นส่วนที่ต้องสร้างก่อน (blocker ร่วม)

หลาย sink ที่อยากทำใช้โครงเดียวกัน ถ้าสร้างครั้งเดียวจะปลดล็อกได้หลายอัน:

### A. ตาราง Timed Entitlements (บัฟมีวันหมดอายุ) — **ต้องมีก่อน #3, #5, และ coin_boost เดิม**
ตอนนี้ **ไม่มี** โครงนี้เลย — `coin_boost_2x` มีชื่อใน DB แต่ server ไม่มีที่เก็บ `expires_at`
```sql
CREATE TABLE user_active_effects (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  effect TEXT NOT NULL,          -- 'infinite_hearts' | 'coin_boost_2x' | 'flex_gold_name' | ...
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
- Server เป็นเจ้าของเวลาเสมอ (client แค่แสดงผล) — กันโกงด้วยการหมุนนาฬิกาเครื่อง
- RPC `grant_effect(user_id, effect, duration)` และ `has_active_effect(user_id, effect)`

### B. Consumable qty + `consume_item` RPC — **ต้องมีก่อน #2, #4**
`user_inventory` ตอนนี้เก็บแบบ "เป็นเจ้าของ/ไม่เป็นเจ้าของ" (unlock ถาวร)
ของกินได้ต้องมี `qty` + RPC ลดจำนวนตอนใช้ ไม่งั้นซื้อครั้งเดียวใช้ได้ตลอด = ไม่ใช่ sink

---

## 🗺️ ลำดับงาน (เรียงตามผลลัพธ์ต่อแรงที่ลง)

### 1. Refill Hearts / เติมหัวใจเต็มทันที — 💰 คุ้มสุด, แรงน้อยสุด
มันคือ **continue เวอร์ชันแพ็กเกจใหม่** — กลไก reset hearts มีอยู่แล้วใน `game.ts`
(`continueCost`, `DAILY_CONTINUE_COSTS`, `PRACTICE_CONTINUE_BASE`)
- เพิ่มปุ่ม "Refill to full — 500" ตอนใกล้ game over เป็นตัวเลือกคู่กับ continue เดิม
- **guardrail (กฎเดิมของโปรเจกต์ ห้ามแตะ):**
  - **Random = ห้ามขายเด็ดขาด** ("แพ้ 1 = streak รีเซ็ต" คือหัวใจของโหมด — กฎเดียวกับที่ห้าม continue ที่นั่น)
  - **Daily = ได้** แต่ `mistakes` (ตัวคิดคะแนน) ต้องไม่รีเซ็ต รีเซ็ตแค่ `livesLost` เท่านั้น
    (เหมือน continue ทุกประการ — ซื้อหัวใจไม่ใช่ซื้ออันดับ)
- effort: ~0.5 วัน

### 2. Streak Freeze (แช่แข็งสถิติ) — item มีอยู่แล้วใน DB
`item_streak_freeze` มีใน `shop_items` (200 coin) แต่ **ไม่มีโค้ดอ้างถึงเลย** — ซื้อไปไม่เกิดอะไร
- ทำ logic จริง: มี freeze ในคลัง → วันที่ขาด streak ระบบใช้ freeze อัตโนมัติแทนการรีเซ็ต
- ขึ้นราคา 200 → **800** (เทียบรายได้/วัน) · ต้องมี **B (qty + consume)** ก่อน
- **guardrail สำคัญ:** freeze ใช้กับ **daily streak (`currentStreak`) เท่านั้น**
  - **ห้ามใช้กับ Random win streak** (`random_mode_stats.current_win_streak`)
    เพราะ "แพ้ = รีเซ็ต" คือทั้งหมดของโหมด Random — freeze มันคือทำลายโหมดทางอ้อม
    (กฎเดียวกับ #1 และ continue) · ตอนคุณเขียน "Random win streak / login streak"
    ต้องแยกสองอันนี้ออกจากกัน — freeze ได้แค่ login/daily
- effort: ~1 วัน

### 3. Infinite Hearts (บัฟเล่นไม่อั้น 1h / 24h) — ต้องมี **A** ก่อน
- ราคา 1h ~800 · 24h ~2,000 (ตามที่คุณเสนอ) · เก็บใน `user_active_effects`
- **guardrail:**
  - **Practice = จุดขายหลัก** (เล่นยาววันหยุด ไม่ต้องห่วงหัวใจ) — สะอาด ไม่กระทบ leaderboard
  - **Daily = ได้** เพราะ `mistakes` ยังนับเข้าคะแนนอยู่ดี (เหมือน #1)
  - **Random / Time Attack = ห้าม** (ranked, และ Random = แพ้ 1 รีเซ็ต)
- โบนัส: พอมี A แล้ว `coin_boost_2x` เดิมที่ค้างอยู่จะทำงานได้ฟรีๆ ด้วยโครงเดียวกัน
- effort: ~1.5 วัน (ส่วนใหญ่คือสร้าง A)

### 4. Mystery Box / กาชาปอง — 🎯 sink สายสะสมที่แรงที่สุด
- 1,000–1,200 coin/กล่อง · **ซื้อซ้ำได้ไม่จำกัด** = คุณสมบัติที่ร้านปกติไม่มี
- ในกล่อง: cosmetic ระดับ rare/epic ที่ **หาซื้อตรงไม่ได้** (frame ขยับได้, สีบอร์ดพิเศษ, effect)
- ของซ้ำ → แปลงเป็น **dust** เอาไปแลกของ tier บนที่การันตี (กัน "เปิดได้ซ้ำแล้วเซ็ง")
- ต้องเพิ่ม tab `consumable`/`box` ใน `CATEGORY_TABS` (`src/ui/views/shop.ts:72`)
- effort: ~2–3 วัน

### 5. Flex Items / ป้ายอวดฐานะแบบเช่า — ต้องมี **A** + render leaderboard
- ชื่อทองบน leaderboard / มงกุฎหน้าชื่อ 7 วัน ~5,000 coin · หมดอายุแล้วต้องซื้อใหม่ = subscription กลายๆ
- ดูดกระเป๋า **p90/whale** โดยเฉพาะ (13 wallet ถือ ≥ 20,000 ตอนนี้ไม่มีอะไรให้ใช้เงิน)
- งานเพิ่ม: leaderboard ต้อง render cosmetic ต่อ user + เช็ก `has_active_effect`
- effort: ~2 วัน (บน A ที่สร้างแล้ว)

### 6. Entry Tickets / ตั๋วเข้า Challenge Mode — ⏳ ติด dependency
- ค่าเข้ารอบละ 100 coin, ชนะได้ XP/badge · เป็น sink เล็กที่ซื้อซ้ำได้ ดีมาก
- **แต่ Challenge mode เป็น "Planned — do not build yet" ใน CLAUDE.md** → ตั๋วต้องรอโหมดเกิดก่อน
- อย่าเพิ่งลงมือ · จดไว้ว่าเมื่อสร้าง Challenge ให้ผูก entry ticket ตั้งแต่แรก
- **ห้ามทำ entry ticket ให้ Time Attack** (ranked — ขายรอบเล่น = pay-to-win) ขาย cosmetic เส้นชัยแทน

---

## 🚫 กฎที่ห้ามแตะ

- **ห้าม reset ยอด coin รอบสอง** — เคยล้าง 584,626 (`economy_reset_2026`, 16 ก.ค.) แล้ว 7 สัปดาห์ยอดกลับขึ้น 1.7 ล้าน
  ถ้าต้องลดยอด ใช้ **Big Sale** ให้เขา*ใช้* ไม่ใช่*โดนริบ*
- **ห้ามขายพลัง/ความได้เปรียบใน Daily & Time Attack** (Daily ขายหัวใจได้เพราะ mistakes ยังนับ, แต่ห้ามขาย hint)
- **ห้ามแตะกลไก "แพ้ = รีเซ็ต" ของ Random** ไม่ว่าจะผ่าน continue, refill, infinite hearts, หรือ streak freeze
- **ห้าม buff coin reward เพื่อให้ของ "ซื้อไหว"** (inflation control เดิม) — แก้ที่ราคา/sink ไม่ใช่ที่ inflow

---

## 🔧 อุด inflow คู่ขนาน (ไม่งั้น sink ก็ตามไม่ทัน)
sink ไหนก็ดูด 1.5 ล้าน/14 วันไม่ไหวถ้า achievement ยังพิมพ์เงินเท่าเดิม
- จ่าย achievement เป็น **drip มีเพดาน/วัน** (เช่น 500/วัน) — ปลดได้เหมือนเดิม แต่ windfall 20 นาที
  กลายเป็นเหตุผลให้กลับมา · ความรู้สึกตอนปลดยังอยู่ครบ
- ทำคู่กับ #1–#3 ได้เลย ไม่ต้องรอ

---

## ✅ วัดผล (การ์ด Coin Economy ใน /admin — ทำเป็นอย่างแรก ~2 ชม.)
| ตัวชี้วัด | baseline | เป้า |
|---|---:|---:|
| Spend rate (7d) | 8.9% | ≥ 40% หลัง #1–#2 · ≥ 60% หลัง #4 |
| Median wallet | 4,778 | ≤ 3,000 โดยไม่ reset |
| `purchase_item` / สัปดาห์ | 0 | > 20 |
| สัดส่วน continue/refill ใน outflow | 97.7% | < 60% (แปลว่ามี sink อื่นทำงานจริง) |
