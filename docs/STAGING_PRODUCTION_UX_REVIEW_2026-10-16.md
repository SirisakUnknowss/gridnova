# Returning-player release review — 16 October 2026

ตรวจเว็บจริง https://gridnova.pages.dev/ และ https://staging.gridnova.pages.dev/ พร้อม diff หลัง fetch origin/main และ origin/staging รอบนี้เป็น review เท่านั้น ไม่มีการแก้ UI หรือ deploy

## ขอบเขตและข้อจำกัด

- Production ใช้ guest ที่เปิดใหม่; staging ใช้บัญชีทดสอบเดิม จึงไม่เทียบยอดเหรียญ level streak หรือ ownership ของสองบัญชีว่าเป็นผลจาก release
- ดู Home, Profile, navigation และ Shop theme preview จริง ไม่เริ่มเกมที่ใช้หัวใจ ไม่ซื้อของ ไม่เปลี่ยนอุปกรณ์ และไม่แก้ production database
- ทดสอบ Home ที่ viewport 390×844 แยกแต่ละแท็บ: Daily card production สูง 280px; staging สูงประมาณ 430px (+54%) แม้ staging ผ่านการย่อจากแบบแรกแล้ว
- เป็นการประเมินเชิง UX/โค้ด ไม่ใช่ผลทดสอบกับผู้เล่นจริง และยังไม่ได้วัดเวลาโหลดบนเครือข่ายมือถือ

## ข้อสรุป

เป็น major visual/product update: จากหน้าเรียบสีม่วงและไอคอนเดิม เป็นโลกแฟนตาซี 3D พร้อม Shop, My Collection, Frames และ Monthly Challenge ผู้เล่นเก่ายังรู้จัก Home/Medals/Profile, Play Mode และ Practice ได้ แต่จะต้องเรียนรู้การเข้าประวัติ การสะสมของ และความต่าง Daily/Monthly ใหม่

ยังไม่แนะนำ production release ทันที ควรปิด blocker และจัดข้อความอธิบายการเปลี่ยนก่อน

## Backlog ก่อน production

| Priority | ประเด็น / หลักฐาน | เกณฑ์ผ่าน |
|---|---|---|
| P0 confirmed | Dark Mode regression: preview `data-theme=theme_dark` ใช้ `--cell-bg: color-mix(in srgb, #ffffff 97%, #475569)` แทนกระดานมืด โค้ด applyTheme เขียน appTokens ทับ theme tokens แล้วคืน dark tokens เฉพาะ monthly dark themes | theme_dark ยังคงกระดาน/ตัวเลข/สถานะเซลล์โทนมืดที่อ่านได้ ทั้ง Preview และ Equip; มี regression test |
| P0 release gate, conditional | Legacy cosmetics continuity: Avatar IDs เดิมถูก map เป็นภาพ/ชื่อใหม่ เช่น avatar_pet_dog → Lunar Fox; My Collection กรองทิ้ง background และ board_color | ตรวจ aggregate inventory production และเส้นทางใช้งานเดิมก่อน ถ้ามีผู้ครอบครอง ต้องเข้าถึง/Equip ของเดิมได้ หรือมี migration ที่ผู้ใช้เข้าใจ ห้ามอ้างว่าของหายเพียงจาก UI diff |
| P1 | Home เดิมใช้ “Leaderboard & recap”; ใหม่ใช้ “View leaderboard” แต่ Daily Recap ยังอยู่หน้าถัดไป | ใช้ชื่อที่บอกว่ามีทั้ง ranking และ history หรือมีทางเข้า Daily Recap ที่เห็นชัด |
| P1 | Monthly selected card ระบุ “Medium · Daily puzzle” และ “Play today’s puzzle” ทำให้คล้าย Daily leaderboard mode ทั้งที่คนละ progress | ใช้ Monthly puzzle/Monthly Challenge ให้ชัด และอธิบายว่าความคืบหน้าคนละชุด; ทดสอบผู้เล่นเข้าใจว่าการจบ Daily ไม่ใช่การจบ Monthly date |
| P1 | Game Menu และ Notes ใช้ ic.notes เหมือนกัน; Menu เป็น icon-only บนมือถือ | ใช้ icon Menu ที่ต่างจาก Notes; Undo/Redo/Erase/Notes/Hint ยังเห็นชื่อและตำแหน่งที่คุ้นเคย |
| P1 | ทั้งสองเว็บยังแสดง v1.12.2; release notes ล่าสุดใน src/lib/releases.ts ยังเป็น 1.12.0 | production release ต้อง bump version ตาม AGENTS.md และมี English What's New ที่อธิบาย UI/Shop/Collection/Monthly พร้อมข้อความยืนยันของเดิมเฉพาะที่ตรวจแล้ว |
| P2 | Daily card 280→430px และเพิ่ม Monthly entry ทำให้ Practice ถูกเลื่อนลงจากจอแรก | ทดลอง Daily ประมาณ 330–350px และ secondary rows ประมาณ 72–80px เพื่อเห็นทางเข้าโหมดเดิมได้เร็ว โดยไม่ทำปุ่มเล็ก |
| P1 verification | ภาพ 3D/ธีมเพิ่ม asset และ precache; ยังไม่มี slow-network measurement ใน review นี้ | ทดสอบ PWA update จากเวอร์ชันเดิม, offline fallback และ cold load บนเน็ตมือถือ ไม่ใช้ผล desktop Wi‑Fi แทน |

