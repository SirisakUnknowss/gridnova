# Changelog

## 1.11.0 — 2026-09-05

### Added
- **Hearts (global energy)**: ระบบหัวใจ global ผูกกับ account (0–5) เป็น coin sink ตัวใหม่ — กด start โหมด Daily/Random/Time Attack เสีย 1 ดวง ชนะได้คืน (แพ้/game over/ออกกลางคัน = เสียถาวร), Practice/Book ไม่คิด · หมดหัวใจ = เริ่มเกม gated ไม่ได้จนกว่าจะ regen/login/ซื้อ infinite · **คนละระบบกับ 3 mistakes ในเกม** (`mistakes`/`livesLost`) ซึ่งไม่เปลี่ยน
  - **Regen แยกตามชนิด account** (อ่าน `auth.users.is_anonymous`): member +1 ดวง/30 นาที เพดาน 5; guest ไม่ regen ตามเวลา แต่ reset เต็มทุกเที่ยงคืน UTC
  - **Guest ไม่มี auth session** (แอปตั้งใจไม่ `signInAnonymously` ตอน boot — จะ strip Bearer token) → หัวใจ guest เก็บใน `localStorage` (`gn_guest_hearts_v1`) ไม่ใช่ server · หมดแล้วต้อง login เพื่อเล่นต่อ (กระตุ้นสมัคร) · สมัครสำเร็จเรียก `refill_hearts_full` เติมเต็มทันที
  - **Infinite Hearts buff**: ซื้อด้วย coin รายชั่วโมง 1/2/3/5 ชม. = 800/1,400/1,900/2,800 · ช่วงบัฟ start ไม่กินหัวใจ · ซื้อซ้ำ = เวลาบวกทบ · member เท่านั้น (guest ไม่มี wallet ฝั่ง server)
  - **Server-authoritative ทั้งหมด**: ตาราง `user_hearts` (RLS อ่านเฉพาะของตัวเอง, เขียนผ่าน SECURITY DEFINER RPC เท่านั้น) + RPC `get_hearts` / `consume_heart` / `refund_heart` / `buy_infinite_hearts` / `refill_hearts_full` · `_refresh_hearts` lock `FOR UPDATE` กันกด start รัวสองทีแล้วหักซ้อน · client ไม่คำนวณยอดเอง กัน cheat นาฬิกา/ยอด
  - UI: pill หัวใจใน home header (แตะเปิด modal ซื้อ/สถานะ + countdown regen/บัฟสด), modal "Out of hearts" ตอนถูกบล็อก (guest เห็นปุ่ม login, member เห็นปุ่มซื้อ)

### Fixed
- **XP bar ค้างเต็มหลอด ไม่ยอมเลื่อน level**: migration `20260903164000` เปลี่ยน `grant_xp` เป็น `100 * L^1.5` และขึ้น prod DB ทันที (workflow `deploy-supabase.yml` ยิงจาก branch `staging` ซึ่งชี้ Supabase project เดียวกับ prod) แต่ `xpForLevel()` ฝั่ง client ยังค้างที่ `60 * L^1.2` บน `main` → `levelProgress()` clamp `into = min(xp, span)` ทำให้ผู้เล่นที่ XP เกิน span เก่าเห็น `2449 / 2449 XP` แถบ 100% ตลอด ทั้งที่เลเวลไม่ขึ้น (เจอ 15 คน) · แก้โดย sync สูตรทั้งสองฝั่ง
- **ตัวเลข coin ที่โชว์ไม่ตรงกับที่ได้จริง**: `src/engine/scoring.ts` บน prod ยังเป็นตารางก่อน halve (easy 50/5) ขณะที่ edge function จ่ายตารางใหม่ (25/2) → โชว์เกินจริง 2 เท่า · ตอนนี้ตรงกันแล้ว

### Changed
- **ลดความชัน level curve**: `grant_xp` `100 * L^1.4` (จาก `1.5`) — level 22 ใช้ 7,575 XP แทน 10,318 (เดิมก่อน 3 ก.ย. คือ 2,449) · cumulative L1→L100 ≈ 2.6M (จาก 3.95M) · migration `20260905170000` settle ผู้เล่นที่ XP เกินเกณฑ์ใหม่แล้วให้เลื่อน level ทันทีด้วย `grant_xp(user_id, 0)`

## 1.10.3 — 2026-08-30

### Fixed
- **Navigation**: กด Home หรือ Profile ที่ bottom nav แล้วไม่มีอะไรเกิดขึ้น เวลาอยู่หน้าอื่นที่ไม่ใช่หน้า Home/Profile ตรง ๆ (Play Mode, Practice, Shop, Settings, Leaderboard, Recap, Stats, Quests, Time Attack ฯลฯ — เกือบ 20 หน้า) — `wireBottomNav` ข้ามการผูกปุ่มที่ "ตรงกับแท็บ active" ที่ส่งมา แต่หน้าพวกนี้ส่ง `active: 'home'`/`'profile'` มาแค่ให้ไอคอนติดสว่างถูกตำแหน่งเท่านั้น ไม่ได้แปลว่าเป็นหน้านั้นจริง ปุ่มเลยกดไม่ติดเงียบ ๆ

