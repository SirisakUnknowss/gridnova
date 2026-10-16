import { afterEach, expect, it, vi } from 'vitest';
import { launchedMonthly, currentMonthly, monthlyWelcomeKey, monthlyWelcomeSeen, markMonthlyWelcomeSeen } from '../../src/lib/monthly-discovery';
import { MONTHLY_COLLECTIONS } from '../../src/lib/monthly-catalog';

afterEach(() => { vi.unstubAllGlobals(); });

it('keeps discovery closed before the UTC launch and on missing or invalid clock responses', () => {
  for (const date of [null, '', '2026-10-31', '2026-11-00', '2026-11-31', '2026-99-01']) expect(launchedMonthly(date)).toBe(false);
  expect(launchedMonthly('2026-11-01')).toBe(true);
  expect(currentMonthly('2026-10-31')).toBeUndefined();
});

it('switches collections at month boundaries and never advertises an expired collection as a new month', () => {
  expect(currentMonthly('2026-11-30')?.title).toBe('Moonlit Wishes');
  expect(currentMonthly('2026-12-01')?.title).toBe('Christmas Day');
  expect(currentMonthly('2027-02-28')?.month).toBe('2027-02');
  expect(currentMonthly('2027-03-01')?.month).toBe('2027-03');
  expect(currentMonthly('2027-11-01')).toBeUndefined();
  for (const collection of MONTHLY_COLLECTIONS) {
    expect(currentMonthly(collection.start)).toBe(collection);
    expect(currentMonthly(collection.end)).toBe(collection);
    expect(collection.rewards).toHaveLength(6);
  }
});

it('acknowledges only the current account and month, including guest/member separation', () => {
  const saved = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => saved.get(key) ?? null, setItem: (key: string, value: string) => saved.set(key, value) });
  expect(monthlyWelcomeSeen('member-a', '2026-11')).toBe(false);
  markMonthlyWelcomeSeen('member-a', '2026-11');
  expect(monthlyWelcomeSeen('member-a', '2026-11')).toBe(true);
  expect(saved.get(monthlyWelcomeKey('member-a', '2026-11'))).toBe('seen');
  expect(monthlyWelcomeSeen('member-a', '2026-12')).toBe(false);
  expect(monthlyWelcomeSeen('member-b', '2026-11')).toBe(false);
  expect(monthlyWelcomeSeen('guest', '2026-11')).toBe(false);
});

it('does not repeatedly interrupt the same session when storage is blocked', () => {
  vi.stubGlobal('localStorage', { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); } });
  expect(monthlyWelcomeSeen('private-member', '2027-01')).toBe(false);
  markMonthlyWelcomeSeen('private-member', '2027-01');
  expect(monthlyWelcomeSeen('private-member', '2027-01')).toBe(true);
});