## สิ่งที่ช่วยลดความงงอยู่แล้ว

- Home, Medals และ Profile อยู่ตำแหน่งเดิม; แท็บ Season เดิมเป็น Soon และกดไม่ได้ จึงไม่ได้ตัดฟังก์ชันที่เคยใช้ได้เมื่อเปลี่ยนเป็น Shop
- Play Mode และ Practice ยังใช้ชื่อเดิม
- Play → Play Daily ชัดกว่าเดิม; ปุ่มหลักยังใหญ่
- Shop แยกจาก My Collection และ monthly rewards ไม่ถูกนำไปขายใน Shop
- ช่องปฏิทินและ Daily card ได้ปรับเพื่อมือถือแล้ว

## แผนปล่อยที่เสนอ

1. ปิด P0 และ P1 ด้านความหมาย/ทางเข้าเดิมก่อน ไม่จำเป็นต้องเปลี่ยน visual identity ใหม่อีกรอบ
2. ทำ returning-player walkthrough สั้นแบบข้ามได้: “Daily stays here”, “Shop & My Collection”, “Monthly opens November 1”. ไม่บังคับผู้เล่นเก่าผ่าน signup/onboarding ใหม่
3. ใช้บัญชีเก่าทดสอบ: ของที่เคยมี/Equip เดิม, กระดานค้าง, coins/XP/streak, Dark Mode, recap และ PWA update จาก prod เดิม ไม่ใช้เพียงบัญชีใหม่สะอาด
4. ก่อน production ตาม release approval policy: สรุป changes/release notes/version และขอ confirmation ตาม AGENTS.md; staging preview date ต้องไม่ถูกคัดลอกไป prod

## ประเด็น brainstorm ที่ยังต้องเลือก

- เน้นการเปลี่ยนเป็น “GridNova refreshed” พร้อมแนะนำ 3 จุด หรือทยอยปล่อย UI/Shop ก่อน Monthly เปิดจริง
- ของที่ครอบครองเดิมควรคงตัวตนเดิม ไม่ใช่เพียงคง item ID; หากเปลี่ยนดีไซน์ควรให้เลือกใช้รุ่นเดิมได้
- Monthly cycle ควรคุยแยกจาก UX release นี้ เพื่อไม่เพิ่มกติกาใหม่หลายเรื่องในครั้งเดียว

## แหล่งอ้างอิงโค้ด

- src/ui/views/home.ts — ปุ่ม Daily, leaderboard และ Monthly entry
- src/ui/views/monthly-challenge.ts — Monthly copy และ date progress
- src/ui/components/avatar-art.ts — legacy avatar mapping
- src/ui/views/collection.ts — category visibility
- src/lib/themes.ts — applyTheme overrides
- src/ui/views/game.ts — Menu/Notes artwork
- src/lib/releases.ts, src/ui/views/whats-new.ts — returning-player update notice

## Follow-up: staging 2.0.0

- Fixed Dark Mode palette overwrite, with preview/isolation/reset regression coverage.
- Restored Leaderboard & recap and clarified Monthly labels/rules.
- Read-only production aggregate audit confirmed owned Gold Frame (avatar), Forest Solid/Navy Solid (background), Forest Green (board color). Restored collection tabs and equip paths; retired owned metadata is fetched separately from shop availability. Legacy Gold Frame keeps its item ID and medal identity in the picker. No production writes.
- Added concise English What's New and set staging package/lockfile version to 2.0.0.
- Broader release gates above (including slow-network/PWA upgrade QA) remain separate from these four requested fixes.
