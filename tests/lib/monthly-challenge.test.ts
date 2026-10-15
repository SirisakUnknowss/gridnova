import { beforeEach, describe, expect, it, vi } from 'vitest';
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('../../src/lib/supabase',() => ({ supabase: { rpc } }));
import { MONTHLY_REWARDS, monthCells, monthlyDayState, rewardState, getMonthlyStatus, startMonthlyPuzzle, submitMonthlyPuzzle, claimMonthlyReward } from '../../src/lib/monthly-challenge';
import { collectionMedals } from '../../src/lib/collection-medals';
import { readFileSync } from 'node:fs';
import { countSolutions, solve } from '../../src/engine/solver';
import type { Board } from '../../src/engine/types';

describe('Monthly Challenge calendar and rewards',() => {
  it('ships thirty unique solvable puzzles with matching server solutions',() => {
    const sql = readFileSync('supabase/migrations/20261015114034_monthly_challenge.sql','utf8');
    const rows = [...sql.matchAll(/\('(2026-11-\d{2})','([0-9]{81})','([1-9]{81})'\)/g)];
    expect(rows).toHaveLength(30);
    expect(new Set(rows.map(row => row[2])).size).toBe(30);
    for (const [,date,puzzle,solution] of rows) {
      const board = Array.from({length:9},(_,r) => [...puzzle.slice(r*9,r*9+9)].map(Number)) as Board;
      expect(countSolutions(board),date).toBe(1);
      expect(solve(board)?.flat().join(''),date).toBe(solution);
    }
  });
  it('places November 1 on Sunday and November 30 on Monday without duplicate dates',() => {
    const cells = monthCells(2026,11);
    expect(cells).toHaveLength(42);
    expect(cells.slice(0,6)).toEqual(Array(6).fill(null));
    expect(cells[6]).toBe('2026-11-01');
    expect(cells[35]).toBe('2026-11-30');
    expect(new Set(cells.filter(Boolean)).size).toBe(30);
  });
  it('also handles October and leap-year February accurately',() => {
    expect(monthCells(2026,10)[3]).toBe('2026-10-01');
    expect(monthCells(2026,10)[33]).toBe('2026-10-31');
    expect(monthCells(2028,2).filter(Boolean)).toHaveLength(29);
  });
  it('locks future dates and all dates before launch',() => {
    expect(monthlyDayState('2026-11-01','2026-10-31',[])).toBe('future');
    expect(monthlyDayState('2026-11-16','2026-11-15',[])).toBe('future');
    expect(monthlyDayState('2026-11-15','2026-11-15',[])).toBe('today');
    expect(monthlyDayState('2026-11-02','2026-11-15',[])).toBe('available');
    expect(monthlyDayState('2026-11-01','2026-11-15',['2026-11-01'])).toBe('completed');
  });
  it('unlocks each milestone at its boundary regardless of consecutive dates',() => {
    expect(MONTHLY_REWARDS.map(reward => reward.days)).toEqual([5,10,15,20,25,30]);
    expect(MONTHLY_REWARDS.map(reward => reward.type)).toEqual(['Avatar','Frame','Theme','Avatar','Frame','Theme']);
    for (const reward of MONTHLY_REWARDS) {
      expect(rewardState(reward.days,reward.days-1,false)).toBe('locked');
      expect(rewardState(reward.days,reward.days,false)).toBe('claimable');
      expect(rewardState(reward.days,30,true)).toBe('claimed');
    }
  });
  it('does not count earned monthly cosmetics as paid Shop purchases',() => {
    const items = MONTHLY_REWARDS.map(reward => ({ id: reward.id, category: reward.type.toLowerCase(), rarity: 'rare', price_coin: 1, available: true, unlock_type: 'monthly' }));
    expect(collectionMedals(items,items.map(item => item.id)).every(medal => !medal.unlocked)).toBe(true);
  });
});

describe('Monthly Challenge server API',() => {
  beforeEach(() => rpc.mockReset());
  it('uses server-issued dates, progress, tickets and wallet balances',async () => {
    const status = { today: '2026-11-15',preview: true,completed: ['2026-11-01'],claimed: [] };
    rpc.mockResolvedValueOnce({ data: status,error: null });
    expect(await getMonthlyStatus()).toEqual(status);
    rpc.mockResolvedValueOnce({ data: { ticket_id: 'ticket',puzzle: 'puzzle' },error: null });
    await startMonthlyPuzzle('2026-11-02');
    expect(rpc).toHaveBeenLastCalledWith('start_monthly_puzzle',{ p_date: '2026-11-02' });
    rpc.mockResolvedValueOnce({ data: { coins: 0,balance: 100,duplicate: true },error: null });
    expect(await submitMonthlyPuzzle('ticket',100,[])).toEqual({ coins: 0,balance: 100,duplicate: true });
    expect(rpc).toHaveBeenLastCalledWith('complete_monthly_puzzle',{ p_ticket: 'ticket',p_seconds: 100,p_moves: [] });
  });
  it('propagates rejection instead of recording local completion or ownership',async () => {
    const error = new Error('Not earned');
    rpc.mockResolvedValue({ data: null,error });
    await expect(claimMonthlyReward(MONTHLY_REWARDS[0].id)).rejects.toThrow('Not earned');
    await expect(startMonthlyPuzzle('2026-11-30')).rejects.toThrow();
    await expect(submitMonthlyPuzzle('bad',100,[])).rejects.toThrow();
    await expect(getMonthlyStatus()).rejects.toThrow();
  });
});
