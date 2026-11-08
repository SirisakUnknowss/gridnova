const API = "https://discord.com/api/v10";

async function call(token: string, path: string, body?: unknown): Promise<Response> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "DiscordBot (https://gridnova.pages.dev, 0.1.0)",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) console.warn(`Discord ${path} -> ${res.status} ${await res.text()}`);
  return res;
}

export function triggerTyping(token: string, channelId: string): Promise<Response> {
  return call(token, `/channels/${channelId}/typing`);
}

export function sendReply(token: string, channelId: string, content: string, replyToId?: string): Promise<Response> {
  return call(token, `/channels/${channelId}/messages`, {
    content,
    // Model output must never be able to ping @everyone, roles or other users.
    allowed_mentions: { parse: [], replied_user: false },
    ...(replyToId ? { message_reference: { message_id: replyToId, fail_if_not_exists: false } } : {}),
  });
}
