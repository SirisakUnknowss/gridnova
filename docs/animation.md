# GridNova — Animation Inventory

## ✅ มีแล้ว

### Splash Screen
- **Logo pop-in** — board scale จาก 0.8 → 1 พร้อม spring bounce (`cubic-bezier(0.34,1.56,0.64,1)`)
- **Grid lines draw** — เส้น grid ขยายจาก stroke-width 0 (`grid-draw`)
- **Numbers pop in sequence** — ตัวเลข 7 ตัวโผล่ทีละตัวพร้อม delay (`num-pop`)
- **Title slide up** — "GridNova" fade + translateY เข้ามา
- **Dots bounce** — จุด loading เด้งขึ้นลงสลับกัน
- **Splash leave** — fade out + scale เล็กลงตอน transition ออก

### UI ทั่วไป
- **Modal / sheet slide up** — `slideUp` 0.28–0.3s cubic-bezier (ใช้ทั้ง win modal, share modal)
- **Page fade in** — `fadeIn` 0.2s ตอนเปลี่ยน view
- **Button tap** — `transform: scale(0.96)` ตอน active
- **Spinner** — `spin` 1s infinite สำหรับ loading states

### Shop
- **Coin count-up** — ตัวเลขไหลจาก A → B ด้วย ease-out cubic (`countUp` ใน `animate.ts`)
- **Float reward** — "+50 💰" ลอยขึ้นแล้วหาย (`floatUp` + `.float-reward`)
- **Shop card hover** — `translateY(-2px)` transition

### Leaderboard
- **Row flash** — `lbFlash` highlight แถวที่ rank เปลี่ยน
- **Skeleton shimmer** — `lbShimmer` ไหลซ้าย-ขวาขณะโหลด

### Level Up
- **Stars pulse** — `lvlPulse` scale 1 → 1.15 infinite

### Background Themes
- **Rain** — CSS `rainShift` 0.7s linear infinite
- **Stars** — `starsTwinkle` 4s ease-in-out alternate
- **Aurora** — `auroraShift` 14s ease infinite
- **Body background** — `transition: background 0.4s ease` ตอนเปลี่ยน theme

### Daily Live Indicator
- **Live dot pulse** — `live-pulse` 1.6s ease-in-out infinite (dot สีแดงข้าง "Daily Puzzle")

### Win Modal (เพิ่งเพิ่ม)
- **Confetti / ribbon** — 120 ชิ้น canvas animation, gravity + sway + rotation, fade ตอนตกถึงก้นจอ

---

## ❌ ยังไม่มี

### In-game Interactions (สำคัญมาก)
| สถานการณ์ | Animation ที่ควรมี |
|---|---|
| กรอกตัวเลขถูก | cell pop / scale เล็กน้อย + สีเขียวแว่บ |
| กรอกผิด | cell shake ซ้าย-ขวา + สีแดง flash |
| ครบ box/row/column | glow sweep ไปตาม region ที่สมบูรณ์ |
| เลือก cell | ripple เล็กๆ จาก touch point |
| กด numpad | ripple / press feedback บน button |
| number placement ที่ conflict | cells ที่ conflict nudge หรือ pulse พร้อมกัน |

### Win / Completion
| | |
|---|---|
| Score count-up | ตัวเลขไหลจาก 0 → score จริงตอน modal เปิด |
| Trophy entrance | trophy icon drop + bounce เข้ามา |
| Rank reveal | rank number count-up พร้อม delay หลัง score |
| Personal Best badge | badge pop + shimmer |
| Streak milestone | streak badge pulse + particle burst เล็กๆ |

### Transitions & Flow
| | |
|---|---|
| View transitions | ปัจจุบัน fade เฉยๆ — ควรเป็น slide หรือ shared element transition |
| Tab switching | bottom nav indicator slide ไปตาม tab ที่เลือก |
| Sheet/modal dismiss | drag-to-dismiss พร้อม spring back |
| Coin spend | coin icon fly จาก wallet ไปที่ item |

### Feedback & Delight
| | |
|---|---|
| Daily streak check-in | streak counter roll-up + fire animation |
| XP bar fill | bar fill animation พร้อม glow ตอน level up |
| Quest complete | progress bar ไหลครบ + checkmark pop |
| Achievement unlock | toast slide in พร้อม particle burst |
| First-time solve | special celebration ที่ต่างจาก win ปกติ |

---

## Priority แนะนำ

1. **Cell shake ตอนผิด** — feedback สำคัญที่สุด, ทำใน CSS เลย 3 บรรทัด
2. **Score count-up ใน win modal** — ใช้ `countUp()` ที่มีอยู่แล้ว
3. **Cell pop ตอนถูก** — micro-animation ทำให้รู้สึก satisfying
4. **Region complete glow** — payoff ตอนครบ box/row/col
5. **View slide transition** — polish โดยรวม
