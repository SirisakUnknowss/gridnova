import { supabase } from './supabase';
import type { Move } from '@engine/types';
import { MONTHLY_COLLECTIONS } from './monthly-catalog';

export const MONTHLY_START = '2026-11-01';
export const MONTHLY_END = '2026-11-30';
export const MONTHLY_REWARDS = MONTHLY_COLLECTIONS[0].rewards;

export function monthCells(year: number, month: number): (string | null)[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (string | null)[] = Array(offset).fill(null);
  for (let day = 1; day <= count; day++) cells.push(`${prefix}-${String(day).padStart(2, '0')}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function monthlyDayState(date: string, today: string, completed: readonly string[]) {
  if (date > today || today < MONTHLY_START) return 'future';
  if (completed.includes(date)) return 'completed';
  return date === today ? 'today' : 'available';
}

export function rewardState(days: number, completed: number, claimed: boolean) {
  return claimed ? 'claimed' : completed >= days ? 'claimable' : 'locked';
}

export interface MonthlyStatus { today: string; preview: boolean; completed: string[]; claimed: string[] }
export interface MonthlyTicket { ticket_id: string; puzzle: string; date: string }
export async function getMonthlyStatus(month?: string): Promise<MonthlyStatus> {
  const { data, error } = month
    ? await supabase.rpc('get_monthly_collection', { p_month: month })
    : await supabase.rpc('get_monthly_challenge');
  if (error) throw error;
  return data as MonthlyStatus;
}
export async function startMonthlyPuzzle(date: string): Promise<MonthlyTicket> {
  const { data, error } = await supabase.rpc('start_monthly_puzzle', { p_date: date });
  if (error) throw error;
  return data as MonthlyTicket;
}
export async function submitMonthlyPuzzle(ticketId: string, seconds: number, moves: Move[]): Promise<{ coins: number; balance: number; duplicate: boolean }> {
  const { data, error } = await supabase.rpc('complete_monthly_puzzle', { p_ticket: ticketId, p_seconds: seconds, p_moves: moves });
  if (error) throw error;
  return data;
}
export async function claimMonthlyReward(id: string): Promise<void> {
  const { error } = await supabase.rpc('claim_monthly_reward', { p_item: id });
  if (error) throw error;
}
