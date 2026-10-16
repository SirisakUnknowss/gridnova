import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { THEME_ICON_SKINS, THEME_CONTROL_SKINS } from '../../src/lib/theme-icons';

interface PackReport { id: string; file: string; bytes: number; width: number; height: number; sha256: string; cell_occupancy: number[] }

it('ships nine nonempty, transparent full-object cells per theme with distinct actual image files', () => {
  const reports = JSON.parse(readFileSync(resolve('assets/space/theme-icons/full-icon-assets.json'), 'utf8')) as PackReport[];
  expect(reports.map(row => row.id).sort()).toEqual(Object.keys(THEME_ICON_SKINS).sort());
  const hashes = new Set<string>();
  for (const report of reports) {
    const file = readFileSync(resolve(report.file));
    const hash = createHash('sha256').update(file).digest('hex');
    expect(hash).toBe(report.sha256);
    expect(file.length).toBe(report.bytes);
    expect(report.width).toBe(report.height);
    expect(report.width).toBeGreaterThanOrEqual(768);
    expect(report.cell_occupancy).toHaveLength(9);
    for (const occupied of report.cell_occupancy) {
      expect(occupied).toBeGreaterThan(.05);
      expect(occupied).toBeLessThan(.95);
    }
    hashes.add(hash);
  }
  expect(hashes.size).toBe(35);
});

it('ships a separate readable bitmap pack for every theme without replacing its detailed original', () => {
  const reports = JSON.parse(readFileSync(resolve('assets/space/theme-icons/readable-icon-assets.json'), 'utf8')) as PackReport[];
  const originals = JSON.parse(readFileSync(resolve('assets/space/theme-icons/full-icon-assets.json'), 'utf8')) as PackReport[];
  expect(reports.map(row => row.id).sort()).toEqual(Object.keys(THEME_CONTROL_SKINS).sort());
  const originalHashes = new Set(originals.map(row => row.sha256));
  const hashes = new Set<string>();
  for (const report of reports) {
    const file = readFileSync(resolve(report.file));
    const hash = createHash('sha256').update(file).digest('hex');
    expect(hash).toBe(report.sha256);
    expect(originalHashes.has(hash)).toBe(false);
    expect(report.file).toContain('/readable/skin-readable-');
    expect(file.length).toBe(report.bytes);
    expect(report.width).toBe(report.height);
    expect(report.cell_occupancy).toHaveLength(9);
    for (const occupied of report.cell_occupancy) {
      expect(occupied).toBeGreaterThan(.05);
      expect(occupied).toBeLessThan(.95);
    }
    hashes.add(hash);
  }
  expect(hashes.size).toBe(35);
});
