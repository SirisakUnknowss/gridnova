-- Achievement expansion: 10 groups × 10 levels = 100 achievements
-- Replaces previous 48-achievement system.

DELETE FROM user_achievements;
DELETE FROM achievements_definitions;

INSERT INTO achievements_definitions
  (id, name, description, tier, category, reward_coin, reward_xp, sort_order, badge_level)
VALUES
  -- ── player (🎮) ─────────────────────────────────────────────────────────
  ('ACH_PLAYER_L1',  'First Steps',     'Complete your first game',  'bronze',   'player',     50,    100,  1, 1),
  ('ACH_PLAYER_L2',  'Getting Started', 'Play 5 games',              'bronze',   'player',     80,    150,  2, 2),
  ('ACH_PLAYER_L3',  'Regular',         'Play 10 games',             'silver',   'player',    100,    200,  3, 3),
  ('ACH_PLAYER_L4',  'Dedicated',       'Play 25 games',             'silver',   'player',    200,    400,  4, 4),
  ('ACH_PLAYER_L5',  'Seasoned',        'Play 50 games',             'gold',     'player',    300,    600,  5, 5),
  ('ACH_PLAYER_L6',  'Veteran',         'Play 100 games',            'gold',     'player',    500,   1000,  6, 6),
  ('ACH_PLAYER_L7',  'Elite',           'Play 200 games',            'platinum', 'player',    800,   2000,  7, 7),
  ('ACH_PLAYER_L8',  'Champion',        'Play 500 games',            'platinum', 'player',   1500,   4000,  8, 8),
  ('ACH_PLAYER_L9',  'Master',          'Play 1000 games',           'diamond',  'player',   3000,   8000,  9, 9),
  ('ACH_PLAYER_L10', 'Legend',          'Play 2000 games',           'diamond',  'player',   5000,  15000, 10,10),

  -- ── daily (📅) ──────────────────────────────────────────────────────────
  ('ACH_DAILY_L1',  'First Daily',    'Complete your first Daily Puzzle',  'bronze',   'daily',    50,    100, 11, 1),
  ('ACH_DAILY_L2',  'Daily Starter',  'Complete 5 Daily Puzzles',          'bronze',   'daily',   100,    200, 12, 2),
  ('ACH_DAILY_L3',  'Daily Habit',    'Complete 10 Daily Puzzles',         'silver',   'daily',   150,    300, 13, 3),
  ('ACH_DAILY_L4',  'Consistent',     'Complete 20 Daily Puzzles',         'silver',   'daily',   250,    500, 14, 4),
  ('ACH_DAILY_L5',  'Daily Regular',  'Complete 30 Daily Puzzles',         'gold',     'daily',   400,    800, 15, 5),
  ('ACH_DAILY_L6',  'Committed',      'Complete 50 Daily Puzzles',         'gold',     'daily',   700,   1500, 16, 6),
  ('ACH_DAILY_L7',  'Daily Devotee',  'Complete 75 Daily Puzzles',         'platinum', 'daily',  1000,   2500, 17, 7),
  ('ACH_DAILY_L8',  'Daily Expert',   'Complete 100 Daily Puzzles',        'platinum', 'daily',  1500,   4000, 18, 8),
  ('ACH_DAILY_L9',  'Daily Elite',    'Complete 200 Daily Puzzles',        'diamond',  'daily',  3000,   8000, 19, 9),
  ('ACH_DAILY_L10', 'Year of Puzzles','Complete 365 Daily Puzzles',        'diamond',  'daily',  5000,  15000, 20,10),

  -- ── streak (🔥) ─────────────────────────────────────────────────────────
  ('ACH_STREAK_L1',  'Trio',         'Keep a 3-day streak',   'bronze',   'streak',    100,    200, 21, 1),
  ('ACH_STREAK_L2',  'Five Days',    'Keep a 5-day streak',   'bronze',   'streak',    150,    300, 22, 2),
  ('ACH_STREAK_L3',  'Week Warrior', 'Keep a 7-day streak',   'silver',   'streak',    300,    500, 23, 3),
  ('ACH_STREAK_L4',  'Fortnight',    'Keep a 14-day streak',  'silver',   'streak',    500,   1000, 24, 4),
  ('ACH_STREAK_L5',  'Monthly',      'Keep a 30-day streak',  'gold',     'streak',   1000,   2000, 25, 5),
  ('ACH_STREAK_L6',  'Two Months',   'Keep a 60-day streak',  'gold',     'streak',   1500,   3000, 26, 6),
  ('ACH_STREAK_L7',  'Quarter Year', 'Keep a 90-day streak',  'platinum', 'streak',   2500,   5000, 27, 7),
  ('ACH_STREAK_L8',  'Half Year',    'Keep a 180-day streak', 'platinum', 'streak',   4000,   8000, 28, 8),
  ('ACH_STREAK_L9',  'Year Long',    'Keep a 365-day streak', 'diamond',  'streak',  10000,  20000, 29, 9),
  ('ACH_STREAK_L10', 'Unstoppable',  'Keep a 500-day streak', 'diamond',  'streak',  20000,  50000, 30,10),

  -- ── flawless (⭐) — no-mistake wins ─────────────────────────────────────
  ('ACH_FLAWLESS_L1',  'Clean Win',        'Win 1 game without mistakes',   'bronze',   'flawless',    50,   100, 31, 1),
  ('ACH_FLAWLESS_L2',  'Flawless Start',   'Win 5 games without mistakes',  'bronze',   'flawless',    80,   200, 32, 2),
  ('ACH_FLAWLESS_L3',  'Clean Player',     'Win 10 games without mistakes', 'silver',   'flawless',   150,   300, 33, 3),
  ('ACH_FLAWLESS_L4',  'Precision',        'Win 20 games without mistakes', 'silver',   'flawless',   250,   500, 34, 4),
  ('ACH_FLAWLESS_L5',  'Sharp Mind',       'Win 30 games without mistakes', 'gold',     'flawless',   400,   800, 35, 5),
  ('ACH_FLAWLESS_L6',  'Perfectionist',    'Win 50 games without mistakes', 'gold',     'flawless',   600,  1500, 36, 6),
  ('ACH_FLAWLESS_L7',  'Flawless Expert',  'Win 75 games without mistakes', 'platinum', 'flawless',  1000,  2500, 37, 7),
  ('ACH_FLAWLESS_L8',  'Untouchable',     'Win 100 games without mistakes', 'platinum', 'flawless',  1500,  4000, 38, 8),
  ('ACH_FLAWLESS_L9',  'Error-Free',      'Win 150 games without mistakes', 'diamond',  'flawless',  3000,  8000, 39, 9),
  ('ACH_FLAWLESS_L10', 'Perfect Master',  'Win 200 games without mistakes', 'diamond',  'flawless',  5000, 15000, 40,10),

  -- ── speedster (⚡) ───────────────────────────────────────────────────────
  ('ACH_SPEED_L1',  'Quick Draw',     'Beat Easy in under 3 min (Daily)',          'bronze',   'speedster',    150,    300, 41, 1),
  ('ACH_SPEED_L2',  'Lightning Easy', 'Beat Easy in under 2 min (Daily)',          'bronze',   'speedster',    250,    500, 42, 2),
  ('ACH_SPEED_L3',  'Fast Mind',      'Beat Medium in under 5 min (Daily)',        'silver',   'speedster',    400,    800, 43, 3),
  ('ACH_SPEED_L4',  'Turbo Medium',   'Beat Medium in under 3 min (Daily)',        'silver',   'speedster',    700,   1500, 44, 4),
  ('ACH_SPEED_L5',  'Speed Solver',   'Beat Hard in under 10 min',                'gold',     'speedster',   1000,   2500, 45, 5),
  ('ACH_SPEED_L6',  'Hard Rusher',    'Beat Hard in under 7 min',                 'gold',     'speedster',   1800,   4000, 46, 6),
  ('ACH_SPEED_L7',  'Lightning',      'Beat Hard-Expert in under 15 min',         'platinum', 'speedster',   2500,   6000, 47, 7),
  ('ACH_SPEED_L8',  'Expert Rusher',  'Beat Hard-Expert in under 10 min',         'platinum', 'speedster',   4000,   8000, 48, 8),
  ('ACH_SPEED_L9',  'Flash',          'Beat Expert in under 25 min',              'diamond',  'speedster',   5000,  12000, 49, 9),
  ('ACH_SPEED_L10', 'Godspeed',       'Beat Expert in under 18 min',              'diamond',  'speedster',  10000,  25000, 50,10),

  -- ── pure (🧠) — no hints ─────────────────────────────────────────────────
  ('ACH_PURE_L1',  'No Training Wheels','Win Easy without hints ×1',              'bronze',   'pure',   100,    200, 51, 1),
  ('ACH_PURE_L2',  'Self-Reliant',      'Win Easy without hints ×5',              'bronze',   'pure',   200,    400, 52, 2),
  ('ACH_PURE_L3',  'Medium Pure',       'Win Medium without hints ×1',            'silver',   'pure',   300,    600, 53, 3),
  ('ACH_PURE_L4',  'Medium Master',     'Win Medium without hints ×5',            'silver',   'pure',   600,   1200, 54, 4),
  ('ACH_PURE_L5',  'Pure Skill',        'Win Hard without hints ×1',              'gold',     'pure',  1000,   2000, 55, 5),
  ('ACH_PURE_L6',  'Hard Pure',         'Win Hard without hints ×5',              'gold',     'pure',  2000,   4000, 56, 6),
  ('ACH_PURE_L7',  'Genius',            'Win Expert without hints ×1',            'platinum', 'pure',  3000,   6000, 57, 7),
  ('ACH_PURE_L8',  'Expert Pure',       'Win Expert without hints ×3',            'platinum', 'pure',  5000,  10000, 58, 8),
  ('ACH_PURE_L9',  'Untainted',         'Win Expert without hints ×5',            'diamond',  'pure',  8000,  18000, 59, 9),
  ('ACH_PURE_L10', 'Nightmare Mode',    'Win Expert with no hints and no mistakes','diamond', 'pure', 15000,  30000, 60,10),

  -- ── leaderboard (🏆) ────────────────────────────────────────────────────
  ('ACH_LB_L1',  'Rising Star',     'Reach Top 100 once',         'bronze',   'leaderboard',   300,    500, 61, 1),
  ('ACH_LB_L2',  'Top 100 Regular', 'Reach Top 100 five times',   'bronze',   'leaderboard',   500,   1000, 62, 2),
  ('ACH_LB_L3',  'Top 50',          'Reach Top 50 once',          'silver',   'leaderboard',   700,   1500, 63, 3),
  ('ACH_LB_L4',  'Top 50 Regular',  'Reach Top 50 three times',   'silver',   'leaderboard',  1200,   2500, 64, 4),
  ('ACH_LB_L5',  'Top 10',          'Reach Top 10 once',          'gold',     'leaderboard',  2000,   4000, 65, 5),
  ('ACH_LB_L6',  'Top 10 Regular',  'Reach Top 10 three times',   'gold',     'leaderboard',  3000,   6000, 66, 6),
  ('ACH_LB_L7',  'Podium',          'Reach Top 3 once',           'platinum', 'leaderboard',  4000,   8000, 67, 7),
  ('ACH_LB_L8',  'Podium Regular',  'Reach Top 3 three times',    'platinum', 'leaderboard',  6000,  12000, 68, 8),
  ('ACH_LB_L9',  'Champion',        'Reach #1 once',              'diamond',  'leaderboard',  8000,  15000, 69, 9),
  ('ACH_LB_L10', 'Daily Champion',  'Reach #1 five times',        'diamond',  'leaderboard', 15000,  30000, 70,10),

  -- ── progression (📈) ────────────────────────────────────────────────────
  ('ACH_PROG_L1',  'Apprentice',   'Reach level 3',   'bronze',   'progression',    100,    200, 71, 1),
  ('ACH_PROG_L2',  'Learner',      'Reach level 5',   'bronze',   'progression',    200,    400, 72, 2),
  ('ACH_PROG_L3',  'Adept',        'Reach level 10',  'silver',   'progression',    500,   1000, 73, 3),
  ('ACH_PROG_L4',  'Skilled',      'Reach level 20',  'silver',   'progression',    800,   1600, 74, 4),
  ('ACH_PROG_L5',  'Expert',       'Reach level 30',  'gold',     'progression',   1200,   2500, 75, 5),
  ('ACH_PROG_L6',  'Advanced',     'Reach level 40',  'gold',     'progression',   2000,   4000, 76, 6),
  ('ACH_PROG_L7',  'Master',       'Reach level 50',  'platinum', 'progression',   3000,   6000, 77, 7),
  ('ACH_PROG_L8',  'Elite',        'Reach level 60',  'platinum', 'progression',   5000,  10000, 78, 8),
  ('ACH_PROG_L9',  'Grand Master', 'Reach level 75',  'diamond',  'progression',   8000,  15000, 79, 9),
  ('ACH_PROG_L10', 'Grandmaster',  'Reach level 100', 'diamond',  'progression',  15000,  30000, 80,10),

  -- ── quest (📋) ──────────────────────────────────────────────────────────
  ('ACH_QUEST_L1',  'Quest Starter',  'Complete 1 quest',    'bronze',   'quest',    50,    100, 81, 1),
  ('ACH_QUEST_L2',  'Quest Seeker',   'Complete 5 quests',   'bronze',   'quest',   100,    200, 82, 2),
  ('ACH_QUEST_L3',  'Quest Regular',  'Complete 10 quests',  'silver',   'quest',   200,    400, 83, 3),
  ('ACH_QUEST_L4',  'Quest Addict',   'Complete 20 quests',  'silver',   'quest',   400,    800, 84, 4),
  ('ACH_QUEST_L5',  'Quest Veteran',  'Complete 30 quests',  'gold',     'quest',   600,   1500, 85, 5),
  ('ACH_QUEST_L6',  'Quest Master',   'Complete 50 quests',  'gold',     'quest',  1000,   2500, 86, 6),
  ('ACH_QUEST_L7',  'Quest Expert',   'Complete 75 quests',  'platinum', 'quest',  1500,   4000, 87, 7),
  ('ACH_QUEST_L8',  'Quest Champion', 'Complete 100 quests', 'platinum', 'quest',  2500,   6000, 88, 8),
  ('ACH_QUEST_L9',  'Quest Legend',   'Complete 150 quests', 'diamond',  'quest',  4000,  10000, 89, 9),
  ('ACH_QUEST_L10', 'Quest God',      'Complete 200 quests', 'diamond',  'quest',  7000,  20000, 90,10),

  -- ── special (✨) — one-time, badge_level = 0 ────────────────────────────
  ('ACH_NIGHT_OWL',    'Night Owl',       'Play between 23:00 and 04:00',         'bronze', 'special',   100,   100, 91, 0),
  ('ACH_EARLY_BIRD',   'Early Bird',      'Play between 05:00 and 07:00',         'bronze', 'special',   100,   100, 92, 0),
  ('ACH_WEEKEND',      'Weekend Warrior', 'Play on both Saturday and Sunday',     'bronze', 'special',   100,   200, 93, 0),
  ('ACH_NAMED',        'Identified',      'Set a custom display name',            'bronze', 'special',    50,   100, 94, 0),
  ('ACH_AVATAR',       'Self-Portrait',   'Choose a custom avatar',               'bronze', 'special',    50,   100, 95, 0),
  ('ACH_GLOBETROTTER', 'Globetrotter',    'Set your country in profile',          'bronze', 'special',    50,   100, 96, 0),
  ('ACH_THEME_COLLECT','Theme Collector', 'Own 5 or more themes',                 'silver', 'special',   500,  1000, 97, 0),
  ('ACH_RICH',         'Coin Hoarder',    'Hold 10,000 coins at once',            'gold',   'special',  1000,  2000, 98, 0),
  ('ACH_LOYAL_FAN',    'Loyal Fan',       'Play on 30 distinct calendar days',    'silver', 'special',   300,   600, 99, 0),
  ('ACH_SHOPAHOLIC',   'Shopaholic',      'Own 10 or more items in your inventory','silver','special',   300,   500,100, 0);

