import type { Env } from "./env";

export { GatewayBot } from "./gateway";

function gateway(env: Env) {
  return env.GATEWAY.get(env.GATEWAY.idFromName("main"));
}

function authorized(req: Request, env: Env): boolean {
  return !!env.ADMIN_TOKEN && req.headers.get("Authorization") === `Bearer ${env.ADMIN_TOKEN}`;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const { pathname } = url;
    if (pathname.startsWith("/admin/")) {
      if (!authorized(req, env)) return new Response("Unauthorized", { status: 401 });
      const bot = gateway(env);
      if (pathname === "/admin/questions") {
        const unmatched = url.searchParams.get("unmatched") === "1";
        const limit = Number(url.searchParams.get("limit")) || 200;
        return Response.json(await bot.listQuestions(unmatched, limit));
      }
      if (pathname === "/admin/start") await bot.ensureConnected();
      else if (pathname === "/admin/reset") await bot.reset();
      else if (pathname !== "/admin/status") return new Response("Not found", { status: 404 });
      return Response.json(await bot.status());
    }
    return new Response("GridNova Discord bot");
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(gateway(env).ensureConnected());
  },
} satisfies ExportedHandler<Env>;
