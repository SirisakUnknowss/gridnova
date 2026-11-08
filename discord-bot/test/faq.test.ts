import { describe, expect, it } from "vitest";
import { answerFaq, detectLang, fallbackText, FAQ, isMenuRequest, looksLikeQuestion, matchFaq, menuText } from "../src/faq";

describe("matchFaq", () => {
  const cases: [string, string][] = [
    ["หัวใจหมดทำไงครับ", "hearts"],
    ["how do hearts work?", "hearts"],
    ["ซื้อคำใบ้เพิ่มได้ไหม", "hints"],
    ["can I buy more hints in daily", "hints"],
    ["ผิด 3 ครั้งแล้วเล่นต่อได้มั้ย", "continue"],
    ["โจทย์รายวันเปลี่ยนกี่โมง", "daily"],
    ["time attack ต้องสมัครไหม", "modes"],
    ["รางวัลรายเดือนรับยังไง", "monthly"],
    ["เหรียญได้จากไหนบ้าง", "coins"],
    ["เปลี่ยนเครื่องแล้วข้อมูลหาย", "account"],
    ["game won't update", "update"],
    ["เจอบั๊กเกมค้าง", "bug"],
    ["star mode มาเมื่อไหร่", "upcoming"],
    ["sudoku เล่นยังไง กติกาคืออะไร", "rules"],
  ];
  it.each(cases)("%s → %s", (q, id) => {
    expect(matchFaq(q)?.id).toBe(id);
  });

  it("returns null for unrelated chat", () => {
    expect(matchFaq("สวัสดีทุกคน")).toBeNull();
    expect(matchFaq("nice game!")).toBeNull();
  });

  it("matches Latin keywords on word boundaries only", () => {
    expect(matchFaq("multiple choices")).toBeNull();
  });
});

describe("language and intent", () => {
  it("detects Thai vs English", () => {
    expect(detectLang("หัวใจหมด")).toBe("th");
    expect(detectLang("hearts")).toBe("en");
  });

  it("recognises questions but not small talk", () => {
    expect(looksLikeQuestion("อันนี้ทำยังไง")).toBe(true);
    expect(looksLikeQuestion("where is the shop")).toBe(true);
    expect(looksLikeQuestion("ok?")).toBe(true);
    expect(looksLikeQuestion("ขอบคุณครับ")).toBe(false);
    expect(looksLikeQuestion("this is great")).toBe(false);
  });

  it("recognises menu requests", () => {
    expect(isMenuRequest("faq")).toBe(true);
    expect(isMenuRequest(" !help ")).toBe(true);
    expect(isMenuRequest("faq about hearts")).toBe(false);
  });
});

describe("reply text", () => {
  it("fills the bug channel mention and stays under Discord's limit", () => {
    const bug = FAQ.find((e) => e.id === "bug")!;
    expect(answerFaq(bug, "th", "<#1>")).toContain("<#1>");
    for (const e of FAQ) {
      expect(e.th.length).toBeLessThan(2000);
      expect(e.en.length).toBeLessThan(2000);
    }
    expect(menuText("th").length).toBeLessThan(2000);
    expect(fallbackText("en", "<#1>")).toContain("<#1>");
  });
});
