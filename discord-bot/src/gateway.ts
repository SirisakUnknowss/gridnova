import { DurableObject } from "cloudflare:workers";
import Anthropic from "@anthropic-ai/sdk";
import type { Env } from "./env";
import { askClaude, buildSystemPrompt, ConversationMemory, RateLimiter, splitForDiscord } from "./answer";
import { sendReply, triggerTyping } from "./discord";

const GATEWAY_URL = "https://gateway.discord.gg/?v=10&encoding=json";
// GUILDS | GUILD_MESSAGES | MESSAGE_CONTENT (privileged — enable it in the Developer Portal)
const INTENTS = (1 << 0) | (1 << 9) | (1 << 15);
const WATCHDOG_MS = 60_000;
// Close codes where reconnecting would just fail again (bad token, missing intents…).
const FATAL_CLOSE_CODES = new Set([4004, 4010, 4011, 4012, 4013, 4014]);

interface GatewayPayload {
  op: number;
  d: unknown;
  s: number | null;
  t: string | null;
}

interface DiscordMessage {
  id: string;
  channel_id: string;
  guild_id?: string;
  content: string;
  author: { id: string; username: string; global_name?: string | null; bot?: boolean };
  member?: { nick?: string | null };
  mentions?: { id: string }[];
  referenced_message?: { author: { id: string } } | null;
  webhook_id?: string;
}

interface ThreadChannel {
  id: string;
  parent_id?: string | null;
}

export class GatewayBot extends DurableObject<Env> {
  private ws: WebSocket | null = null;
  private seq: number | null = null;
  private sessionId: string | null = null;
  private resumeUrl: string | null = null;
  private botUserId: string | null = null;
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private awaitingAck = false;
  private lastAckAt = 0;
  private fatalError: string | null = null;
  private connecting = false;

  private helpThreads = new Set<string>();
  private perUser = new RateLimiter(5, 10 * 60_000);
  private memory = new ConversationMemory();
  private anthropic: Anthropic | null = null;
  private systemPrompt: string | null = null;

  async ensureConnected(): Promise<void> {
    await this.ctx.storage.setAlarm(Date.now() + WATCHDOG_MS);
    if (this.fatalError || this.connecting) return;
    const stale = this.lastAckAt && Date.now() - this.lastAckAt > 3 * WATCHDOG_MS;
    if (this.ws && !stale) return;
    await this.openSocket();
  }

  async status(): Promise<Record<string, unknown>> {
    return {
      connected: !!this.ws,
      botUserId: this.botUserId,
      lastAckSecondsAgo: this.lastAckAt ? Math.round((Date.now() - this.lastAckAt) / 1000) : null,
      fatalError: this.fatalError,
      repliesToday: await this.repliesToday(),
    };
  }

  /** Clears a fatal state after you fix the cause (e.g. enabled Message Content intent). */
  async reset(): Promise<void> {
    this.fatalError = null;
    this.sessionId = null;
    this.closeSocket();
    await this.ensureConnected();
  }

  async alarm(): Promise<void> {
    await this.ensureConnected();
  }

  private async openSocket(): Promise<void> {
    this.connecting = true;
    try {
      this.closeSocket();
      const base = this.resumeUrl && this.sessionId ? this.resumeUrl.replace(/^wss:/, "https:") : GATEWAY_URL;
      const url = base.includes("?") ? base : `${base}/?v=10&encoding=json`;
      const res = await fetch(url, { headers: { Upgrade: "websocket" } });
      const ws = res.webSocket;
      if (!ws) throw new Error(`Gateway upgrade failed: ${res.status}`);
      ws.accept();
      this.ws = ws;
      this.lastAckAt = Date.now();
      // Events from a socket we've already replaced must not touch the new one.
      ws.addEventListener("message", (ev) => {
        if (this.ws === ws && typeof ev.data === "string") this.onPayload(JSON.parse(ev.data) as GatewayPayload);
      });
      ws.addEventListener("close", (ev) => {
        if (this.ws === ws) this.onClose(ev.code, ev.reason);
      });
      ws.addEventListener("error", () => {
        if (this.ws === ws) this.onClose(1006, "socket error");
      });
    } catch (err) {
      console.error("Gateway connect failed", err);
      this.ws = null;
    } finally {
      this.connecting = false;
    }
  }

  private closeSocket(): void {
    if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
    this.heartbeatTimer = null;
    const ws = this.ws;
    this.ws = null;
    try {
      ws?.close(4000, "reconnecting");
    } catch {
      /* already closed */
    }
  }

  private onClose(code: number, reason: string): void {
    console.warn(`Gateway closed ${code} ${reason}`);
    this.ws = null;
    if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
    if (FATAL_CLOSE_CODES.has(code)) {
      this.fatalError = `Discord closed the connection with ${code} ${reason}. Check the bot token and that the Message Content intent is enabled, then call /admin/reset.`;
      return;
    }
    if (code === 4007 || code === 4009) this.sessionId = null;
    this.ctx.waitUntil(new Promise((r) => setTimeout(r, 2000)).then(() => this.ensureConnected()));
  }

  private send(payload: { op: number; d: unknown }): void {
    this.ws?.send(JSON.stringify(payload));
  }