### Added
- **Game**: เพิ่มตัวอักษร A-I กำกับคอลัมน์ (แถวบน) และตัวเลข 1-9 กำกับแถว (ด้านซ้าย) รอบกระดาน ช่วยอ้างอิงตำแหน่งช่องได้ง่ายขึ้น
- **What's New**: เปลี่ยนจากแสดงทุกเวอร์ชันขยายเต็มทีเดียว (ยาวมากตอนนี้มี 7 เวอร์ชัน) เป็นแบบพับ/กดขยายทีละเวอร์ชัน — มีแค่เวอร์ชันล่าสุดเปิดไว้ให้อัตโนมัติ

### Changed
- **Game**: ปรับความหนาตัวเลขโจทย์ตั้งต้น (given clues) ให้เข้มขึ้นจากคำติชมผู้เล่น — ทดลอง 700 ก่อนแล้วปรับลงมาเป็น 500 เพราะ 700 หนาเกินไป

## 1.10.2 — 2026-08-25

### Fixed
- **Sound (iOS)**: กดปิดเสียงแล้วเพลงพื้นหลังไม่หยุดบน iPhone — `applyBgVolume()` ปิดเสียงด้วยการตั้ง `volume = 0` แต่ Apple ระบุว่าบน iOS คุณสมบัตินี้ตั้งค่าไม่ได้ (เป็น read-only และอ่านค่าได้ 1 เสมอ เพราะบังคับให้ระดับเสียงอยู่ใต้ปุ่มเสียงจริงของเครื่อง) คำสั่งจึงไม่มีผลเลยและเพลงดังต่อ · เปลี่ยนเป็น `pause()` + `muted = true` ซึ่ง iOS รองรับ · บน desktop เดิมทำงานถูกอยู่แล้ว บั๊กนี้จึงมองไม่เห็นถ้าไม่ทดสอบบนมือถือ · SFX ไม่เคยได้รับผลกระทบเพราะใช้ Web Audio `masterGain`
- **Wallet**: เล่น Time Attack จบแล้วหน้า profile ขึ้นเหรียญ 0 — `handleTimeAttackWin` อ่าน `wallet.balance` แต่ตาราง `user_wallet` ไม่มีคอลัมน์นี้ (มี `coins`) `Number(undefined ?? 0)` จึงกลายเป็น 0 · เป็นบั๊กแสดงผลอย่างเดียว ข้อมูลใน DB ไม่กระทบ · แก้ต้นเหตุด้วยการใส่ type ให้ `getWallet()` ซึ่งเดิมคืนค่าแบบไม่มี type ทำให้ TypeScript ไม่จับฟิลด์ที่ไม่มีอยู่จริง
- **Time Attack**: popup หลังเล่นจบขึ้น "Rank #2 / undefined" — `win-modal` ตรวจแค่ `rank` ไม่ได้ตรวจ `totalPlayers` และ `submit-time-attack-score` ก็ไม่เคยคืนตัวหารมาให้ · เพิ่ม RPC `get_time_attack_player_count` ที่นับ `DISTINCT user_id` (นับ row ไม่ได้ เพราะ `time_attack_leaderboard` เก็บทุกรอบที่เล่น — ข้อมูลจริงมี tier ที่มี 3 row จากผู้เล่นคนเดียว)
- **Share**: ลิงก์ในข้อความแชร์เป็น `gridnova.pages.dev` เฉย ๆ ซึ่ง LINE/Facebook ไม่ได้ทำเป็นลิงก์ให้เสมอไป กดไม่ได้ · เปลี่ยนเป็น `https://gridnova.pages.dev/` และดึงมาจาก `SITE_URL` ที่เดียว แก้ทั้ง Weekly Recap และ popup หลังจบเกม (เป็นปัญหาเดียวกันทั้งคู่)

### Changed
- **Game**: เพิ่มระยะห่างระหว่างแถวปุ่มช่วยเหลือกับแป้นตัวเลขเป็น 2 เท่า (8px → 16px)
- **Docs**: อัปเดต `CLAUDE.md` — Time Attack กับ Random Mode ย้ายจาก "Planned" มาเป็น "Currently Live" (ขึ้นจริงไปแล้วแต่เอกสารยังไม่ตาม), เพิ่มตาราง tier, ตาราง DB ที่ขาด, RPC/Edge Function ใหม่ และหมายเหตุเรื่อง Pages Functions quota กับ PWA precache

