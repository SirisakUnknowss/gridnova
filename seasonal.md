# GridNova — Season Mode (Architecture)

> อัปเดต: **2026-08-23** · สถานะ: **ออกแบบแล้ว ยังไม่ได้สร้าง**
> เอกสาร dev-facing (เหมือน `CHANGELOG.md` / `ROADMAP.md`) — ข้อความในแอปยังต้องเป็นอังกฤษตาม `CLAUDE.md` ข้อ 8
> ประวัติ: เดิมเป็น design notes จาก brainstorm "Season 1 Star Voyage" (โมเดลสะสมแต้มจากทุกโหมด + daily cap 750 แต้ม)
> **โมเดลนั้นถูกแทนที่แล้ว** ด้วยระบบ 10 ด่าน/วัน ด้านล่าง · ส่วนโครงสร้างรางวัลยังใช้แนวคิดเดิม

---

## รูปแบบที่ตัดสินใจแล้ว

| หัวข้อ | สรุป |
|---|---|
| โครงสร้าง | **10 ด่าน/วัน** ไล่ระดับความยาก ด่าน 1 ง่ายสุด → ด่าน 10 ยากสุด |
| โจทย์ | **fix เหมือนกันทุกคน** ทั้งโลก · **เปลี่ยนใหม่ทุกวัน** |
| การปลดล็อก | ต้องจบด่าน N ถึงเล่นด่าน N+1 ได้ (เรียงลำดับ ห้ามข้าม) |
| ความยาวซีซั่น | **14 วัน** |
| โหมดที่ใช้ | **โหมดใหม่ ไม่ใช้ Random mode เดิม** |
| Anti-cheat | เก็บทุก move + replay ฝั่ง server เหมือน Daily |
| เข้าร่วม | แชร์ลง social → ได้ code · ของจริงให้ Top 5 ประกาศผลทางเพจ FB |

### 10 ด่าน/วัน = daily cap ในตัว

ข้อกำหนดเดิม "เล่นได้วันละไม่เกิน 10 เกม" **ไม่ต้องเขียน logic แยกอีกแล้ว** — เพราะวันหนึ่งมีให้เล่นแค่
10 ด่าน และแต่ละด่านส่งได้ครั้งเดียว เพดานจึงถูกบังคับโดยโครงสร้างของข้อมูลเอง ไม่ใช่โดยตัวนับที่ต้องคอยกันคนโกง

### progress รีเซ็ตทุกวัน

"เปลี่ยนทุกวัน" + "ต้องไล่จากด่าน 1" = ทุกวันคือ run ใหม่ เริ่มที่ด่าน 1 เสมอ
คนที่เมื่อวานไปถึงด่าน 6 วันนี้ก็เริ่มด่าน 1 ใหม่ (แต่เป็นคนละโจทย์กับเมื่อวาน)
คะแนนซีซั่น = ผลรวมของทั้ง 14 วัน → **มาเล่นทุกวันสำคัญกว่าเก่งวันเดียว** ซึ่งเป็นเป้าหมายเดิมของ season ตั้งแต่ต้น

### บันไดความยาก (เสนอ)

difficulty มี 7 ระดับ แต่ด่านมี 10 → ซ้ำระดับล่างได้ และ**ควรซ้ำ** เพราะข้อมูล 23 ส.ค. บอกว่า
~89% ของคนที่เข้ามาเล่นไม่จบแม้แต่ด่านเดียว ถ้าด่าน 1 ไม่ง่ายจริง ระบบทั้งหมดนี้จะไม่มีใครได้เห็นด่าน 2

| ด่าน | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| difficulty | easy | easy | easy-medium | easy-medium | medium | medium | medium-hard | hard | hard-expert | expert |
| clues | 45 | 45 | 40 | 40 | 35 | 35 | 32 | 28 | 25 | 22 |

---

## Schema

