// =====================================================================
// User-facing release notes ("What's New"). Curated Thai copy — this is
// the source of truth for the in-app What's New modal (src/ui/views/
// whats-new.ts). Keep the newest release first. Developer-facing detail
// lives in CHANGELOG.md; this is the friendly, player-facing version.
// =====================================================================

export interface ReleaseNote {
  version: string;
  date: string; // YYYY-MM-DD
  title: string;
  changes: { icon: string; text: string }[];
}

export const RELEASES: ReleaseNote[] = [
  {
    version: '1.4.0',
    date: '2026-07-16',
    title: 'ปรับสมดุลเหรียญ & ระบบเลเวลใหม่',
    changes: [
      { icon: '🪙', text: 'ปรับสูตรรางวัลเหรียญ/XP ของเหรียญตราใหม่ทั้งหมด ให้สมดุลกับร้านค้ามากขึ้น — ยอดเหรียญและเลเวลของทุกบัญชีถูกคำนวณใหม่ตามสูตรนี้ (ถ้าเห็นตัวเลขเปลี่ยน ไม่ใช่บั๊กนะ เป็นการปรับสมดุลรอบใหญ่)' },
      { icon: '📈', text: 'ไต่เลเวลได้เร็วขึ้นมาก จากเดิมที่ต้องใช้ XP มหาศาลกว่าจะถึงเลเวลสูงๆ' },
      { icon: '🎁', text: 'เลเวลมีประโยชน์จริงแล้ว! โหมด Practice/Random ได้ hint ฟรีเพิ่มตามเลเวล (สูงสุด +3)' },
      { icon: '⚙️', text: 'เพิ่มหน้า Settings — ตั้งค่าเกม, บัญชี, ลิงก์คอมมูนิตี้ทางการ และ What’s New' },
    ],
  },
  {
    version: '1.3.2',
    date: '2026-07-14',
    title: 'แก้เควสรายวัน',
    changes: [
      { icon: '🗓️', text: 'แก้เวลารีเซ็ตเควสให้ตรงกันทั้งระบบ (เที่ยงคืน UTC = 07:00 น. ไทย) — เดิมเล่นช่วงตี 0 ถึง 7 โมงเช้าแล้วเควสอาจไม่นับ' },
      { icon: '🎯', text: 'ปรับจำนวนเควสต่อวันจาก 6 เหลือ 5 ใบ' },
    ],
  },
];
