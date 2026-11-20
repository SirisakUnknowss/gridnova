#!/usr/bin/env node
// Send GridNova win-back emails via Resend or Brevo using native fetch (zero dependencies).
// Usage:
//   RESEND_API_KEY=re_xxx FROM_EMAIL="GridNova <hello@yourdomain.com>" \
//     node scripts/send-winback-email.mjs --test you@example.com
//   RESEND_API_KEY=re_xxx FROM_EMAIL="GridNova <hello@yourdomain.com>" \
//     node scripts/send-winback-email.mjs --csv dormant-members.csv --dry-run
//   RESEND_API_KEY=re_xxx FROM_EMAIL="GridNova <hello@yourdomain.com>" \
//     node scripts/send-winback-email.mjs --csv dormant-members.csv --send

import fs from 'node:fs';

const PLAY_URL = 'https://gridnova.pages.dev/?utm_source=winback_email&utm_medium=email&utm_campaign=nov2026_comeback';
const SUBJECT = 'GridNova อัปเดตใหญ่! เพิ่มโหมด Time Attack + Monthly Challenge — กลับมาลองโจทย์วันนี้กัน';

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(displayName) {
  const greeting = displayName ? `สวัสดีคุณ ${escapeHtml(displayName)}` : 'สวัสดีครับ';
  return `<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#0b0d17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background:#131626;border:1px solid rgba(255,255,255,0.1);border-radius:18px;overflow:hidden;">
    <tr>
      <td style="padding:28px 24px 18px;text-align:center;background:linear-gradient(135deg,#667eea,#764ba2);">
        <div style="font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.85);">GRIDNOVA SUDOKU</div>
        <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#ffffff;">อัปเดตใหม่พร้อมให้ลุยแล้ว!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#e2e8f0;">${greeting} 👋</p>
        <p style="margin:0 0 16px;font-size:14.5px;line-height:1.65;color:#cbd5e1;">
          ไม่ได้เจอกันสักพักเลย! ตอนนี้ <strong>GridNova</strong> อัปเดตฟีเจอร์ใหม่หลายอย่างที่ช่วยให้เล่นสนุกและท้าทายกว่าเดิม:
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#191d32;border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin:0 0 20px;">
          <tr><td style="padding:14px 16px;font-size:14px;line-height:1.7;color:#e2e8f0;">
            ⏱️ <strong>Time Attack</strong> — แข่งจับเวลาถอยหลัง 3 ระดับ (Sprint / Rush / Marathon) พร้อมบอร์ดจัดอันดับแยก<br>
            🗓️ <strong>Monthly Challenge &amp; Daily Puzzle</strong> — โจทย์ใหม่ทุกวัน สะสมสตรีคและเหรียญ<br>
            🎨 <strong>ธีมและอวาตาร์ใหม่ใน Shop</strong> — ใช้เหรียญในเกมแลกได้ฟรี ไม่ต้องเติมเงิน<br>
            📱 <strong>ติดตั้งเป็นแอป (PWA)</strong> — กด Add to Home Screen เปิดเล่นได้ทันทีใน 1 แตะ
          </td></tr>
        </table>
        <div style="text-align:center;margin:24px 0 18px;">
          <a href="${PLAY_URL}" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#667eea,#764ba2);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">
            เล่น Daily Puzzle วันนี้ →
          </a>
        </div>
        <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;text-align:center;">
          เล่นผ่านเว็บได้เลยที่ gridnova.pages.dev · หากไม่ต้องการรับอีเมลแจ้งอัปเดตอีก สามารถตอบกลับอีเมลนี้เพื่อยกเลิกได้ตลอดเวลาครับ
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function parseCsv(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const emailIdx = headers.indexOf('email');
  const nameIdx = headers.indexOf('display_name');
  if (emailIdx === -1) throw new Error('CSV must include an "email" column');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    const clean = (idx) => (cols[idx] || '').trim().replace(/^"|"$/g, '');
    const email = clean(emailIdx);
    if (!email || !email.includes('@')) continue;
    rows.push({ email, display_name: nameIdx >= 0 ? clean(nameIdx) : '' });
  }
  return rows;
}

async function sendViaResend({ apiKey, from, to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!res.ok) throw new Error(`Resend HTTP ${res.status}: ${await res.text()}`);
}

async function sendViaBrevo({ apiKey, from, to, subject, html }) {
  const match = from.match(/^(.*)<([^>]+)>$/);
  const sender = match ? { name: match[1].trim(), email: match[2].trim() } : { name: 'GridNova', email: from.trim() };
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({ sender, to: [{ email: to }], subject, htmlContent: html }),
  });
  if (!res.ok) throw new Error(`Brevo HTTP ${res.status}: ${await res.text()}`);
}

const args = process.argv.slice(2);
const argVal = (flag) => {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : null;
};

const testEmail = argVal('--test');
const csvPath = argVal('--csv');
const provider = (argVal('--provider') || (process.env.BREVO_API_KEY ? 'brevo' : 'resend')).toLowerCase();
const doSend = args.includes('--send') || Boolean(testEmail);
const dryRun = args.includes('--dry-run') || !doSend;

const recipients = testEmail
  ? [{ email: testEmail, display_name: 'Tester' }]
  : csvPath
    ? parseCsv(csvPath)
    : [];

if (!recipients.length) {
  console.error('Usage: node scripts/send-winback-email.mjs --test you@example.com | --csv dormant-members.csv [--dry-run|--send] [--provider resend|brevo]');
  process.exit(1);
}

const apiKey = provider === 'brevo' ? process.env.BREVO_API_KEY : process.env.RESEND_API_KEY;
const from = process.env.FROM_EMAIL;

if (!dryRun && (!apiKey || !from)) {
  console.error(`Missing ${provider === 'brevo' ? 'BREVO_API_KEY' : 'RESEND_API_KEY'} or FROM_EMAIL env var.`);
  process.exit(1);
}

console.log(`Provider: ${provider} | Recipients: ${recipients.length} | Mode: ${dryRun ? 'DRY RUN' : 'LIVE SEND'}`);

let sent = 0;
let failed = 0;
for (const r of recipients) {
  if (dryRun) {
    console.log(`[dry-run] -> ${r.email} (${r.display_name || '—'})`);
    sent++;
    continue;
  }
  try {
    const payload = { apiKey, from, to: r.email, subject: SUBJECT, html: buildHtml(r.display_name) };
    if (provider === 'brevo') await sendViaBrevo(payload);
    else await sendViaResend(payload);
    sent++;
    console.log(`[sent ${sent}/${recipients.length}] ${r.email}`);
    // Stay well below free-tier rate limits (~2 req/s).
    await new Promise((resolve) => setTimeout(resolve, 600));
  } catch (err) {
    failed++;
    console.error(`[failed] ${r.email}: ${err.message}`);
  }
}

console.log(`Done. Sent: ${sent}, Failed: ${failed}`);