```sql
-- โจทย์: 10 แถวต่อวัน generate ล่วงหน้าโดย cron
season_puzzles (
  season_date     DATE,
  stage           INTEGER,          -- 1..10
  difficulty      difficulty_enum,
  clues           INTEGER,
  puzzle          CHAR(81),
  solution        CHAR(81),         -- ห้ามหลุดถึง client
  solution_hash   TEXT,
  generation_seed TEXT,
  PRIMARY KEY (season_date, stage)
)

-- ซีซั่น 14 วัน
seasons (id, name, starts_on, ends_on, status, fb_post_url, created_at)

-- ใครเข้าร่วม + code ที่ได้จากการแชร์
season_entries (season_id, user_id, entry_code, share_channel, joined_at,
                UNIQUE (season_id, user_id), UNIQUE (entry_code))

-- ตั๋วต่อ 1 ด่าน: server เป็นคนออกให้ = จุดอ้างอิงเวลาเริ่มที่ปลอมไม่ได้
season_tickets (id, user_id, season_date, stage, issued_at, consumed_at,
                UNIQUE (user_id, season_date, stage))

-- ผลที่ validate แล้ว 1 แถว = 1 ด่านที่ผ่าน
season_stage_results (id, user_id, season_date, stage, score, time_seconds,
                      mistakes, hints_used, completed_at,
                      UNIQUE (user_id, season_date, stage))
```

`UNIQUE (user_id, season_date, stage)` ทั้งบน tickets และ results คือหัวใจ — มันบังคับ
"ด่านละครั้งต่อวัน" ที่ระดับ constraint ของ DB ไม่ใช่ที่ระดับโค้ดที่ลืมเช็คได้

**ไม่ต้องมี** view สาธารณะแบบ `daily_puzzles_public` — ดูหัวข้อถัดไป

---

## ทำไมโจทย์ต้องส่งผ่าน edge function เท่านั้น

`daily_puzzles_public` เปิดโจทย์ของวันให้ทุกคนอ่านได้ ซึ่งโอเคสำหรับ Daily เพราะมีโจทย์เดียว
แต่ Season **ห้ามทำแบบนั้น**: ถ้าเปิดทั้ง 10 ด่านตั้งแต่เที่ยงคืน คนจะดึงด่าน 10 ไปนั่งแก้สบาย ๆ
ตอนไหนก็ได้ แล้วค่อยไล่ด่าน 1–9 ทีหลังและส่งด่าน 10 ด้วยเวลาที่สวยเกินจริง

โจทย์แต่ละด่านจึงถูกส่งให้**ตอนกด Play เท่านั้น** และเฉพาะด่านที่ปลดล็อกแล้วจริง

---

## Edge Functions

### `generate-season-puzzles` (cron, service-role)

ก๊อป `generate-daily-puzzle` มาเกือบทั้งดุ้น — generator, `countSolutions()`, seeded RNG ใช้ซ้ำได้หมด
ต่างแค่วน `stage 1..10` ต่อวัน และใช้ seed `season:{date}:{stage}`
seed คงที่ = โจทย์เหมือนกันทุกคน และ generate ซ้ำได้ผลเดิมถ้าต้องกู้ข้อมูล

### `start-season-stage` (auth)

```
1. มี season_entries ของซีซั่นที่ active ไหม     → NOT_ENTERED
2. ด่านนี้ผ่านไปแล้วหรือยัง                       → ALREADY_CLEARED
3. ด่าน N > 1: มี result ของด่าน N-1 วันนี้ไหม     → STAGE_LOCKED
4. upsert season_tickets (issued_at = now() ของ server)
5. คืน puzzle (ไม่มี solution) + ticket_id
```

### `submit-season-stage` (auth)

```
1. หา ticket → ไม่มี = ไม่เคยกด Play      → NO_TICKET
2. เช็ค unlock ซ้ำอีกรอบ                  → STAGE_LOCKED
3. replay ทุก move เทียบ solution:
   TIME_MISMATCH · TOO_FAST · TOO_SLOW · TIME_NON_MONOTONIC
   MOVE_AFTER_END · MODIFIED_GIVEN · SOLUTION_MISMATCH
   HINT_COUNT_MISMATCH · MISTAKE_COUNT_MISMATCH
4. insert season_stage_results (unique กัน submit ซ้ำ)
```