## 1.10.1 — 2026-08-25

### Fixed
- **Admin panel**: `get_admin_online_list()` join ข้อมูล profile ผิดคอลัมน์มาตั้งแต่ migration แรก (`session_id` ที่ client สุ่มเองแทนที่จะเป็น `user_id` จริง) ทำให้สมาชิกที่ online ทุกคนโชว์เป็น "Member" ทั่วไป ไม่มีชื่อจริง แก้ join แล้ว

### Added
- **Admin panel**: หน้า online list เพิ่มคอลัมน์ Mode โชว์ว่าผู้เล่นแต่ละคนกำลังเล่นโหมดไหนอยู่ตอนนี้ (Daily/Practice/Random/Time Attack/Book หรือ In menu) ดึงจาก view ล่าสุดที่แต่ละ session log ไว้
- **Admin panel**: แท็บใหม่ "Game Mode" — pie chart สัดส่วนการเล่นวันนี้แยกตามโหมด, กราฟคนกำลังเล่นสดๆ ต่อโหมด, การ์ดสรุปทั้ง 5 โหมด กดเข้าไปดูรายชื่อผู้เล่นแบบละเอียด (วันนี้/เมื่อวาน/ทั้งหมด/คะแนนเฉลี่ย/คะแนนสูงสุด/เล่นล่าสุด) — Random Mode ไม่มีคะแนนต่อเกม (วัดด้วย win streak) และ Book Mode ยังแยกข้อมูลคะแนนจาก Practice ไม่ได้ในฐานข้อมูล (ใช้ระบบบันทึกเดียวกัน) ทั้งสองจุดมีคำอธิบายกำกับไว้ในหน้า UI
- **Admin data hygiene**: กรอง `hints_used < 0` ออกจากสถิติคะแนนทุกจุดในแท็บ Game Mode — 6 แถวเก่าจากบัญชีเดียว (30 มิ.ย. 2026 ก่อน economy reset) มี `hints_used` ติดลบหลักล้าน ทำให้คะแนนพุ่งเป็นหลักพันล้าน

## 1.10.0 — 2026-08-24

### Added
- **Book Mode (Beta)**: โหมดใหม่ — เล่นแบบหนังสือซูโดกุกระดาษ ไม่มีสีแดง ไม่มีหัวใจ ไม่ฟ้องผิด/ถูกระหว่างเล่นเลย ต้องเติมกระดานให้เต็มก่อนถึงจะรู้ผล (บอกแค่จำนวนช่องที่ไม่ตรง ไม่บอกตำแหน่ง) มีปุ่ม "Show me" ให้คนตันจริง ๆ · hint คงที่ 3 ครั้ง ซื้อเพิ่มไม่ได้
  - ปิด oracle ทุกจุดที่แอบบอกคำตอบ: ตัวนับบนแป้นเลข (เดิมนับเฉพาะตัวที่ถูก ทำให้เลขที่ผิดไม่ลดค่าลง = รู้ทันทีว่าผิด), animation ฉลองแถว/บล็อกที่เทียบกับเฉลย, และเช็คซ้ำทุกครั้งที่แก้ไข (จะกลายเป็น oracle สดที่แรงกว่าเดิม — ตอนนี้เช็คแค่ตอนกระดาน "เพิ่งเต็ม" ครั้งเดียว)
  - แป้นเลขใน Book Mode ไม่มีวันล็อกหรือจางแล้ว (`pointer-events:none` เดิมบล็อกการกดจริงแม้จะปลดล็อกฝั่ง JS แล้วก็ตาม) — ไม่มีการนับหรือฟ้องอะไรเลยว่าใส่ตัวไหนไปกี่ตัว กดได้ไม่จำกัดจริง ๆ เหมือนเขียนในหนังสือ
