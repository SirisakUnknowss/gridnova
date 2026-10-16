import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { MONTHLY_2027 } from '../../src/lib/monthly-2027';
import { activeMonthlyCollection } from '../../src/lib/monthly-catalog';
import { monthCells } from '../../src/lib/monthly-challenge';
import { solve, countSolutions } from '../../src/engine/solver';
import type { Board } from '../../src/engine/types';
import { YEAR_ART, YEAR_AVATARS, YEAR_BACKGROUNDS, YEAR_FRAMES } from '../../src/lib/monthly-2027-art';
import { YEAR_THEMES } from '../../src/lib/monthly-2027-themes';

it('provides ten month-scoped collections with all reachable milestones', () => {
  expect(MONTHLY_2027).toHaveLength(10);
  const ids = MONTHLY_2027.flatMap(c => c.rewards.map(r => r.id));
  expect(new Set(ids).size).toBe(60);
  for (const c of MONTHLY_2027) {
    expect(activeMonthlyCollection(c.start).month).toBe(c.month);
    expect(monthCells(2027,Number(c.month.slice(5))).filter(Boolean)).toHaveLength(c.days);
    expect(c.rewards).toHaveLength(6);
    expect(c.rewards[5].days).toBe(Math.min(c.days,30));
    expect(YEAR_ART[c.hero]).toBeTruthy();
    for (const r of c.rewards) {
      expect(YEAR_ART[r.art]).toBeTruthy();
      if (r.type==='Avatar') expect(YEAR_AVATARS[r.id]).toBeTruthy();
      if (r.type==='Frame') expect(YEAR_FRAMES.some(f=>f.id===r.id)).toBe(true);
      if (r.type==='Theme') { expect(YEAR_BACKGROUNDS[r.id]).toBeTruthy(); expect(YEAR_THEMES[r.id]).toBeTruthy(); }
    }
  }
});

it('ships all 304 unique puzzles with one solution matching the server seed', () => {
  const sql=readFileSync('supabase/migrations/20261016033721_monthly_collections_january_october_2027.sql','utf8');
  const rows=[...sql.matchAll(/\('(2027-\d{2}-\d{2})','([0-9]{81})','([1-9]{81})'\)/g)];
  expect(rows).toHaveLength(304);
  expect(new Set(rows.map(r=>r[2])).size).toBe(304);
  for (const [,date,puzzle,solution] of rows) {
    const board=Array.from({length:9},(_,r)=>[...puzzle.slice(r*9,r*9+9)].map(Number)) as Board;
    expect(countSolutions(board),date).toBe(1);
    expect(solve(board)?.flat().join(''),date).toBe(solution);
  }
  for(const c of MONTHLY_2027) expect(rows.filter(r=>r[1].startsWith(c.month))).toHaveLength(c.days);
});
