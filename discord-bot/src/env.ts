export interface Env {
  GATEWAY: DurableObjectNamespace<import("./gateway").GatewayBot>;
  DISCORD_BOT_TOKEN: string;
  ANTHROPIC_API_KEY: string;
  ADMIN_TOKEN?: string;
  HELP_CHANNEL_IDS: string;
  BUG_REPORT_CHANNEL_ID?: string;
  CLAUDE_MODEL: string;
  MAX_DAILY_REPLIES: string;
}
