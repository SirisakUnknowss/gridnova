import { MONTHLY_COLLECTIONS, type MonthlyCollection } from './monthly-catalog';

export function launchedMonthly(today: string | null): boolean {
  if (!today || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return false;
  const timestamp = Date.parse(`${today}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === today && today >= MONTHLY_COLLECTIONS[0].start;
}

export function currentMonthly(today: string | null): MonthlyCollection | undefined {
  if (!today || !launchedMonthly(today)) return undefined;
  return MONTHLY_COLLECTIONS.find(item => item.month === today.slice(0, 7));
}

const acknowledged = new Set<string>();
export function monthlyWelcomeKey(account: string, month: string): string {
  return `gn_monthly_welcome_v1:${account}:${month}`;
}

export function monthlyWelcomeSeen(account: string, month: string): boolean {
  const key = monthlyWelcomeKey(account, month);
  if (acknowledged.has(key)) return true;
  try { return localStorage.getItem(key) === 'seen'; } catch { return false; }
}

export function markMonthlyWelcomeSeen(account: string, month: string): void {
  const key = monthlyWelcomeKey(account, month);
  acknowledged.add(key);
  try { localStorage.setItem(key, 'seen'); } catch { /* Keep dismissal usable when device storage is unavailable. */ }
}