- **Time Attack (Beta)**: โหมดใหม่ — แข่งกับเวลา 3 tier (Sprint 3 นาที/Easy, Rush 5 นาที/Medium, Marathon 10 นาที/Hard) ความยากล็อกตาม tier ไม่ให้เลือกเอง (กันไม่ให้ทุกคนเลือก Marathon+Easy เพื่อชนะ tier ที่ผิดจุดประสงค์) แต่ละ tier มี leaderboard แยกของตัวเอง เก็บ all-time best ต่อคน
  - โจทย์ออกโดย server เท่านั้น (edge function `start-time-attack`) เฉลยไม่หลุดถึง client เลย และ submit (`submit-time-attack-score`) replay ทุก move เทียบเฉลยฝั่ง server เหมือน Daily — จำเป็นเพราะ leaderboard สาธารณะที่ตัวชี้วัดหลักคือ "เหลือเวลาเท่าไหร่" ถ้าให้ client คิดเองปลอมได้ทันที
  - `issued_at` เขียนโดย Postgres เป็นจุดอ้างอิงเวลาที่ปลอมไม่ได้ — จุดนี้แน่นกว่า `submit-daily-score` เดิมที่รับ `started_at` จาก client เอง
  - นาฬิกาไม่หยุดตอนสลับแอป (ต่างจากโหมดอื่นที่หยุด) เพราะเวลาวัดจาก `issued_at` ของ server ถ้าหยุด local จะเพี้ยนจนโดน `TIME_EXPIRED` ตอน submit
  - ปิด continue (ซื้อคืนหัวใจ) และ auto-save ระหว่างเล่น — เป็นความเสี่ยงที่รู้ตัว: ถ้าโดน force reload (เช่นตอน deploy ครั้งถัดไป) รอบที่เล่นอยู่จะหายเลย กู้คืนไม่ได้ ต้องเริ่มเลือก tier ใหม่
  - hint คงที่ 3 ครั้ง ซื้อเพิ่มไม่ได้ เหมือน Daily — โหมดที่มีอันดับต้องเท่ากันทุกคน
  - ไอคอนใหม่เฉพาะของ Book Mode (`book.png`) และ Time Attack (`chronometer.png`) — เดิมยืมไอคอน brain/clock ที่ใช้ร่วมกับจุดอื่นในแอป (onboarding, quests, Daily countdown) เปลี่ยนอันหนึ่งเสี่ยงกระทบอีกอันโดยไม่ตั้งใจ

### Fixed
- **Leaderboard**: แท็บ Guests ตอนสลับ Today/Yesterday เมื่อก่อน fetch ข้อมูลของวันนี้ซ้ำทั้งสองแท็บ (hard-code `todayUtc()` แทนที่จะใช้วันที่ที่เลือกจริง) ทำให้ Yesterday โชว์อันดับเดียวกับ Today เป๊ะ

### หมายเหตุ
- Book Mode และ Time Attack ขึ้นเป็น **Beta** — ทั้งคู่ยังไม่เคยผ่านการเล่นจริงจากนิ้ว/เมาส์คนจริงบน staging เลย (ติด password gate ของ staging) เทสต์ทั้งหมดที่ผ่านมาเป็นการขับผ่าน DOM/API โดยตรง มีบั๊กเดียวที่ synthetic click มองไม่เห็นแต่คนกดจริงเจอ (แป้นเลข Book Mode ที่แก้ไปข้างบน) — ขึ้น beta ไว้ก่อนเพื่อเก็บ feedback จากคนเล่นจริงก่อนเปิดเต็มรูปแบบ

## 1.9.1 — 2026-08-23

### Fixed
- **PWA / Cloudflare quota**: ตัด `admin/**` กับไฟล์ยืนยัน Search Console ออกจาก precache ของ service worker — ผู้เล่นทุกคนกำลังดาวน์โหลดหน้า admin พร้อม `chart.umd.min.js` ทั้งที่ไม่มีวันเปิด และทุก entry ใน precache คือ 1 request ที่คนเข้าใหม่ยิงตอนโหลดแรก ซึ่งแต่ละ request เรียก Pages Function ด้วย · precache 77 → 73 entries, 4,911 → 4,419 KiB (ประหยัด ~492 KiB ต่อคนเข้าใหม่)
- **`_routes.json`**: pattern ของไฟล์ยืนยัน Google เขียนเป็น `/google….html` แต่เบราว์เซอร์ขอมาแบบไม่มี `.html` เลยไม่ match — เพิ่มทั้งสองแบบ
  - วัดจาก `wrangler pages deployment tail` บน production: 22 invocations/75 วิ → `/admin*` 5 ครั้ง (23%) และไฟล์ Google 2 ครั้ง (9%) มาจากสองสาเหตุนี้

## 1.9.0 — 2026-08-23

### Fixed
- **Cloudflare quota (เกือบทำเว็บล่ม)**: บัญชีชน 91% ของลิมิต Workers/Pages Functions 100,000 request/วัน — `functions/_middleware.js` มีอยู่แต่ไม่มี `_routes.json` ทำให้ Cloudflare เรียก Function **ทุก request ของ project รวม production** บรรทัด `if (!isStaging) return next()` ไม่ได้ช่วยอะไรเลย เพราะ invocation ถูกนับไปก่อนที่โค้ดบรรทัดนั้นจะรัน และเนื่องจาก PWA precache 77 ไฟล์ คนเข้าใหม่ 1 คนจึงเผา ~80 invocations ตั้งแต่โหลดแรก · เพิ่ม `public/_routes.json` ยกเว้น static asset ทั้งหมด เหลือ **2 invocations ต่อการติดตั้งใหม่** (`index.html` + `admin/index.html`)
  - แลกมาด้วย: บน staging ไฟล์ static ไม่ถูก login gate แล้ว แต่เป็นไฟล์ชุดเดียวกับที่ production เสิร์ฟสาธารณะอยู่แล้ว ส่วนหน้า HTML ทุกหน้ารวม `/admin` ยัง gate ครบ

