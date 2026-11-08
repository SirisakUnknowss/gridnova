import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { askClaude, buildSystemPrompt, ConversationMemory, NO_REPLY, RateLimiter, splitForDiscord } from "../src/answer";

function fakeClient(response: { stop_reason: string; content: { type: string; text?: string }[] }) {
  const calls: unknown[] = [];
  const client = {
    beta: { messages: { create: async (params: unknown) => (calls.push(params), response) } },
  } as unknown as Anthropic;
  return { client, calls };
}

const base = { model: "claude-opus-5-5", system: "sys", history: [], question: "hearts หมดทำไง", authorName: "Mai" };

describe("buildSystemPrompt", () => {
  it("embeds the knowledge base and the bug channel mention", () => {
    const prompt = buildSystemPrompt("123");
    expect(prompt).toContain("Infinite Hearts");
    expect(prompt).toContain("<#123>");
    expect(prompt).toContain("same language");
  });
});

describe("askClaude", () => {
  it("returns the text reply and sends history plus the new question", async () => {
    const { client, calls } = fakeClient({ stop_reason: "end_turn", content: [{ type: "text", text: "เล่น Practice ได้ฟรีค่ะ" }] });
    const reply = await askClaude({ ...base, client, history: [{ role: "user", text: "hi" }, { role: "assistant", text: "hello" }] });
    expect(reply).toBe("เล่น Practice ได้ฟรีค่ะ");
    const params = calls[0] as { messages: { role: string; content: string }[]; fallbacks: string };
    expect(params.messages).toHaveLength(3);
    expect(params.messages[2]).toEqual({ role: "user", content: "Mai: hearts หมดทำไง" });
    expect(params.fallbacks).toBe("default");
  });

  it("stays silent on the no-reply sentinel", async () => {
    const { client } = fakeClient({ stop_reason: "end_turn", content: [{ type: "text", text: NO_REPLY }] });
    expect(await askClaude({ ...base, client })).toBeNull();
  });

  it("stays silent on a refusal", async () => {
    const { client } = fakeClient({ stop_reason: "refusal", content: [] });
    expect(await askClaude({ ...base, client })).toBeNull();
  });
});

describe("splitForDiscord", () => {
  it("keeps short text whole", () => {
    expect(splitForDiscord("hello")).toEqual(["hello"]);
  });

  it("splits long text under the limit on line breaks", () => {
    const text = Array.from({ length: 60 }, (_, i) => `line ${i} ${"x".repeat(50)}`).join("\n");
    const chunks = splitForDiscord(text);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(2000);
    expect(chunks.join("\n")).toBe(text);
  });

  it("hard-cuts text with no break points", () => {
    const chunks = splitForDiscord("a".repeat(4500));
    expect(chunks.map((c) => c.length)).toEqual([2000, 2000, 500]);
  });
});

describe("RateLimiter", () => {
  it("blocks after max hits in the window, then frees up", () => {
    const rl = new RateLimiter(2, 1000);
    expect(rl.allow("u", 0)).toBe(true);
    expect(rl.allow("u", 10)).toBe(true);
    expect(rl.allow("u", 20)).toBe(false);
    expect(rl.allow("other", 20)).toBe(true);
    expect(rl.allow("u", 1500)).toBe(true);
  });
});

describe("ConversationMemory", () => {
  it("keeps the latest turns and forgets after the TTL", () => {
    const mem = new ConversationMemory(4, 1000);
    mem.add("k", "q1", "a1", 0);
    mem.add("k", "q2", "a2", 100);
    mem.add("k", "q3", "a3", 200);
    expect(mem.get("k", 300).map((t) => t.text)).toEqual(["q2", "a2", "q3", "a3"]);
    expect(mem.get("k", 1300)).toEqual([]);
  });
});