  private heartbeat(intervalMs: number): void {
    if (this.awaitingAck) {
      // Zombie connection: Discord stopped acknowledging, so drop it and resume.
      this.closeSocket();
      this.ctx.waitUntil(this.ensureConnected());
      return;
    }
    this.awaitingAck = true;
    this.send({ op: 1, d: this.seq });
    this.heartbeatTimer = setTimeout(() => this.heartbeat(intervalMs), intervalMs);
  }

  private onPayload(p: GatewayPayload): void {
    if (p.s !== null) this.seq = p.s;
    switch (p.op) {
      case 10: {
        const interval = (p.d as { heartbeat_interval: number }).heartbeat_interval;
        this.awaitingAck = false;
        this.heartbeatTimer = setTimeout(() => this.heartbeat(interval), Math.random() * interval);
        this.identifyOrResume();
        break;
      }
      case 11:
        this.awaitingAck = false;
        this.lastAckAt = Date.now();
        break;
      case 1:
        this.send({ op: 1, d: this.seq });
        break;
      case 7:
        this.closeSocket();
        this.ctx.waitUntil(this.ensureConnected());
        break;
      case 9:
        if (!p.d) this.sessionId = null;
        this.closeSocket();
        this.ctx.waitUntil(new Promise((r) => setTimeout(r, 3000)).then(() => this.ensureConnected()));
        break;
      case 0:
        this.onDispatch(p.t ?? "", p.d);
        break;
    }
  }

  private identifyOrResume(): void {
    const token = this.env.DISCORD_BOT_TOKEN;
    if (this.sessionId) {
      this.send({ op: 6, d: { token, session_id: this.sessionId, seq: this.seq } });
      return;
    }
    this.send({
      op: 2,
      d: {
        token,
        intents: INTENTS,
        properties: { os: "linux", browser: "gridnova-bot", device: "gridnova-bot" },
        presence: {
          status: "online",
          afk: false,
          since: null,
          activities: [{ name: "Custom Status", type: 4, state: "Ask me anything about GridNova" }],
        },
      },
    });
  }

  private onDispatch(type: string, d: unknown): void {
    switch (type) {
      case "READY": {
        const ready = d as { session_id: string; resume_gateway_url: string; user: { id: string } };
        this.sessionId = ready.session_id;
        this.resumeUrl = ready.resume_gateway_url;
        this.botUserId = ready.user.id;
        break;
      }
      case "GUILD_CREATE":
        for (const t of (d as { threads?: ThreadChannel[] }).threads ?? []) this.trackThread(t);
        break;
      case "THREAD_CREATE":
      case "THREAD_UPDATE":
        this.trackThread(d as ThreadChannel);
        break;
      case "MESSAGE_CREATE":
        this.ctx.waitUntil(this.onMessage(d as DiscordMessage));
        break;
    }
  }

  private helpChannels(): Set<string> {
    return new Set(this.env.HELP_CHANNEL_IDS.split(",").map((s) => s.trim()).filter(Boolean));
  }

  /** Forum-style help channels deliver posts as threads, so track threads whose parent is a help channel. */
  private trackThread(t: ThreadChannel): void {
    if (t.parent_id && this.helpChannels().has(t.parent_id)) this.helpThreads.add(t.id);
  }

  private async onMessage(m: DiscordMessage): Promise<void> {
    if (m.author.bot || m.webhook_id || !m.guild_id || !this.botUserId) return;

    const mentioned = m.mentions?.some((u) => u.id === this.botUserId) ?? false;
    const repliedToBot = m.referenced_message?.author.id === this.botUserId;
    const inHelp = this.helpChannels().has(m.channel_id) || this.helpThreads.has(m.channel_id);
    if (!inHelp && !mentioned && !repliedToBot) return;

    const question = m.content.replace(new RegExp(`<@!?${this.botUserId}>`, "g"), "").trim();
    if (!question) return;

    if (!this.perUser.allow(m.author.id)) return;
    if (!(await this.takeDailySlot())) return;

    const token = this.env.DISCORD_BOT_TOKEN;
    const memoryKey = `${m.channel_id}:${m.author.id}`;
    try {
      await triggerTyping(token, m.channel_id);
      const reply = await askClaude({
        client: (this.anthropic ??= new Anthropic({ apiKey: this.env.ANTHROPIC_API_KEY })),
        model: this.env.CLAUDE_MODEL || "claude-opus-5-5",
        system: (this.systemPrompt ??= buildSystemPrompt(this.env.BUG_REPORT_CHANNEL_ID || undefined)),
        history: this.memory.get(memoryKey),
        question,
        authorName: m.member?.nick || m.author.global_name || m.author.username,
      });
      if (!reply) return;
      this.memory.add(memoryKey, question, reply);
      const chunks = splitForDiscord(reply);
      for (const [i, chunk] of chunks.entries()) {
        await sendReply(token, m.channel_id, chunk, i === 0 ? m.id : undefined);
      }
    } catch (err) {
      console.error("Failed to answer message", err);
    }
  }

  private dayKey(): string {
    return `replies:${new Date().toISOString().slice(0, 10)}`;
  }

  private async repliesToday(): Promise<number> {
    return (await this.ctx.storage.get<number>(this.dayKey())) ?? 0;
  }

  private async takeDailySlot(): Promise<boolean> {
    const max = Number(this.env.MAX_DAILY_REPLIES) || 400;
    const used = await this.repliesToday();
    if (used >= max) return false;
    await this.ctx.storage.put(this.dayKey(), used + 1);
    return true;
  }
}
