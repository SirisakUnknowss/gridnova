import { afterEach, expect, it, vi } from 'vitest';
import { applyTheme, THEMES } from '../../src/lib/themes';
afterEach(() => { vi.unstubAllGlobals(); });
it('keeps Dark Mode cells dark in previews and resets them when returning to Classic', () => {
  const values = new Map<string, string>();
  const root = { dataset: {}, style: { setProperty: (key: string, value: string) => values.set(key, value) } } as unknown as HTMLElement;
  vi.stubGlobal('document', { documentElement: {} });
  const write = vi.fn();
  vi.stubGlobal('localStorage', { setItem: write });
  applyTheme('theme_dark', root);
  expect(values.get('--cell-bg')).toBe(THEMES.theme_dark.tokens['--cell-bg']);
  expect(values.get('--cell-text')).toBe(THEMES.theme_dark.tokens['--cell-text']);
  expect(values.get('--app-card')).toBe(values.get('--cell-bg'));
  expect(values.get('--app-text')).toBe(values.get('--cell-text'));
  expect(write).not.toHaveBeenCalled();
  applyTheme('theme_classic', root);
  expect(values.get('--cell-bg')).not.toBe(THEMES.theme_dark.tokens['--cell-bg']);
  expect(values.get('--app-text')).not.toBe(THEMES.theme_dark.tokens['--cell-text']);
});