**จุดที่แข็งกว่า Daily:** ตอนนี้ `submit-daily-score` รับ `started_at` **จาก client**
(`supabase/functions/submit-daily-score/index.ts:121`) แล้วเทียบกับ `completed_at` ที่มาจาก client
เหมือนกัน — `TIME_MISMATCH` จึงเช็คได้แค่ว่าตัวเลขสองตัวที่ผู้เล่นส่งมา "สอดคล้องกันเอง" ไหม
ปลอมทั้งคู่ให้ตรงกันได้ไม่ยาก · Season ใช้ `season_tickets.issued_at` ที่ server เขียนเองเป็นตัวตั้ง
→ เวลาเริ่มปลอมไม่ได้

---

## Client

| ส่วน | ทำอะไร |
|---|---|
| `src/ui/views/season.ts` | หน้าใหม่: แผนที่ 10 ด่าน (ผ่าน / ปลดล็อก / ล็อก), countdown, อันดับตัวเอง, ปุ่มแชร์ |
| `src/ui/views/season-leaderboard.ts` | อันดับรวมของซีซั่น |
| `src/lib/api.ts` | `getSeasonToday()` · `startSeasonStage(stage)` · `submitSeasonStage(...)` · `getSeasonLeaderboard()` |
| bottom nav | แท็บ Season มีอยู่แล้ว (`coming soon`) → เปิดใช้งาน · **ยังคง 4 แท็บ** ตาม Hard Rule ข้อ 7 |

**เกมเพลย์ใช้ `mountGameView` เดิมได้เลย ไม่ต้องแก้แกน** — `src/ui/views/game.ts:105` เก็บ `moves`
พร้อม timestamp ทุก move อยู่แล้ว **ทุกโหมด** และส่งกลับใน `GameResult` แค่ตอนนี้มีเฉพาะ Daily ที่เอาไปใช้
· `stage?: number` ก็มีใน props อยู่แล้ว

สิ่งที่ต้องเพิ่มใน game view: `mode: 'season'` (ตอนนี้เป็น `'daily' | 'practice'`) เพื่อคุมกติกาต่อโหมด

---

## Scoring & Ranking

- คะแนนต่อด่าน: ใช้ `src/engine/scoring.ts` เดิม (base − เวลา − ผิด − hint + โบนัส)
- คะแนนของวัน = ผลรวมด่านที่ผ่านวันนั้น · คะแนนซีซั่น = ผลรวม 14 วัน
- ด่านยากให้ base สูงกว่า → คนที่ไปได้ลึกกว่าชนะคนที่เล่นแค่ด่านง่าย
- **tiebreak:** เวลารวมน้อยกว่าชนะ (คนที่เคลียร์ครบ 10 ทุกวันจะมีหลายคน)

---

## กติกาที่ตัดสินใจแล้ว (2026-08-23)

1. **แพ้แล้วเล่นต่อได้** — ไม่ล็อกด่าน ไม่จบวัน · เหตุผล: ต้องการให้ผู้เล่นอยู่ในเกมนาน ๆ

   **วิธีที่ทำให้ "เล่นได้ไม่จำกัด" กับ "วันละไม่เกิน 10 เกม" อยู่ด้วยกันได้:**
   **แพ้ = ไม่เกิดแถวผลลัพธ์เลย** · เขียน `season_stage_results` เฉพาะตอน**ผ่าน**ด่าน
   → ลองกี่รอบก็ได้ (engagement ตามที่ต้องการ) แต่คะแนนต่อวันยังตันที่ 10 ด่าน
   → `UNIQUE (user_id, season_date, stage)` ยังอยู่ตามเดิม และกลายเป็นตัวกันไม่ให้ไล่เล่นซ้ำเพื่อไต่คะแนน
   (ผ่านแล้วคือจบ ปั๊มคะแนนเดิมซ้ำไม่ได้)
   → `season_tickets` ต้องออกใหม่ได้เรื่อย ๆ · ย้าย `UNIQUE` ไปเป็น `(ticket_id)` บน results
   เพื่อกัน submit ซ้ำต่อหนึ่งตั๋ว

   ผลข้างเคียงที่ยอมรับ: คนที่ลองซ้ำเยอะจะไปได้ลึกกว่าคนที่ลองรอบเดียว — แต่แลกด้วยเวลา
   ไม่ใช่แลกด้วยคะแนนที่ปั๊มได้ไม่จำกัด
