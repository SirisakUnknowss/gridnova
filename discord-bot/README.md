# GridNova Discord Bot

AI bot ที่ตอบคำถามผู้เล่น**ทุกข้อความ**ในห้อง help (และเมื่อมีคน @mention / reply bot ในห้องอื่น)
ตอบตามภาษาที่ผู้เล่นพิมพ์มา ใช้ Claude ตอบจาก knowledge base ใน [src/knowledge.md](src/knowledge.md)

แยกจากตัวเกม 100% — มี `package.json` ของตัวเอง ไม่เข้า bundle ของ PWA และ push ขึ้น `staging`/`main` ก็ไม่ deploy bot

## สถาปัตยกรรม

```
Discord Gateway (WebSocket) ⇄ Durable Object "GatewayBot" ──► Claude API
                                   │                          (knowledge.md อยู่ใน system prompt, cache 1 ชม.)
                                   └──► Discord REST: ตอบกลับแบบ reply
Cron ทุก 5 นาที + alarm ทุก 60 วิ ──► ต่อ WebSocket ใหม่ถ้าหลุด
```

- Discord ส่ง event ข้อความผ่าน Gateway เท่านั้น จึงต้องมี connection ค้างไว้ — ใช้ Durable Object 1 ตัวถือไว้
- กันค่าใช้จ่ายบาน: จำกัด 5 ข้อความ / คน / 10 นาที และ `MAX_DAILY_REPLIES` (ค่าเริ่มต้น 400) ต่อวัน UTC
- Bot ไม่สามารถ ping `@everyone`/role/คนอื่นได้ (`allowed_mentions` ปิดหมด)
- ข้อความที่ไม่ต้องตอบ (ขอบคุณ, คุยเล่นกันเอง) bot จะเงียบเอง
- เรื่องบั๊ก / เหรียญหาย / บัญชี → bot ไม่สัญญาอะไร และชี้ไปห้อง `BUG_REPORT_CHANNEL_ID`

## ตั้งค่า (ทำครั้งเดียว)

### 1. Discord server
สร้าง server แล้วมีห้องอย่างน้อย `#help` และ `#bug-report` (ห้อง help เป็น Forum ก็ได้ bot รองรับ)
เปิด Developer Mode (User Settings → Advanced) แล้วคลิกขวาที่ห้อง → **Copy Channel ID**

### 2. Discord Application
1. https://discord.com/developers/applications → **New Application** (ตั้งชื่อเช่น GridNova Helper)
2. แท็บ **Bot** → **Reset Token** → เก็บ token ไว้ (ห้ามแปะในแชต/commit)
3. แท็บ **Bot** → เปิด **Message Content Intent** ⚠️ ถ้าไม่เปิด bot จะต่อไม่ได้ (close code 4014)
4. แท็บ **OAuth2 → URL Generator** → scope `bot` → permissions: View Channels, Send Messages,
   Send Messages in Threads, Read Message History → เปิด URL ที่ได้ แล้วเชิญ bot เข้า server

### 3. Anthropic API key
https://console.anthropic.com → API Keys → สร้าง key (ต้องมีเครดิต/บัตร)

### 4. Deploy (ใน `discord-bot/`)
```bash
npm install
npx wrangler login
npx wrangler secret put DISCORD_BOT_TOKEN
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put ADMIN_TOKEN        # ตั้งรหัสอะไรก็ได้ยาวๆ ใช้เรียก /admin/*
```
ใส่ channel ID ใน `wrangler.jsonc` → `vars.HELP_CHANNEL_IDS` (คั่นด้วย comma) และ `BUG_REPORT_CHANNEL_ID` แล้ว
```bash
npx wrangler deploy
curl -H "Authorization: Bearer <ADMIN_TOKEN>" https://gridnova-discord-bot.<subdomain>.workers.dev/admin/start
```
`/admin/status` ดูสถานะ (`connected`, `fatalError`, `repliesToday`) · `/admin/reset` ใช้หลังแก้ปัญหาที่ทำให้หลุดถาวร
ดู log สดได้ด้วย `npx wrangler tail`

## อัปเดตความรู้ของ bot
แก้ [src/knowledge.md](src/knowledge.md) ทุกครั้งที่กติกา/ราคา/โหมดในเกมเปลี่ยน (ทุก release ที่มี What's New) แล้ว `npx wrangler deploy`
— bot รู้แค่สิ่งที่อยู่ในไฟล์นี้ ถ้าไม่มีจะตอบว่าไม่แน่ใจแทนการเดา

## ค่าใช้จ่ายโดยประมาณ
| ส่วน | ประมาณการ |
|---|---|
| Claude Opus 5.5 (ค่าเริ่มต้น) | ~$0.005–0.01 / คำตอบ → เพดาน 400 คำตอบ/วัน ≈ $2–4/วัน ถ้าใช้เต็ม |
| Claude Haiku 5.5 (ตั้ง `CLAUDE_MODEL` = `claude-haiku-5-5`) | ถูกกว่าราว 20–40 เท่า เหมาะกับ FAQ ถ้าคุณภาพพอ |
| Durable Object | เปิดค้าง 24 ชม. ≈ 10,800 GB-s/วัน — ใกล้เพดานฟรีของ Workers Free ควรเช็กใน dashboard; ถ้าเกินใช้ Workers Paid ($5/เดือน) |

## Dev
```bash
npm test          # unit tests (prompt, การตัดข้อความ 2000 ตัวอักษร, rate limit, memory)
npm run typecheck
```