### Added
- **Analytics**: เก็บที่มาของแต่ละ session (`referrer`, `referrer_host`, `utm_*`, `click_id_kind`, `app_hint`, `landing_path`) — เดิม `visitor_sessions` บันทึกแค่ว่ามีคนเข้า แต่ไม่เคยบันทึกว่ามาจากไหน ทำให้ spike วันที่ 22–23 ส.ค. (10/วัน → 1,378/วัน) หาที่มาไม่ได้เลยหลังจากนั้น
  - เก็บมากกว่าแค่ referrer เพราะทราฟฟิกส่วนใหญ่มาจาก in-app browser ของ LINE/Facebook ซึ่ง strip `document.referrer` ทิ้ง — ถ้าเก็บแค่ referrer ทราฟฟิกพวกนี้จะกองรวมใน "direct" แล้วตอบอะไรไม่ได้เหมือนเดิม
  - `record_visit_attribution()` เป็น first-write-wins เพราะการเดินหน้าในแอป (SPA) รายงาน referrer เป็นโดเมนตัวเอง ถ้าไม่กันไว้จะเขียนทับที่มาจริงด้วยค่าว่าง
  - `get_admin_attribution()` คืนทั้ง sessions และ engaged ต่อ source เพื่อดูว่า source ไหนส่งคนที่*เล่นจริง* ไม่ใช่แค่เปิดแท็บทิ้ง
- **SEO**: เพิ่ม `WebSite` structured data — เดิมมีแต่ `WebApplication` ซึ่ง Google ไม่ได้ใช้กำหนด site name พอไม่มีสัญญาณ Google เลย fallback ไปใช้ชื่อโดเมน และ `pages.dev` เป็นของ Cloudflare ผลเสิร์ชจึงขึ้นว่า "Cloudflare" แทน GridNova
  - ⚠️ Google รองรับ site name ระดับ subdomain เฉพาะภาษา en/fr/de/ja — ผลเสิร์ชภาษาไทยอาจยังไม่เปลี่ยน ทางแก้จริงคือย้ายไป custom domain

## 1.8.4 — 2026-08-23

### Added
- **What's New**: เพิ่ม entry ของ 1.8.3 (แก้บั๊ก leaderboard) ที่ตกไปใน `src/lib/releases.ts` — ต้อง bump เวอร์ชันด้วยเพราะ `shouldWhatsNewShow()` เทียบ `seen !== APP_VERSION` คนที่เปิดแอปหลัง deploy 1.8.3 ไปแล้วถูกมาร์ก `seen = 1.8.3` เรียบร้อย ถ้าเติม entry เฉย ๆ โดยไม่ขยับเวอร์ชัน modal จะไม่เด้งให้คนกลุ่มนั้นอีกเลย

## 1.8.3 — 2026-08-23

### Fixed
- **Leaderboard**: ชื่อผู้เล่นที่ยาวดันคอลัมน์คะแนนหลุดออกนอกการ์ด — `.lb-row` ใช้ `grid-template-columns: … 1fr auto` แต่ grid item มี `min-width: auto` เป็นค่าเริ่มต้น track `1fr` จึงหดต่ำกว่าความกว้างจริงของชื่อไม่ได้ กฎ `text-overflow: ellipsis` ที่มีอยู่แล้วบน `.lb-name` เลยไม่เคยได้ทำงาน และคอลัมน์คะแนนที่เป็น `auto` ถูกดันพ้นขอบการ์ด → เปลี่ยนเป็น `minmax(0, 1fr)` และใส่ `min-width: 0` ที่ตัวลูก
- **Leaderboard**: แท็บ Guests เป็นบั๊กเดียวกันคนละรูปแบบ — guest row ใช้คลาส `.lb-row` ร่วมกันแต่ render แค่ 3 ช่อง ชื่อจึงไปตกอยู่ใน track ของ avatar ขนาด 36px → เพิ่ม `.lb-row--guest` ที่เป็น 3 คอลัมน์จริง

### Added
- **Docs**: `ROADMAP.md` — ลำดับความสำคัญ Now/Next จากข้อมูลทราฟฟิกวันที่ 23 ส.ค. (แผน v1.2–v2.0 เดิมยังอยู่ครบด้านล่าง)

## 1.8.2 — 2026-07-27

