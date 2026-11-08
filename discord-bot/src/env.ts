export interface Env {
  GATEWAY: DurableObjectNamespace<import("./gateway").GatewayBot>;
  DISCORD_BOT_TOKEN: string;
  /** Only needed when BOT_MODE is "ai". */
  ANTHROPIC_API_KEY?: string;
  ADMIN_TOKEN?: string;
  /** "faq" (default, free canned answers) or "ai" (Claude). */
  BOT_MODE?: string;
  HELP_CHANNEL_IDS: string;
  BUG_REPORT_CHANNEL_ID?: string;
  CLAUDE_MODEL: string;
  MAX_DAILY_REPLIES: string;
}
