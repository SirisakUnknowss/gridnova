// Every message the bot sees in a help channel, so we can tell which questions
// the FAQ misses and decide later whether AI answers are worth paying for.

export type LoggedQuestion = {
  id: number;
  at: string;
  user_id: string;
  channel_id: string;
  message_id: string;
  content: string;
  topic: string | null;
  replied: number;
  lang: string;
};

export interface QuestionStats {
  total: number;
  answeredByFaq: number;
  unmatched: number;
  byTopic: Record<string, number>;
}

export class QuestionLog {
  constructor(private sql: SqlStorage) {
    sql.exec(`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      at TEXT NOT NULL,
      user_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      content TEXT NOT NULL,
      topic TEXT,
      replied INTEGER NOT NULL,
      lang TEXT NOT NULL
    )`);
  }

  add(q: Omit<LoggedQuestion, "id" | "at" | "replied"> & { replied: boolean }): void {
    this.sql.exec(
      "INSERT INTO questions (at, user_id, channel_id, message_id, content, topic, replied, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      new Date().toISOString(),
      q.user_id,
      q.channel_id,
      q.message_id,
      q.content.slice(0, 2000),
      q.topic,
      q.replied ? 1 : 0,
      q.lang,
    );
  }

  list(opts: { unmatchedOnly?: boolean; limit?: number }): LoggedQuestion[] {
    const limit = Math.min(Math.max(opts.limit ?? 200, 1), 2000);
    const where = opts.unmatchedOnly ? "WHERE topic IS NULL" : "";
    return this.sql.exec<LoggedQuestion>(`SELECT * FROM questions ${where} ORDER BY id DESC LIMIT ?`, limit).toArray();
  }

  stats(): QuestionStats {
    const rows = this.sql
      .exec<{ topic: string | null; n: number }>("SELECT topic, COUNT(*) AS n FROM questions GROUP BY topic")
      .toArray();
    const byTopic: Record<string, number> = {};
    let total = 0;
    let unmatched = 0;
    for (const r of rows) {
      total += r.n;
      if (r.topic === null) unmatched += r.n;
      else byTopic[r.topic] = r.n;
    }
    return { total, answeredByFaq: total - unmatched, unmatched, byTopic };
  }
}