### Removed
- **Profile**: เอา dropdown เลือกประเทศออก — ไม่มีอะไรในแอปอ่าน `profiles.country` ไปใช้จริงเลย ตั้งแล้วได้แค่เหรียญ ไม่มีประโยชน์อื่น
- **Medals**: ซ่อน "Globetrotter" ตามไปด้วย เพราะมันมีอยู่เพื่อรองรับ dropdown นั้นอย่างเดียว (ไม่งั้นจะกลับไปเป็นเหรียญที่ทำไม่ได้ตลอดกาลเหมือนเดิม) — คอลัมน์ `profiles.country` ยังอยู่ ไม่ลบทิ้ง เพราะมีข้อมูลของคนที่ตั้งไว้แล้วและลบแล้วกู้ไม่ได้

## 1.8.1 — 2026-07-27

### Fixed
- **Game**: กดเร็วๆ แล้ว selection ไม่ขยับ ทำให้ใส่เลขลงช่องเก่าและเสียหัวใจฟรี — `pointer-events: none` ที่ใส่ไว้ใน 1.8.0 เพื่อกันช่องที่ scale บังการกดของเพื่อนบ้าน กลับทำให้ช่องที่กำลัง animate **กดไม่ติดเลย** tap จึงถูกกลืนหาย (delegated listener หา `closest('.cell')` ไม่เจอ) เปลี่ยนวิธีใหม่: ย้าย transform ทั้งหมดไปไว้ที่ `.cell-inner` (ตัวเลข) ตัวช่องเปลี่ยนแค่สี ไม่แตะ geometry เลย จึงไม่ต้องใช้ `pointer-events`/`z-index` อีก

### Changed
- **Game**: ปิดเพลงพื้นหลังระหว่างเล่น (เปิดคืนอัตโนมัติเมื่อออกจากเกม ถ้าไม่ได้ปิดไว้เอง) — เสียสมาธิ

## 1.8.0 — 2026-07-26

### Added
- **Home**: ยก Daily Puzzle ขึ้นเป็น hero card (เลขโจทย์, ความยากวันนี้, อันดับตัวเอง, countdown ถึงเวลารีเซ็ต UTC) — เดิม leaderboard ซึ่งเป็นจุดขายเดียวที่ Sudoku.com ไม่มี ถูกฝังลึก 2 ชั้น ส่วน Play Mode ลดเป็นแถวรองคู่กับ Practice
- **Share**: ผลลัพธ์แบบ text ไม่สปอยล์คำตอบ (Wordle-style) — ตารางบอกแค่ช่องที่โจทย์ให้มา ทุกคนที่เล่น Daily วันเดียวกันได้ตารางเหมือนกัน paste ลง LINE/FB ได้ตรงๆ ไม่ต้องอัปโหลดรูป
- **Game**: animation บนกระดาน — pop ตอนใส่ถูก, shake ตอนผิด, ripple ไล่ออกจากช่องที่เล่นเมื่อแถว/คอลัมน์/บล็อกครบ, คลื่นทแยงทั้งกระดานตอนชนะ
- **Game**: ใส่เลขครบ 9 ตัว → วาบสีเหลืองอำพันทุกช่องของเลขนั้น + ปุ่มบนแป้นเด้ง (คนละสีกับ ripple เพื่อไม่ให้อ่านเป็นเหตุการณ์เดียวกัน)
- **Sound**: `sfxUnitComplete` + `sfxNumberComplete` — เดิม animation เงียบสนิท

### Fixed
- **Game**: กดแล้วไปโดนช่อง/เลขข้างๆ — `renderBoard` กับ `renderNumpad` ทำลาย DOM ทั้งหมดแล้วสร้างใหม่ทุกครั้งที่แตะ (81 ช่อง + 81 listener) บนมือถือ element ใต้นิ้วตอน touchstart หายไปก่อน click จะ resolve เปลี่ยนเป็น update in place + event delegation
- **Game**: ช่องที่ scale ตอน animate (43.3px ทับเพื่อนบ้าน 38.1px) บังการกดของช่องข้างๆ — ใส่ `pointer-events: none` ตอน animate และลดเวลา animation ลง (~780ms → ~620ms)

## 1.7.0 — 2026-07-24

### Added
- **SEO**: meta description, OG/Twitter card tags, JSON-LD structured data, `robots.txt`, `sitemap.xml` — เว็บไม่มี SEO surface มาก่อนเลย (title เปล่าๆ ไม่มี description/social preview)
- **Profile**: เพิ่ม dropdown เลือกประเทศ (ไทยขึ้นก่อน) บันทึกทันทีตอนเลือก

### Fixed
- **Achievements**: "Globetrotter" (ตั้งค่าประเทศ) เข้าไม่ถึงมาตลอดเพราะไม่มี UI ให้ตั้งค่าเลย — แก้แล้วด้วย dropdown ด้านบน
- **Achievements**: ซ่อน "Theme Collector" กับ "Shopaholic" ออกจากหน้า Medals ชั่วคราว เพราะต้องซื้อของในร้านค้าซึ่งยังไม่ได้เปิดใช้งาน (shop.ts มีอยู่ในโค้ดแต่ไม่ได้ผูกเข้า navigation เลย) — column `hidden` มีอยู่แล้วใน DB แต่ client ไม่เคยกรองตามนี้มาก่อน แก้ให้ respect แล้ว

