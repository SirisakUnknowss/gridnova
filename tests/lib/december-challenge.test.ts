import { expect,it } from 'vitest';
import { readFileSync } from 'node:fs';
import { MONTHLY_COLLECTIONS, activeMonthlyCollection, monthlyCollection } from '../../src/lib/monthly-catalog';
import { monthCells } from '../../src/lib/monthly-challenge';
import { countSolutions, solve } from '../../src/engine/solver';
import type { Board } from '../../src/engine/types';
import { avatarPickerOptions } from '../../src/ui/components/avatar-art';

it('changes collection at the UTC month boundary and keeps November available',() => {
  expect(activeMonthlyCollection('2026-11-30').month).toBe('2026-11');
  expect(activeMonthlyCollection('2026-12-01').month).toBe('2026-12');
  expect(activeMonthlyCollection('2027-01-01').month).toBe('2027-01');
  expect(monthlyCollection('2026-11').days).toBe(30);
  expect(monthlyCollection('2026-12').days).toBe(31);
  expect(() => monthlyCollection('2028-01')).toThrow('Unknown monthly collection');
});
it('places December 1 on Tuesday and December 31 on Thursday',() => {
  const cells = monthCells(2026,12);
  expect(cells).toHaveLength(35);
  expect(cells[0]).toBeNull();
  expect(cells[1]).toBe('2026-12-01');
  expect(cells[31]).toBe('2026-12-31');
  expect(new Set(cells.filter(Boolean)).size).toBe(31);
});
it('has independent cosmetics and reachable milestones in each collection',() => {
  const ids = MONTHLY_COLLECTIONS.flatMap(collection => collection.rewards.map(item => item.id));
  expect(new Set(ids).size).toBe(72);
  for (const collection of MONTHLY_COLLECTIONS) {
    expect(collection.rewards.map(item => item.days)).toEqual([5,10,15,20,25,Math.min(30,collection.days)]);
    expect(collection.rewards.every(item => item.days <= collection.days)).toBe(true);
    expect(collection.rewards.map(item => item.type)).toEqual(['Avatar','Frame','Theme','Avatar','Frame','Theme']);
  }
});
it('ships thirty-one distinct December puzzles with unique solutions matching the server',() => {
  const sql = readFileSync('supabase/migrations/20261015154840_december_christmas_collection.sql','utf8');
  const rows = [...sql.matchAll(/\('(2026-12-\d{2})','([0-9]{81})','([1-9]{81})'\)/g)];
  expect(rows).toHaveLength(31);
  expect(new Set(rows.map(row => row[2])).size).toBe(31);
  for (const [,date,puzzle,solution] of rows) {
    const board = Array.from({length:9},(_,r) => [...puzzle.slice(r*9,r*9+9)].map(Number)) as Board;
    expect(countSolutions(board),date).toBe(1);
    expect(solve(board)?.flat().join(''),date).toBe(solution);
  }
});
it('shows earned December avatars in the picker independently of November ownership',() => {
  const ids = monthlyCollection('2026-12').rewards.filter(item => item.type === 'Avatar').map(item => item.id);
  const options = avatarPickerOptions(ids,false);
  expect(options.filter(item => ids.includes(item.id)).map(item => item.name)).toEqual(['Snowflake Girl','Christmas Boy']);
  expect(options.some(item => item.id === 'avatar_monthly_lotus_otter')).toBe(false);
  expect(avatarPickerOptions(ids,true).some(item => ids.includes(item.id))).toBe(false);
});