-- ── check_and_grant_achievements (rewrite) ───────────────────────────────
CREATE OR REPLACE FUNCTION public.check_and_grant_achievements(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_game_count     int := 0;
  v_daily_count    int := 0;
  v_perfect_count  int := 0;
  v_streak         int := 0;
  v_level          int := 1;
  v_coins          numeric := 0;
  v_themes_owned   int := 0;
  v_quest_count    int := 0;
  v_inventory_count int := 0;
  v_distinct_days  int := 0;

  -- Speedster: best time per difficulty
  v_easy_daily_best   int;
  v_medium_daily_best int;
  v_hard_best         int;
  v_hardexpert_best   int;
  v_expert_best       int;

  -- Pure: count of no-hint wins per difficulty
  v_pure_easy_count   int := 0;
  v_pure_medium_count int := 0;
  v_pure_hard_count   int := 0;
  v_pure_expert_count int := 0;
  v_pure_expert_perf  bool := false;

  -- Leaderboard
  v_lb_top100 int := 0;
  v_lb_top50  int := 0;
  v_lb_top10  int := 0;
  v_lb_top3   int := 0;
  v_lb_top1   int := 0;

  -- Special
  v_night_owl        bool := false;
  v_early_bird       bool := false;
  v_weekend          bool := false;
  v_has_display_name bool := false;
  v_has_avatar       bool := false;
  v_has_country      bool := false;

  rec              record;
  v_cond           bool;
  v_newly_unlocked jsonb := '[]'::jsonb;
BEGIN
  -- ── Simple counters ──────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_game_count FROM user_game_history WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_daily_count FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily';
  SELECT COUNT(*) INTO v_perfect_count FROM user_game_history WHERE user_id = p_user_id AND mistakes = 0;

  SELECT COALESCE(current_streak, 0) INTO v_streak FROM user_progression WHERE user_id = p_user_id;
  SELECT COALESCE(level, 1)          INTO v_level  FROM user_progression WHERE user_id = p_user_id;
  SELECT COALESCE(coins, 0)          INTO v_coins  FROM user_wallet       WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_themes_owned   FROM user_inventory WHERE user_id = p_user_id AND item_id LIKE 'theme_%';
  SELECT COUNT(*) INTO v_inventory_count FROM user_inventory WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_quest_count    FROM user_daily_quests WHERE user_id = p_user_id AND claimed_at IS NOT NULL;

  SELECT COUNT(DISTINCT DATE(completed_at AT TIME ZONE 'Asia/Bangkok'))
    INTO v_distinct_days FROM user_game_history WHERE user_id = p_user_id;

  -- ── Speedster ────────────────────────────────────────────────────────────
  SELECT MIN(time_seconds) INTO v_easy_daily_best
    FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily' AND level = 'easy'::difficulty_enum;

  SELECT MIN(time_seconds) INTO v_medium_daily_best
    FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily' AND level = 'medium'::difficulty_enum;

  SELECT MIN(time_seconds) INTO v_hard_best
    FROM user_game_history WHERE user_id = p_user_id AND level = 'hard'::difficulty_enum;

  SELECT MIN(time_seconds) INTO v_hardexpert_best
    FROM user_game_history WHERE user_id = p_user_id AND level = 'hard-expert'::difficulty_enum;

  SELECT MIN(time_seconds) INTO v_expert_best
    FROM user_game_history WHERE user_id = p_user_id AND level = 'expert'::difficulty_enum;

  -- ── Pure ─────────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_pure_easy_count
    FROM user_game_history WHERE user_id = p_user_id AND hints_used = 0 AND level = 'easy'::difficulty_enum;

  SELECT COUNT(*) INTO v_pure_medium_count
    FROM user_game_history WHERE user_id = p_user_id AND hints_used = 0 AND level = 'medium'::difficulty_enum;

  SELECT COUNT(*) INTO v_pure_hard_count
    FROM user_game_history WHERE user_id = p_user_id AND hints_used = 0 AND level = 'hard'::difficulty_enum;

  SELECT COUNT(*) INTO v_pure_expert_count
    FROM user_game_history WHERE user_id = p_user_id AND hints_used = 0 AND level = 'expert'::difficulty_enum;

  SELECT EXISTS(SELECT 1 FROM user_game_history
    WHERE user_id = p_user_id AND hints_used = 0 AND mistakes = 0 AND level = 'expert'::difficulty_enum)
    INTO v_pure_expert_perf;

  -- ── Leaderboard ──────────────────────────────────────────────────────────
  WITH ranked AS (
    SELECT RANK() OVER (PARTITION BY date ORDER BY score DESC, time_seconds ASC) AS rnk
    FROM daily_leaderboard WHERE user_id = p_user_id
  )
  SELECT
    COALESCE(COUNT(*) FILTER (WHERE rnk <= 100), 0),
    COALESCE(COUNT(*) FILTER (WHERE rnk <= 50),  0),
    COALESCE(COUNT(*) FILTER (WHERE rnk <= 10),  0),
    COALESCE(COUNT(*) FILTER (WHERE rnk <= 3),   0),
    COALESCE(COUNT(*) FILTER (WHERE rnk = 1),    0)
  INTO v_lb_top100, v_lb_top50, v_lb_top10, v_lb_top3, v_lb_top1
  FROM ranked;

  -- ── Special ──────────────────────────────────────────────────────────────
  SELECT EXISTS(
    SELECT 1 FROM user_game_history WHERE user_id = p_user_id
    AND (EXTRACT(HOUR FROM completed_at AT TIME ZONE 'Asia/Bangkok') >= 23
         OR EXTRACT(HOUR FROM completed_at AT TIME ZONE 'Asia/Bangkok') <= 3)
  ) INTO v_night_owl;

  SELECT EXISTS(
    SELECT 1 FROM user_game_history WHERE user_id = p_user_id
    AND EXTRACT(HOUR FROM completed_at AT TIME ZONE 'Asia/Bangkok') BETWEEN 5 AND 6
  ) INTO v_early_bird;

  SELECT COUNT(DISTINCT EXTRACT(DOW FROM completed_at AT TIME ZONE 'Asia/Bangkok')::int) >= 2
  INTO v_weekend
  FROM user_game_history WHERE user_id = p_user_id
  AND EXTRACT(DOW FROM completed_at AT TIME ZONE 'Asia/Bangkok') IN (0, 6);

  SELECT
    COALESCE(display_name, '') <> '',
    COALESCE(avatar_url,   '') <> '',
    COALESCE(country,      '') <> ''
  INTO v_has_display_name, v_has_avatar, v_has_country
  FROM profiles WHERE id = p_user_id;

  -- ── Check & grant ────────────────────────────────────────────────────────
  FOR rec IN SELECT * FROM achievements_definitions ORDER BY sort_order LOOP
    CONTINUE WHEN EXISTS (
      SELECT 1 FROM user_achievements WHERE user_id = p_user_id AND achievement_id = rec.id
    );

    v_cond := FALSE;

    CASE rec.id
      -- player
      WHEN 'ACH_PLAYER_L1'  THEN v_cond := v_game_count >= 1;
      WHEN 'ACH_PLAYER_L2'  THEN v_cond := v_game_count >= 5;
      WHEN 'ACH_PLAYER_L3'  THEN v_cond := v_game_count >= 10;
      WHEN 'ACH_PLAYER_L4'  THEN v_cond := v_game_count >= 25;
      WHEN 'ACH_PLAYER_L5'  THEN v_cond := v_game_count >= 50;
      WHEN 'ACH_PLAYER_L6'  THEN v_cond := v_game_count >= 100;
      WHEN 'ACH_PLAYER_L7'  THEN v_cond := v_game_count >= 200;
      WHEN 'ACH_PLAYER_L8'  THEN v_cond := v_game_count >= 500;
      WHEN 'ACH_PLAYER_L9'  THEN v_cond := v_game_count >= 1000;
      WHEN 'ACH_PLAYER_L10' THEN v_cond := v_game_count >= 2000;
      -- daily
      WHEN 'ACH_DAILY_L1'  THEN v_cond := v_daily_count >= 1;
      WHEN 'ACH_DAILY_L2'  THEN v_cond := v_daily_count >= 5;
      WHEN 'ACH_DAILY_L3'  THEN v_cond := v_daily_count >= 10;
      WHEN 'ACH_DAILY_L4'  THEN v_cond := v_daily_count >= 20;
      WHEN 'ACH_DAILY_L5'  THEN v_cond := v_daily_count >= 30;
      WHEN 'ACH_DAILY_L6'  THEN v_cond := v_daily_count >= 50;
      WHEN 'ACH_DAILY_L7'  THEN v_cond := v_daily_count >= 75;
      WHEN 'ACH_DAILY_L8'  THEN v_cond := v_daily_count >= 100;
      WHEN 'ACH_DAILY_L9'  THEN v_cond := v_daily_count >= 200;
      WHEN 'ACH_DAILY_L10' THEN v_cond := v_daily_count >= 365;
      -- streak
      WHEN 'ACH_STREAK_L1'  THEN v_cond := v_streak >= 3;
      WHEN 'ACH_STREAK_L2'  THEN v_cond := v_streak >= 5;
      WHEN 'ACH_STREAK_L3'  THEN v_cond := v_streak >= 7;
      WHEN 'ACH_STREAK_L4'  THEN v_cond := v_streak >= 14;
      WHEN 'ACH_STREAK_L5'  THEN v_cond := v_streak >= 30;
      WHEN 'ACH_STREAK_L6'  THEN v_cond := v_streak >= 60;
      WHEN 'ACH_STREAK_L7'  THEN v_cond := v_streak >= 90;
      WHEN 'ACH_STREAK_L8'  THEN v_cond := v_streak >= 180;
      WHEN 'ACH_STREAK_L9'  THEN v_cond := v_streak >= 365;
      WHEN 'ACH_STREAK_L10' THEN v_cond := v_streak >= 500;
      -- flawless
      WHEN 'ACH_FLAWLESS_L1'  THEN v_cond := v_perfect_count >= 1;
      WHEN 'ACH_FLAWLESS_L2'  THEN v_cond := v_perfect_count >= 5;
      WHEN 'ACH_FLAWLESS_L3'  THEN v_cond := v_perfect_count >= 10;
      WHEN 'ACH_FLAWLESS_L4'  THEN v_cond := v_perfect_count >= 20;
      WHEN 'ACH_FLAWLESS_L5'  THEN v_cond := v_perfect_count >= 30;
      WHEN 'ACH_FLAWLESS_L6'  THEN v_cond := v_perfect_count >= 50;
      WHEN 'ACH_FLAWLESS_L7'  THEN v_cond := v_perfect_count >= 75;
      WHEN 'ACH_FLAWLESS_L8'  THEN v_cond := v_perfect_count >= 100;
      WHEN 'ACH_FLAWLESS_L9'  THEN v_cond := v_perfect_count >= 150;
      WHEN 'ACH_FLAWLESS_L10' THEN v_cond := v_perfect_count >= 200;
      -- speedster
      WHEN 'ACH_SPEED_L1'  THEN v_cond := v_easy_daily_best   IS NOT NULL AND v_easy_daily_best   <= 180;
      WHEN 'ACH_SPEED_L2'  THEN v_cond := v_easy_daily_best   IS NOT NULL AND v_easy_daily_best   <= 120;
      WHEN 'ACH_SPEED_L3'  THEN v_cond := v_medium_daily_best IS NOT NULL AND v_medium_daily_best <= 300;
      WHEN 'ACH_SPEED_L4'  THEN v_cond := v_medium_daily_best IS NOT NULL AND v_medium_daily_best <= 180;
      WHEN 'ACH_SPEED_L5'  THEN v_cond := v_hard_best         IS NOT NULL AND v_hard_best         <= 600;
      WHEN 'ACH_SPEED_L6'  THEN v_cond := v_hard_best         IS NOT NULL AND v_hard_best         <= 420;
      WHEN 'ACH_SPEED_L7'  THEN v_cond := v_hardexpert_best   IS NOT NULL AND v_hardexpert_best   <= 900;
      WHEN 'ACH_SPEED_L8'  THEN v_cond := v_hardexpert_best   IS NOT NULL AND v_hardexpert_best   <= 600;
      WHEN 'ACH_SPEED_L9'  THEN v_cond := v_expert_best       IS NOT NULL AND v_expert_best       <= 1500;
      WHEN 'ACH_SPEED_L10' THEN v_cond := v_expert_best       IS NOT NULL AND v_expert_best       <= 1080;
      -- pure
      WHEN 'ACH_PURE_L1'  THEN v_cond := v_pure_easy_count   >= 1;
      WHEN 'ACH_PURE_L2'  THEN v_cond := v_pure_easy_count   >= 5;
      WHEN 'ACH_PURE_L3'  THEN v_cond := v_pure_medium_count >= 1;
      WHEN 'ACH_PURE_L4'  THEN v_cond := v_pure_medium_count >= 5;
      WHEN 'ACH_PURE_L5'  THEN v_cond := v_pure_hard_count   >= 1;
      WHEN 'ACH_PURE_L6'  THEN v_cond := v_pure_hard_count   >= 5;
      WHEN 'ACH_PURE_L7'  THEN v_cond := v_pure_expert_count >= 1;
      WHEN 'ACH_PURE_L8'  THEN v_cond := v_pure_expert_count >= 3;
      WHEN 'ACH_PURE_L9'  THEN v_cond := v_pure_expert_count >= 5;
      WHEN 'ACH_PURE_L10' THEN v_cond := v_pure_expert_perf;
      -- leaderboard
      WHEN 'ACH_LB_L1'  THEN v_cond := v_lb_top100 >= 1;
      WHEN 'ACH_LB_L2'  THEN v_cond := v_lb_top100 >= 5;
      WHEN 'ACH_LB_L3'  THEN v_cond := v_lb_top50  >= 1;
      WHEN 'ACH_LB_L4'  THEN v_cond := v_lb_top50  >= 3;
      WHEN 'ACH_LB_L5'  THEN v_cond := v_lb_top10  >= 1;
      WHEN 'ACH_LB_L6'  THEN v_cond := v_lb_top10  >= 3;
      WHEN 'ACH_LB_L7'  THEN v_cond := v_lb_top3   >= 1;
      WHEN 'ACH_LB_L8'  THEN v_cond := v_lb_top3   >= 3;
      WHEN 'ACH_LB_L9'  THEN v_cond := v_lb_top1   >= 1;
      WHEN 'ACH_LB_L10' THEN v_cond := v_lb_top1   >= 5;
      -- progression
      WHEN 'ACH_PROG_L1'  THEN v_cond := v_level >= 3;
      WHEN 'ACH_PROG_L2'  THEN v_cond := v_level >= 5;
      WHEN 'ACH_PROG_L3'  THEN v_cond := v_level >= 10;
      WHEN 'ACH_PROG_L4'  THEN v_cond := v_level >= 20;
      WHEN 'ACH_PROG_L5'  THEN v_cond := v_level >= 30;
      WHEN 'ACH_PROG_L6'  THEN v_cond := v_level >= 40;
      WHEN 'ACH_PROG_L7'  THEN v_cond := v_level >= 50;
      WHEN 'ACH_PROG_L8'  THEN v_cond := v_level >= 60;
      WHEN 'ACH_PROG_L9'  THEN v_cond := v_level >= 75;
      WHEN 'ACH_PROG_L10' THEN v_cond := v_level >= 100;
      -- quest
      WHEN 'ACH_QUEST_L1'  THEN v_cond := v_quest_count >= 1;
      WHEN 'ACH_QUEST_L2'  THEN v_cond := v_quest_count >= 5;
      WHEN 'ACH_QUEST_L3'  THEN v_cond := v_quest_count >= 10;
      WHEN 'ACH_QUEST_L4'  THEN v_cond := v_quest_count >= 20;
      WHEN 'ACH_QUEST_L5'  THEN v_cond := v_quest_count >= 30;
      WHEN 'ACH_QUEST_L6'  THEN v_cond := v_quest_count >= 50;
      WHEN 'ACH_QUEST_L7'  THEN v_cond := v_quest_count >= 75;
      WHEN 'ACH_QUEST_L8'  THEN v_cond := v_quest_count >= 100;
      WHEN 'ACH_QUEST_L9'  THEN v_cond := v_quest_count >= 150;
      WHEN 'ACH_QUEST_L10' THEN v_cond := v_quest_count >= 200;
      -- special
      WHEN 'ACH_NIGHT_OWL'    THEN v_cond := v_night_owl;
      WHEN 'ACH_EARLY_BIRD'   THEN v_cond := v_early_bird;
      WHEN 'ACH_WEEKEND'      THEN v_cond := v_weekend;
      WHEN 'ACH_NAMED'        THEN v_cond := v_has_display_name;
      WHEN 'ACH_AVATAR'       THEN v_cond := v_has_avatar;
      WHEN 'ACH_GLOBETROTTER' THEN v_cond := v_has_country;
      WHEN 'ACH_THEME_COLLECT'THEN v_cond := v_themes_owned >= 5;
      WHEN 'ACH_RICH'         THEN v_cond := v_coins >= 10000;
      WHEN 'ACH_LOYAL_FAN'    THEN v_cond := v_distinct_days >= 30;
      WHEN 'ACH_SHOPAHOLIC'   THEN v_cond := v_inventory_count >= 10;
      ELSE v_cond := FALSE;
    END CASE;

    IF v_cond THEN
      INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
      VALUES (p_user_id, rec.id, now())
      ON CONFLICT DO NOTHING;

      IF rec.reward_coin > 0 THEN
        PERFORM grant_coins(
          p_user_id, rec.reward_coin,
          'achievement_unlock',
          jsonb_build_object('achievement_id', rec.id)
        );
      END IF;

      v_newly_unlocked := v_newly_unlocked || jsonb_build_array(rec.id);
    END IF;
  END LOOP;

  RETURN v_newly_unlocked;
END;
$function$;
