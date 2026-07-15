// =====================================================================
// API wrapper — typed access to Supabase tables + Edge Functions
// See docs/02-technical/api-spec.md
// =====================================================================
import { supabase } from './supabase';
import type { Move, Difficulty } from '@engine/types';

// === Daily Puzzle ===
export async function getDailyPuzzle(date: string) {
  const { data, error } = await supabase
    .from('daily_puzzles_public')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// === Leaderboard ===
export async function getLeaderboard(date: string, limit = 100) {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .eq('date', date)
    .order('rank', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getMyRank(date: string) {
  return supabase.functions.invoke('get-my-rank', { body: { date } });
}

export async function getMyDailyRank(date: string): Promise<{ rank: number; total_players: number } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('rank, total_players')
    .eq('date', date)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data as { rank: number; total_players: number } | null;
}

// === Submit ===
export interface SubmitDailyPayload {
  date: string;
  started_at: string;
  completed_at: string;
  time_seconds: number;
  mistakes: number;
  hints_used: number;
  moves: Move[];
}

export async function submitDailyScore(payload: SubmitDailyPayload) {
  return supabase.functions.invoke('submit-daily-score', { body: payload });
}

export interface SubmitPracticePayload {
  level: Difficulty;
  stage: number;
  time_seconds: number;
  mistakes: number;
  hints_used: number;
}

export async function submitPracticeScore(payload: SubmitPracticePayload) {
  return supabase.functions.invoke('submit-practice-score', { body: payload });
}

// === Quests ===
export async function getDailyQuests(date: string) {
  await supabase.rpc('seed_daily_quests', { p_date: date });
  const { data, error } = await supabase
    .from('user_daily_quests')
    .select('*')
    .eq('date', date)
    .order('quest_id');
  if (error) throw error;
  return data ?? [];
}

export async function claimQuestReward(date: string, questId: string) {
  return supabase.functions.invoke('claim-quest-reward', { body: { date, quest_id: questId } });
}

// === Wallet / Progression ===
export async function spendCoins(amount: number, reason: string, metadata?: Record<string, unknown>): Promise<{ ok: boolean; balance?: number; reason?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.rpc('spend_coins', {
    p_user_id: user.id,
    p_amount: amount,
    p_reason: reason,
    p_metadata: metadata ?? {},
  });
  if (error) throw error;
  return data as { ok: boolean; balance?: number; reason?: string };
}

// === Random Mode ===
export async function getRandomModeStats(): Promise<{ current_win_streak: number; longest_win_streak: number; total_played: number } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('random_mode_stats')
    .select('current_win_streak, longest_win_streak, total_played')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function recordRandomModeResult(won: boolean): Promise<{ current_win_streak: number; longest_win_streak: number; total_played: number } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.rpc('record_random_mode_result', { p_user_id: user.id, p_won: won });
  if (error) throw error;
  return data;
}

export async function getWallet() {
  const { data, error } = await supabase
    .from('user_wallet')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProgression() {
  const { data, error } = await supabase
    .from('user_progression')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

// === Profile ===
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(updates: { display_name?: string; country?: string; bio?: string; avatar_url?: string | null }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);
  if (error) throw error;
}

export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop() || 'png';
  const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

  // Upload file
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return publicUrl;
}

// === Share Cards ===

export interface MonthlyRecap {
  daysPlayed: number;
  totalDays: number;
  bestScore: number;
  longestStreak: number;
  wins: number;
}

export async function getMonthlyRecap(userId: string, year: number, month: number): Promise<MonthlyRecap> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('daily_leaderboard')
    .select('date, score')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to);
  if (error) throw error;

  const rows = (data ?? []) as Array<{ date: string; score: number }>;
  const daysSet = new Set(rows.map(r => r.date));
  const bestScore = rows.length ? Math.max(...rows.map(r => r.score ?? 0)) : 0;

  // Longest streak within the month
  const sortedDates = Array.from(daysSet).sort();
  let longest = 0, current = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) { current = 1; continue; }
    const prev = new Date(sortedDates[i - 1] + 'T00:00:00Z');
    const cur = new Date(sortedDates[i] + 'T00:00:00Z');
    const diff = (cur.getTime() - prev.getTime()) / 86400000;
    current = diff === 1 ? current + 1 : 1;
    if (current > longest) longest = current;
  }
  if (current > longest) longest = current;

  return {
    daysPlayed: daysSet.size,
    totalDays: lastDay,
    bestScore,
    longestStreak: longest,
    wins: rows.length,
  };
}

