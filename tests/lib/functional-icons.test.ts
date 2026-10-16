import { expect, it } from 'vitest';
import { functionalIconHTML, type FunctionalIconRole } from '../../src/ui/components/functional-icon';
import { themeArtHTML } from '../../src/ui/components/theme-art';

it('keeps nine distinct functional silhouettes without raster art, tiny decorations or filters', () => {
  const roles: FunctionalIconRole[] = ['home', 'medals', 'shop', 'profile', 'daily', 'practice', 'mode', 'quests', 'clock'];
  const drawings = roles.map(role => functionalIconHTML(role));
  expect(new Set(drawings).size).toBe(9);
  for (const [index, drawing] of drawings.entries()) {
    expect(drawing).toContain(`data-icon="${roles[index]}"`);
    expect(drawing).toContain('viewBox="0 0 24 24"');
    expect(drawing).toContain('stroke-width="2"');
    expect(drawing).not.toMatch(/<image|<filter|<pattern|\.webp|ornament/);
  }
});

it('renders themed control bitmaps while retaining the archived vector alternative', () => {
  expect(themeArtHTML('/calendar.webp', 180, 'hero')).toContain('theme-icon-picture');
  for (const size of [22, 30, 40]) {
    const control = themeArtHTML('/archived-detailed-art.webp', size, 'shop');
    expect(control).toContain(`--icon-size:${size}px`);
    expect(control).toContain('theme-icon--shop');
    expect(control).toContain('theme-icon-picture');
    expect(control).not.toContain('<svg');
  }
});