2. **Guest เล่นได้ 3 ด่านแรก แต่ไม่นับ ranking** — ต้อง login ถึงจะเก็บข้อมูล
   → ด่าน 1–3 เล่นได้โดยไม่ต้อง auth และ**ไม่เขียน** `season_stage_results`
   ด่าน 4 ขึ้นไปบังคับ login · เป็น conversion lever ที่ต่อกับ ROADMAP NOW ข้อ 4
3. **hint 3 ครั้ง ซื้อเพิ่มไม่ได้** — เหมือน Daily (โหมดที่มีอันดับต้องเท่ากันทุกคน)
4. **วันตัดรอบใช้ระบบเดิม (UTC)** — ด่านรีเซ็ต 07:00 น. เวลาไทย เหมือน Daily

## ยังต้องตัดสินใจ

5. **โครงสร้างรางวัล** (ยกมาจาก design เดิม ยังไม่สรุป) — ของจริงทุกซีซั่น = ส่งของ 26 รอบ/ปี
   จมแน่สำหรับทีมคนเดียว · เสนอ: ของจริงเฉพาะ Season 1 หรือ "Grand Champion" รายไตรมาส
   ซีซั่นปกติเป็นดิจิทัลล้วน (เหรียญ/ธีม/กรอบ/badge) ต้นทุน 0 ส่งอัตโนมัติ
6. **คนมาสายกลางซีซั่น** — FB promo ดึงคนเข้าเรื่อย ๆ คนเจอวันที่ 8 ตามไม่ทัน จะมี catch-up ไหม

---

## เรื่อง "ต้องไลก์ + แชร์ถึงมีสิทธิ์"

Facebook ไม่เปิดให้เช็คด้วยโปรแกรมว่า user ไลก์เพจ/โพสต์ไหน และปุ่มแชร์ไม่ส่งอะไรกลับมายืนยันว่าแชร์จริง
→ **"กดแชร์ → ได้ code" เป็น honor system เสมอ** ไม่ว่าจะเขียนโค้ดดีแค่ไหน

วิธีที่ใช้ได้จริงกับทีมคนเดียว: **เปิดให้เข้าร่วมฟรี แล้วตรวจเฉพาะตอนแจกของ** — ประกาศในกติกาว่า
ผู้ได้รางวัลต้องแสดงหลักฐานไลก์+แชร์ก่อนรับของ · ตรวจ 5 คน ไม่ใช่ 5,000 คน

ฝั่งวัดผลมีของพร้อมแล้ว: v1.9.0 เก็บ `utm_*` + `click_id_kind` + `app_hint` ครบ ลิงก์แชร์ที่ติด
`?utm_campaign=season1` วัดได้ทันทีว่ามีคนกดเข้ามาจริงกี่คน และในนั้น engaged กี่คน

---

## ลำดับการสร้าง

| # | งาน | แรง |
|---|---|---|
| 1 | migration: 5 ตาราง + RLS | ~2 ชม. |
| 2 | `generate-season-puzzles` + cron (ก๊อปจาก daily) | ~3 ชม. |
| 3 | `start-season-stage` + `submit-season-stage` | ~1 วัน |
| 4 | หน้า Season (แผนที่ด่าน + unlock state) | ~1 วัน |
| 5 | Season leaderboard | ~4 ชม. |
| 6 | share + entry code | ~4 ชม. |
| 7 | admin: สร้าง/ปิดซีซั่น + ดู Top 5 | ~4 ชม. |

รวม ~4–5 วันเต็ม

**ก่อนหน้านั้น:** ปิดช่องโหว่ `record_random_mode_result` (~ครึ่งวัน) — RPC ตัวนี้เป็น `SECURITY DEFINER`
ที่รับ `p_user_id` เป็นพารามิเตอร์ ใครก็ยิงรีเซ็ต streak ของคนอื่นได้ · เป็นคนละระบบกับ Season
แต่เปิดค้างอยู่บน production ตอนนี้