## 1.6.0 — 2026-07-19

### Added
- **Weekly Quests**: ระบบเควสรายสัปดาห์ใหม่ทั้งหมด (DB table, RPC seed/recompute, edge function `claim-weekly-quest-reward`) รีเซ็ตทุกวันจันทร์ 00:00 UTC
- **Continue**: ซื้อต่อชีวิตด้วยเหรียญหลังพลาดครบ 3 ครั้ง ใช้ได้ทั้ง Daily และ Practice (ปิดใน Random Mode ตามดีไซน์ของโหมด)
- หน้า Quests ใหม่ รวม Daily + Weekly เข้าด้วยกัน สลับดูด้วย tab แทนการ์ดแยกที่เคยเรียงต่อกันยาวบน Home
- แถบ progress + badge "N to claim" บนปุ่ม Quests ที่ Home

### Fixed
- ล็อกไม่ให้เล่นแนวนอนบนมือถือ (แนวนอนทำ UI พัง) ด้วย overlay ขอให้หมุนกลับแนวตั้ง
- Toast แจ้งเตือน text ชิดซ้าย แก้เป็นกึ่งกลาง
- เส้นทับ slider เพลง/เอฟเฟกต์เสียงในหน้า Settings (เกิดจาก `.settings-row` border-bottom ทะลุขึ้นมา)
- ปรับลดรางวัลเหรียญ/XP ของเควส (daily+weekly) ลง ~3.4x ให้สมดุลกับ achievement pool ที่ rebalance ไปก่อนหน้า

## 1.5.0 — 2026-07-18

### Added
- **Settings page**: full redesign — grouped cards for Sound, Notifications, Board,
  Official Community, Help & About, and Account
- **Background music**: calm looping track, with independent volume sliders for
  music and sound effects (each remembers its own on/off + level)
- **Vibration**: real haptic feedback on cell input, toggleable in Settings
- **Daily Puzzle Reminder**: push notifications wired to the UI for the first time
  (the backend existed but was never exposed)
- **Help & About pages**: How to Play, Contact Support, Privacy Policy, Terms of
  Service — all new, real content
- **What's New**: in-app release notes, auto-shown once after an update

### Changed
- App-wide font is now Fredoka (previously only used for game numbers/timer)
- Game is English-only — all in-app text is now English (does not apply to dev
  docs, the admin panel, or this changelog)

## 1.4.0 — 2026-07-16

### Changed
- **เศรษฐกิจเหรียญ**: ปรับ reward เหรียญ/XP ของเหรียญตรารวม 186 แบบใหม่ทั้งหมด ลดปริมาณเหรียญที่แจกลงให้สมดุลกับร้านค้ามากขึ้น พร้อมปรับยอดเหรียญและเลเวลของบัญชีที่มีอยู่แล้วให้ตรงตามสูตรใหม่
- **ระบบเลเวล**: ปรับสูตร XP ให้ไต่เลเวลได้เร็วขึ้นมาก (จากเดิมต้องใช้ XP สะสมกว่า 6 ล้านถึงเลเวล 100 เหลือประมาณ 6.8 แสน) และเพิ่มสิทธิพิเศษแรกให้เลเวล — โหมด Practice/Random ได้ hint ฟรีเพิ่มตามเลเวล (สูงสุด +3) ยกเว้นโหมด Daily ที่ต้องแฟร์เท่ากันทุกคนเพราะมีอันดับกลาง
- **ระบบวัดผล**: เปลี่ยนจาก third-party analytics มาใช้ระบบ funnel + retention ที่พัฒนาเอง แสดงผลในหน้า `/admin`

## 1.3.2 — 2026-07-14

### Fixed
- **Daily Quest**: แก้เวลารีเซ็ตให้ยึด UTC จริงตรงกันทั้งระบบ (เที่ยงคืน UTC = 07:00 น. ไทย) เดิมเควสรีเซ็ตหน้าจอไม่ตรงกับรอบนับผลของระบบ ทำให้เล่นช่วงตี 0–7 โมงเช้าแล้วเควสอาจไม่นับ
- **Daily Quest**: ลดจำนวนเควสต่อวันจาก 6 เหลือ 5 ใบ (ตัดเควสระดับยากสุดจาก 2 เหลือ 1)

## 1.3.1 — 2026-07-13

### Added
- **Daily Recap**: ปฏิทินดูประวัติ Daily Puzzle ย้อนหลัง พร้อม streak และสถิติรายเดือน
- **Daily Quest**: เควสประจำวันสุ่มหมุนเวียนใหม่ทุกวัน (สุ่มจาก 19 เควส) มีให้ลุ้นหลากหลายกว่าเดิม

