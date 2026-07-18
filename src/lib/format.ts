// =====================================================================
// Format utilities
// =====================================================================

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Monday (UTC) of the current week — the key weekly quests are stored under. */
export function weekStartUtc(): string {
  const d = new Date();
  const dow = d.getUTCDay(); // 0=Sun..6=Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );
}
