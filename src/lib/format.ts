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

/** Short form for tight spots like the home header pill, where a six-figure
 *  balance pushes the row wider than a phone screen. */
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs < 10_000) return n.toLocaleString();
  const round1 = (v: number) => (Math.round(v * 10) / 10).toString();
  // 999_950 not 1_000_000 — anything above it rounds to 1000K, which reads worse than 1M.
  if (abs < 999_950) return `${round1(n / 1_000)}K`;
  return `${round1(n / 1_000_000)}M`;
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