### Fixed
- **Daily Puzzle**: เล่นได้วันละครั้งตามกติกา ไม่เล่นซ้ำได้อีก และตัดการเล่นย้อนหลังวันที่พลาด
- แก้ป๊อปอัป Level Up ที่เคยขึ้นเลขเลเวลผิด (client เดาก่อน server ตอบ)
- แก้ปุ่มย้อนกลับจากหน้าอันดับ Daily ให้กลับหน้า Daily Puzzle แทนหน้าแรก

## 1.3.0 — 2026-07-11

### Added
- **Random Mode**: เล่นแบบสุ่มความยาก แข่งกันด้วย win streak มีอันดับของตัวเอง

### Improved
- **Medals, Play Mode, และทั้งแอป**: เปลี่ยนไอคอนเป็นภาพจริงทั้งหมด สวยขึ้นชัดเจน
- **Medals**: แยกหมวด Clean Solve (เดิม Pure) เป็น 4 การ์ดตามความยาก
- **Daily Puzzle**: ดู leaderboard ได้ในหน้าเดียว ไม่ต้องกดดูแยก

### Fixed
- **Daily Puzzle**: ปุ่มเล่นไม่ค้างที่ "Continue" อีกต่อไปถ้ายังไม่เคยเล่นจริง
- บันทึกภาพแชร์บนมือถือ เซฟเข้า Photos/Gallery ได้แล้ว

## 1.2.0 — 2026-07-09

### Added
- **Play Mode**: หน้าใหม่รวมโหมดเล่นทั้งหมด (Daily Puzzle เล่นได้เลย, Time Attack/Random Mode เร็วๆ นี้)
- **Practice**: แยกหน้าเลือกความยากออกมาต่างหาก เล่นซ้ำได้สะดวกขึ้น

### Improved
- **Medals**: เปลี่ยนไอคอนบางจุดเป็นภาพจริงแทน emoji

## 1.1.0 — 2026-07-09

### Improved
- **Medals**: เพิ่มเหรียญรางวัลใหม่ 125 แบบ ใน 5 หมวดหมู่ (Play, Daily, Streak, Flawless, Speedster) แต่ละหมวดมี 5 ภารกิจ x 5 ระดับ ให้ผู้เล่นมีเป้าหมายเล่นต่อเนื่องมากขึ้น
- **Medals**: แก้ไข progress bar ที่ขาดหายในบางหมวดให้แสดงผลถูกต้อง

## 1.0.5 — 2026-06-30

### Fixed
- **Daily Score**: แก้บั๊ก submit daily score ค้าง (edge function timeout 504) — redeploy v9

### Improved
- **Medals**: ขยาย achievement เป็น 100 ข้อ (10 หมวด × 10 ระดับ)
- **Admin Dashboard**: เพิ่ม KPI "Coins in Circulation" แสดงเหรียญรวมของ user ทั้งหมด

## 1.0.4 — 2026-06-29

### Fixed
- **Daily Puzzle**: leaderboard and quests now update correctly after completing a daily puzzle (cron was calling wrong function — backfilled 30 days of missing puzzles).
- **Practice in-progress**: finishing a game now clears the "continue" banner; starting a new practice game no longer loads stale saved state.

### Improved
- **Home**: "Visitors Today" label is now clearer (was "Today").
- **Admin**: new Leaderboard tab with score breakdown (base → penalties → bonuses → total), date picker, and quick shortcuts.

## 1.0.3 — 2026-06-26

### Fixed
- **Timer**: pauses when the app/tab is minimised or backgrounded.
- **Board**: rounded corner cells; removed doubled hairline on the last row/column.
- **Leaderboard tabs**: inactive tabs no longer blend into the background.
- **Icon buttons**: back/edit glyphs are now centred.
- **You Won! confetti**: now actually renders (was wiped before display).

### Added
- In-game keyboard shortcuts (N = notes, H = hint) + button tooltips.
- Desktop drag-to-scroll for the Medals filter chips.
- Share sheet drag-to-dismiss.

### Changed
- Unified "Medals" naming across nav, Medals page, and profile.
- Home screen top spacing aligned with other views.

## 1.0.2 — 2026-06-26

### Fixed
- **Daily Puzzle**: scores now submit to the leaderboard and rewards are granted
  (root cause: server `TIME_MISMATCH` 403 when a game was paused or resumed —
  client now reports an effective `started_at` that matches actual play time).
- **Undo**: no longer refunds a lost heart (was a no-lose exploit).
- **Achievements**: "First Win" / "First Daily" now unlock
  (`check_and_grant_achievements` had no branch for them).

### Added
- Home screen shows the app version (and a STAGING badge on staging builds).

## 1.0.1
- Force SW cache bust; earlier fixes.