export interface DailyCalendarEntry {
  date: string;
  score: number;
  time_seconds: number;
  mistakes: number;
  hints_used: number;
}

export async function getMyDailyCalendar(userId: string, year: number, month: number): Promise<DailyCalendarEntry[]> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('daily_leaderboard')
    .select('date, score, time_seconds, mistakes, hints_used')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to);
  if (error) throw error;
  return (data ?? []) as DailyCalendarEntry[];
}

export async function getReferralCode(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as { referral_code?: string } | null)?.referral_code ?? '';
}

export async function claimReferral(refCode: string): Promise<void> {
  await supabase.functions.invoke('claim-referral', { body: { ref_code: refCode } });
}

// === Shop ===
export async function getShopItem(id: string) {
  const { data, error } = await supabase.from('shop_items').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getShopItems(category?: string) {
  let q = supabase.from('shop_items').select('*').eq('available', true);
  if (category) q = q.eq('category', category);
  const { data, error } = await q.order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getInventory() {
  const { data, error } = await supabase.from('user_inventory').select('*');
  if (error) throw error;
  return data ?? [];
}

export async function getEquipped() {
  const { data, error } = await supabase.from('user_equipped').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function purchaseItem(itemId: string) {
  return supabase.functions.invoke('purchase-item', { body: { item_id: itemId } });
}

export async function equipItem(payload: { theme_id?: string; background_id?: string; board_color_id?: string; avatar?: any }) {
  return supabase.functions.invoke('equip-item', { body: payload });
}

// === Achievements ===
export async function getAchievementDefinitions() {
  const { data, error } = await supabase.from('achievements_definitions').select('*').order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getUserAchievements() {
  const { data, error } = await supabase.from('user_achievements').select('*');
  if (error) throw error;
  return data ?? [];
}

// === Global stats (Phase 3) ===
export async function getGlobalSummary() {
  const { data, error } = await supabase
    .from('global_stats_summary')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getGlobalTopRecords() {
  const [fastest, highest] = await Promise.all([
    supabase
      .from('user_game_history')
      .select('time_seconds, level, profiles(display_name, username)')
      .eq('mode', 'daily')
      .order('time_seconds', { ascending: true })
      .limit(5),
    supabase
      .from('user_game_history')
      .select('score, level, profiles(display_name, username)')
      .order('score', { ascending: false })
      .limit(5),
  ]);
  return {
    fastest: fastest.data ?? [],
    highest: highest.data ?? [],
  };
}

// === Visitor Counter ===

export interface VisitorStats {
  today: number;
  today_guests: number;
  today_members: number;
  week: number;
  total: number;
  online: number;
  online_guests: number;
  online_members: number;
}

/** Get or create a stable session UUID in localStorage (no auth required) */
export function getSessionId(): string {
  const KEY = 'sudoku_session_id_v1';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Get or create a human-readable guest display ID (e.g. "G-A1B2C3").
 * Persisted in localStorage — same device = same ID even after login.
 */
export function getGuestDisplayId(): string {
  const KEY = 'sudoku_guest_display_id_v1';
  let id = localStorage.getItem(KEY);
  if (!id) {
    // Alphabet without confusing chars (O/0, I/1, S/5, Z/2)
    const chars = 'ABCDEFGHJKLMNPQRTUVWXY3467';
    const rand = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    id = `G-${rand}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Record a visit for today + mark as guest or member.
 * Uses session_id from localStorage — no auth required.
 */
export async function trackVisit(isGuest: boolean): Promise<void> {
  try {
    const session_id = getSessionId();
    const visited_date = new Date().toISOString().slice(0, 10);
    await supabase
      .from('visitor_sessions')
      .upsert(
        { session_id, visited_date, is_guest: isGuest },
        { onConflict: 'session_id,visited_date' }
      );
  } catch { /* offline / demo mode */ }
}

/**
 * Heartbeat — call every 30s to stay "online".
 * Upserts into online_sessions; stale rows (>2min) = offline.
 * Also touches visitor_sessions.last_seen so today's row can derive a
 * session-duration estimate (last_seen − created_at) in the admin panel.
 */
export async function heartbeat(isGuest: boolean, userId?: string): Promise<void> {
  try {
    const session_id = getSessionId();
    const now = new Date().toISOString();
    await Promise.all([
      supabase
        .from('online_sessions')
        .upsert(
          { session_id, last_seen: now, is_guest: isGuest, user_id: userId ?? null },
          { onConflict: 'session_id' }
        ),
      supabase
        .from('visitor_sessions')
        .update({ last_seen: now })
        .eq('session_id', session_id)
        .eq('visited_date', now.slice(0, 10)),
    ]);
  } catch { /* offline / demo mode */ }
}

/**
 * Log an in-app navigation for the home-grown admin funnel (which views a
 * session visits, whether it ever reaches a game). Best-effort, no-op on
 * failure — never blocks navigation.
 */
export async function logView(view: string, userId?: string | null): Promise<void> {
  try {
    const session_id = getSessionId();
    await supabase.from('session_views').insert({ session_id, user_id: userId ?? null, view });
  } catch { /* offline / demo mode */ }
}

/**
 * Remove this session from online list (call on page close).
 */
export async function leaveOnline(): Promise<void> {
  try {
    const session_id = getSessionId();
    await supabase.from('online_sessions').delete().eq('session_id', session_id);
  } catch { /* ignore */ }
}

// === Guest Leaderboard ===

export interface GuestLeaderboardRow {
  session_id: string;
  guest_display_id: string;
  daily_date: string;
  time_seconds: number;
  mistakes: number;
  hints_used: number;
  score: number;
  rank: number;
  total_players: number;
  completed_at: string;
}

export interface SubmitGuestScorePayload {
  mode: 'daily' | 'practice';
  daily_date?: string;
  level: string;
  time_seconds: number;
  mistakes: number;
  hints_used: number;
  score: number;
}

/** Save a guest game result (no auth required). */
export async function submitGuestScore(payload: SubmitGuestScorePayload): Promise<void> {
  try {
    const session_id = getSessionId();
    const guest_display_id = getGuestDisplayId();
    await supabase.from('guest_game_history').insert({
      session_id,
      guest_display_id,
      mode: payload.mode,
      daily_date: payload.daily_date ?? null,
      level: payload.level,
      time_seconds: payload.time_seconds,
      mistakes: payload.mistakes,
      hints_used: payload.hints_used,
      score: payload.score,
    });
  } catch { /* offline / demo mode */ }
}

/** Fetch guest leaderboard for a given date. */
export async function getGuestLeaderboard(date: string, limit = 100): Promise<GuestLeaderboardRow[]> {
  const { data, error } = await supabase
    .from('guest_leaderboard_view')
    .select('*')
    .eq('daily_date', date)
    .order('rank', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as GuestLeaderboardRow[];
}

/**
 * Move all guest scores on this device to a real user account.
 * Called automatically after a guest signs up / logs in.
 */
export async function migrateGuestScores(): Promise<number> {
  try {
    const session_id = getSessionId();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    const { data, error } = await supabase.rpc('migrate_guest_scores', {
      p_session_id: session_id,
      p_user_id: user.id,
    });
    if (error) { console.warn('[migrateGuestScores]', error); return 0; }
    return (data as number) ?? 0;
  } catch { return 0; }
}

/**
 * Fetch full visitor stats: today (guest/member), week, total, online now.
 */
export async function getVisitorStats(): Promise<VisitorStats | null> {
  try {
    const { data, error } = await supabase.rpc('get_visitor_stats');
    if (error || !data) return null;
    return data as VisitorStats;
  } catch {
    return null;
  }
}

// === Settings ===
export async function getSettings() {
  const { data, error } = await supabase.from('user_settings').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateSettings(updates: Record<string, unknown>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', user.id);
  if (error) throw error;
}
