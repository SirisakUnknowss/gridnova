import { afterEach, expect, it, vi } from 'vitest';
import { THEMES, applyTheme } from '../../src/lib/themes';
import { THEME_ICON_SKINS, themeIconProperties } from '../../src/lib/theme-icons';
import { ic } from '../../src/ui/icons';

afterEach(() => { vi.unstubAllGlobals(); });

it('covers every shop and monthly theme with its own full-object icon pack', () => {
  expect(Object.keys(THEME_ICON_SKINS).sort()).toEqual(Object.keys(THEMES).sort());
  expect(new Set(Object.values(THEME_ICON_SKINS)).size).toBe(35);
  const atlases = new Set(Object.keys(THEMES).map(id => themeIconProperties(id)['--theme-icon-atlas']));
  expect(atlases.size).toBe(35);
  for (const atlas of atlases) expect(atlas).toContain('skin-theme_');
});

it('switches complete packs with the equipped theme while keeping a preview isolated', () => {
  const active = new Map<string, string>();
  const preview = new Map<string, string>();
  const makeRoot = (values: Map<string, string>) => ({ dataset: {}, style: { setProperty: (key: string, value: string) => values.set(key, value) } }) as unknown as HTMLElement;
  const root = makeRoot(active);
  const scene = makeRoot(preview);
  vi.stubGlobal('document', { documentElement: root });
  const save = vi.fn();
  vi.stubGlobal('localStorage', { setItem: save });
  applyTheme('theme_classic', root);
  applyTheme('theme_christmas_eve', scene);
  expect(active.get('--theme-icon-atlas')).not.toBe(preview.get('--theme-icon-atlas'));
  expect(save).toHaveBeenCalledTimes(1);
  applyTheme('theme_christmas_eve', root);
  expect(active.get('--theme-icon-atlas')).toBe(preview.get('--theme-icon-atlas'));
  applyTheme('theme_classic', root);
  expect(active.get('--theme-icon-atlas')).toBe(themeIconProperties('theme_classic')['--theme-icon-atlas']);
  expect(themeIconProperties('unknown-theme')).toEqual(themeIconProperties('theme_classic'));
});

it('uses functional vector symbols for small controls and preserves currency, identity and game controls', () => {
  for (const icon of [ic.home, ic.profile, ic.shop, ic.achievements, ic.daily, ic.practice, ic.gamepad, ic.quests, ic.trophy, ic.clock]) {
    expect(icon(32)).toContain('class="functional-icon"');
    expect(icon(32)).not.toContain('theme-icon-picture');
    expect(icon(32)).not.toContain('theme-icon-ornament');
    expect(icon(32)).not.toContain('<img');
    expect(icon(32)).toContain('aria-hidden="true"');
  }
  for (const icon of [ic.coin, ic.heart, ic.guest, ic.member, ic.back, ic.close, ic.undo, ic.redo, ic.erase, ic.notes, ic.hint, ic.soundOff]) {
    expect(icon(24)).not.toContain('functional-icon');
  }
});
