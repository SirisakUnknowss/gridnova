-- ============================================================
-- Fix Play + Daily achievement names to English
-- ============================================================
UPDATE achievements_definitions SET
  name = CASE id
    WHEN 'ACH_PLAY_M1_L1' THEN 'First Steps'
    WHEN 'ACH_PLAY_M1_L2' THEN 'Getting Started'
    WHEN 'ACH_PLAY_M1_L3' THEN 'Dedicated Player'
    WHEN 'ACH_PLAY_M1_L4' THEN 'Sudoku Master'
    WHEN 'ACH_PLAY_M1_L5' THEN 'Sudoku Legend'
    WHEN 'ACH_PLAY_M2_L1' THEN 'Practice Rookie'
    WHEN 'ACH_PLAY_M2_L2' THEN 'Practice Regular'
    WHEN 'ACH_PLAY_M2_L3' THEN 'Practice Veteran'
    WHEN 'ACH_PLAY_M2_L4' THEN 'Practice Elite'
    WHEN 'ACH_PLAY_M2_L5' THEN 'Practice Legend'
    WHEN 'ACH_PLAY_M3_L1' THEN 'Easy Opener'
    WHEN 'ACH_PLAY_M3_L2' THEN 'Easy Regular'
    WHEN 'ACH_PLAY_M3_L3' THEN 'Easy Pro'
    WHEN 'ACH_PLAY_M3_L4' THEN 'Easy Expert'
    WHEN 'ACH_PLAY_M3_L5' THEN 'Easy King'
    WHEN 'ACH_PLAY_M4_L1' THEN 'Hard Darer'
    WHEN 'ACH_PLAY_M4_L2' THEN 'Hard Fighter'
    WHEN 'ACH_PLAY_M4_L3' THEN 'Hard Pro'
    WHEN 'ACH_PLAY_M4_L4' THEN 'Hard Expert'
    WHEN 'ACH_PLAY_M4_L5' THEN 'Hard King'
    WHEN 'ACH_PLAY_M5_L1' THEN 'Expert Darer'
    WHEN 'ACH_PLAY_M5_L2' THEN 'Expert Fighter'
    WHEN 'ACH_PLAY_M5_L3' THEN 'Expert Pro'
    WHEN 'ACH_PLAY_M5_L4' THEN 'Expert Master'
    WHEN 'ACH_PLAY_M5_L5' THEN 'Expert King'
    WHEN 'ACH_DAILY_M1_L1' THEN 'Daily Debut'
    WHEN 'ACH_DAILY_M1_L2' THEN 'Daily Regular'
    WHEN 'ACH_DAILY_M1_L3' THEN 'Daily Challenger'
    WHEN 'ACH_DAILY_M1_L4' THEN 'Daily Veteran'
    WHEN 'ACH_DAILY_M1_L5' THEN 'Daily Legend'
    WHEN 'ACH_DAILY_M2_L1' THEN 'Daily Easy Starter'
    WHEN 'ACH_DAILY_M2_L2' THEN 'Daily Easy Regular'
    WHEN 'ACH_DAILY_M2_L3' THEN 'Daily Easy Pro'
    WHEN 'ACH_DAILY_M2_L4' THEN 'Daily Easy Expert'
    WHEN 'ACH_DAILY_M2_L5' THEN 'Daily Easy King'
    WHEN 'ACH_DAILY_M3_L1' THEN 'Daily Hard Challenger'
    WHEN 'ACH_DAILY_M3_L2' THEN 'Daily Hard Fighter'
    WHEN 'ACH_DAILY_M3_L3' THEN 'Daily Hard Pro'
    WHEN 'ACH_DAILY_M3_L4' THEN 'Daily Hard Expert'
    WHEN 'ACH_DAILY_M3_L5' THEN 'Daily Hard King'
    WHEN 'ACH_DAILY_M4_L1' THEN 'Clean Debut'
    WHEN 'ACH_DAILY_M4_L2' THEN 'Clean Regular'
    WHEN 'ACH_DAILY_M4_L3' THEN 'Clean Pro'
    WHEN 'ACH_DAILY_M4_L4' THEN 'Clean Expert'
    WHEN 'ACH_DAILY_M4_L5' THEN 'Clean Legend'
    WHEN 'ACH_DAILY_M5_L1' THEN 'Solo Debut'
    WHEN 'ACH_DAILY_M5_L2' THEN 'Solo Regular'
    WHEN 'ACH_DAILY_M5_L3' THEN 'Solo Pro'
    WHEN 'ACH_DAILY_M5_L4' THEN 'Solo Expert'
    WHEN 'ACH_DAILY_M5_L5' THEN 'Solo Legend'
    ELSE name
  END,
  description = CASE id
    WHEN 'ACH_PLAY_M1_L1' THEN 'Play your first Sudoku game'
    WHEN 'ACH_PLAY_M1_L2' THEN 'Play 10 games'
    WHEN 'ACH_PLAY_M1_L3' THEN 'Play 50 games'
    WHEN 'ACH_PLAY_M1_L4' THEN 'Play 200 games'
    WHEN 'ACH_PLAY_M1_L5' THEN 'Play 500 games'
    WHEN 'ACH_PLAY_M2_L1' THEN 'Play 1 Practice game'
    WHEN 'ACH_PLAY_M2_L2' THEN 'Play 10 Practice games'
    WHEN 'ACH_PLAY_M2_L3' THEN 'Play 50 Practice games'
    WHEN 'ACH_PLAY_M2_L4' THEN 'Play 200 Practice games'
    WHEN 'ACH_PLAY_M2_L5' THEN 'Play 500 Practice games'
    WHEN 'ACH_PLAY_M3_L1' THEN 'Play 1 Easy game'
    WHEN 'ACH_PLAY_M3_L2' THEN 'Play 5 Easy games'
    WHEN 'ACH_PLAY_M3_L3' THEN 'Play 20 Easy games'
    WHEN 'ACH_PLAY_M3_L4' THEN 'Play 100 Easy games'
    WHEN 'ACH_PLAY_M3_L5' THEN 'Play 300 Easy games'
    WHEN 'ACH_PLAY_M4_L1' THEN 'Play 1 Hard game'
    WHEN 'ACH_PLAY_M4_L2' THEN 'Play 5 Hard games'
    WHEN 'ACH_PLAY_M4_L3' THEN 'Play 20 Hard games'
    WHEN 'ACH_PLAY_M4_L4' THEN 'Play 100 Hard games'
    WHEN 'ACH_PLAY_M4_L5' THEN 'Play 300 Hard games'
    WHEN 'ACH_PLAY_M5_L1' THEN 'Play 1 Expert game'
    WHEN 'ACH_PLAY_M5_L2' THEN 'Play 5 Expert games'
    WHEN 'ACH_PLAY_M5_L3' THEN 'Play 20 Expert games'
    WHEN 'ACH_PLAY_M5_L4' THEN 'Play 100 Expert games'
    WHEN 'ACH_PLAY_M5_L5' THEN 'Play 300 Expert games'
    WHEN 'ACH_DAILY_M1_L1' THEN 'Complete your first Daily puzzle'
    WHEN 'ACH_DAILY_M1_L2' THEN 'Complete 10 Daily puzzles'
    WHEN 'ACH_DAILY_M1_L3' THEN 'Complete 30 Daily puzzles'
    WHEN 'ACH_DAILY_M1_L4' THEN 'Complete 100 Daily puzzles'
    WHEN 'ACH_DAILY_M1_L5' THEN 'Complete 365 Daily puzzles'
    WHEN 'ACH_DAILY_M2_L1' THEN 'Complete 1 Daily Easy puzzle'
    WHEN 'ACH_DAILY_M2_L2' THEN 'Complete 5 Daily Easy puzzles'
    WHEN 'ACH_DAILY_M2_L3' THEN 'Complete 20 Daily Easy puzzles'
    WHEN 'ACH_DAILY_M2_L4' THEN 'Complete 50 Daily Easy puzzles'
    WHEN 'ACH_DAILY_M2_L5' THEN 'Complete 200 Daily Easy puzzles'
    WHEN 'ACH_DAILY_M3_L1' THEN 'Complete 1 Daily Hard puzzle'
    WHEN 'ACH_DAILY_M3_L2' THEN 'Complete 5 Daily Hard puzzles'
    WHEN 'ACH_DAILY_M3_L3' THEN 'Complete 20 Daily Hard puzzles'
    WHEN 'ACH_DAILY_M3_L4' THEN 'Complete 50 Daily Hard puzzles'
    WHEN 'ACH_DAILY_M3_L5' THEN 'Complete 200 Daily Hard puzzles'
    WHEN 'ACH_DAILY_M4_L1' THEN 'Complete 1 Daily with zero mistakes'
    WHEN 'ACH_DAILY_M4_L2' THEN 'Complete 5 Dailies with zero mistakes'
    WHEN 'ACH_DAILY_M4_L3' THEN 'Complete 20 Dailies with zero mistakes'
    WHEN 'ACH_DAILY_M4_L4' THEN 'Complete 50 Dailies with zero mistakes'
    WHEN 'ACH_DAILY_M4_L5' THEN 'Complete 100 Dailies with zero mistakes'
    WHEN 'ACH_DAILY_M5_L1' THEN 'Complete 1 Daily without using any hints'
    WHEN 'ACH_DAILY_M5_L2' THEN 'Complete 5 Dailies without using any hints'
    WHEN 'ACH_DAILY_M5_L3' THEN 'Complete 20 Dailies without using any hints'
    WHEN 'ACH_DAILY_M5_L4' THEN 'Complete 50 Dailies without using any hints'
    WHEN 'ACH_DAILY_M5_L5' THEN 'Complete 100 Dailies without using any hints'
    ELSE description
  END
WHERE category IN ('play', 'daily');

UPDATE achievements_definitions SET
  mission_name = CASE mission_name
    WHEN 'เล่นเกมทั้งหมด' THEN 'All Games'
    WHEN 'เล่น Practice'   THEN 'Practice'
    WHEN 'Daily รวม'       THEN 'Daily Total'
    WHEN 'Daily ไม่ผิดเลย' THEN 'Daily No Mistakes'
    WHEN 'Daily ไม่ใช้ Hint' THEN 'Daily No Hints'
    ELSE mission_name
  END
WHERE category IN ('play', 'daily');

-- ============================================================
-- Remove old streak + flawless (10-level single-mission format)
-- ============================================================
DELETE FROM user_achievements  WHERE achievement_id LIKE 'ACH_STREAK_%' OR achievement_id LIKE 'ACH_FLAWLESS_%';
DELETE FROM achievements_definitions WHERE id LIKE 'ACH_STREAK_%' OR id LIKE 'ACH_FLAWLESS_%';

-- ============================================================
-- Helper RPC: get complex game stats for achievements
-- ============================================================
CREATE OR REPLACE FUNCTION get_game_streak_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH games AS (
    SELECT mistakes, hints_used, level, mode, completed_at
    FROM user_game_history WHERE user_id = p_user_id
  ),
  numbered AS (
    SELECT
      mistakes, hints_used, level,
      ROW_NUMBER() OVER (ORDER BY completed_at) AS rn
    FROM games
  ),
  p_island AS (
    SELECT (mistakes = 0) AS ok,
           rn - ROW_NUMBER() OVER (PARTITION BY (mistakes=0) ORDER BY rn) AS iid
    FROM numbered
  ),
  h_island AS (
    SELECT (hints_used = 0) AS ok,
           rn - ROW_NUMBER() OVER (PARTITION BY (hints_used=0) ORDER BY rn) AS iid
    FROM numbered
  )
  SELECT jsonb_build_object(
    'max_perfect_run',      COALESCE((SELECT MAX(c) FROM (SELECT COUNT(*) c FROM p_island WHERE ok GROUP BY iid) s), 0),
    'max_pure_run',         COALESCE((SELECT MAX(c) FROM (SELECT COUNT(*) c FROM h_island WHERE ok GROUP BY iid) s), 0),
    'perfect_practice',     (SELECT COUNT(*) FROM games WHERE mistakes=0 AND mode='practice'),
    'perfect_easy',         (SELECT COUNT(*) FROM games WHERE mistakes=0 AND level='easy'::difficulty_enum),
    'perfect_hard',         (SELECT COUNT(*) FROM games WHERE mistakes=0 AND level IN ('hard'::difficulty_enum,'hard-expert'::difficulty_enum)),
    'perfect_expert',       (SELECT COUNT(*) FROM games WHERE mistakes=0 AND level='expert'::difficulty_enum)
  );
$$;

-- ============================================================
-- STREAK GROUP — 5 missions × 5 levels = 25 achievements
-- ============================================================
INSERT INTO achievements_definitions
  (id, name, description, tier, category, badge_level, badge_mission, mission_name, reward_coin, reward_xp, sort_order)
VALUES
  -- M1: Daily Streak (current_streak) — 3/7/14/30/60
  ('ACH_STREAK_M1_L1', 'Streak Starter',  'Maintain a 3-day login streak',   'bronze',   'streak', 1, 1, 'Daily Streak', 100,  200, 3001),
  ('ACH_STREAK_M1_L2', 'Streak Builder',  'Maintain a 7-day login streak',   'silver',   'streak', 2, 1, 'Daily Streak', 300,  600, 3002),
  ('ACH_STREAK_M1_L3', 'Streak Keeper',   'Maintain a 14-day login streak',  'gold',     'streak', 3, 1, 'Daily Streak', 800, 1500, 3003),
  ('ACH_STREAK_M1_L4', 'Streak Master',   'Maintain a 30-day login streak',  'platinum', 'streak', 4, 1, 'Daily Streak', 2000, 4000, 3004),
  ('ACH_STREAK_M1_L5', 'Streak Legend',   'Maintain a 60-day login streak',  'diamond',  'streak', 5, 1, 'Daily Streak', 5000, 10000, 3005),

  -- M2: All-Time Record (longest_streak) — 7/14/30/100/365
  ('ACH_STREAK_M2_L1', 'Week Record',     'Reach a 7-day all-time streak',   'bronze',   'streak', 1, 2, 'All-Time Record', 100,  200, 3011),
  ('ACH_STREAK_M2_L2', 'Two-Week Record', 'Reach a 14-day all-time streak',  'silver',   'streak', 2, 2, 'All-Time Record', 300,  600, 3012),
  ('ACH_STREAK_M2_L3', 'Month Record',    'Reach a 30-day all-time streak',  'gold',     'streak', 3, 2, 'All-Time Record', 800, 1500, 3013),
  ('ACH_STREAK_M2_L4', 'Century Record',  'Reach a 100-day all-time streak', 'platinum', 'streak', 4, 2, 'All-Time Record', 2000, 4000, 3014),
  ('ACH_STREAK_M2_L5', 'Yearly Record',   'Reach a 365-day all-time streak', 'diamond',  'streak', 5, 2, 'All-Time Record', 5000, 10000, 3015),

  -- M3: Active Days (distinct days played) — 7/30/90/180/365
  ('ACH_STREAK_M3_L1', 'Weekly Active',    'Play on 7 different days',   'bronze',   'streak', 1, 3, 'Active Days', 100,  200, 3021),
  ('ACH_STREAK_M3_L2', 'Monthly Active',   'Play on 30 different days',  'silver',   'streak', 2, 3, 'Active Days', 300,  600, 3022),
  ('ACH_STREAK_M3_L3', 'Seasonal Active',  'Play on 90 different days',  'gold',     'streak', 3, 3, 'Active Days', 800, 1500, 3023),
  ('ACH_STREAK_M3_L4', 'Half-Year Active', 'Play on 180 different days', 'platinum', 'streak', 4, 3, 'Active Days', 2000, 4000, 3024),
  ('ACH_STREAK_M3_L5', 'Yearly Active',    'Play on 365 different days', 'diamond',  'streak', 5, 3, 'Active Days', 5000, 10000, 3025),

  -- M4: Perfect Run (max consecutive no-mistake games) — 2/5/10/20/50
  ('ACH_STREAK_M4_L1', 'Clean Pair',     'Win 2 games in a row with zero mistakes',  'bronze',   'streak', 1, 4, 'Perfect Run', 100,  200, 3031),
  ('ACH_STREAK_M4_L2', 'Clean Five',     'Win 5 games in a row with zero mistakes',  'silver',   'streak', 2, 4, 'Perfect Run', 300,  600, 3032),
  ('ACH_STREAK_M4_L3', 'Clean Ten',      'Win 10 games in a row with zero mistakes', 'gold',     'streak', 3, 4, 'Perfect Run', 800, 1500, 3033),
  ('ACH_STREAK_M4_L4', 'Clean Machine',  'Win 20 games in a row with zero mistakes', 'platinum', 'streak', 4, 4, 'Perfect Run', 2000, 4000, 3034),
  ('ACH_STREAK_M4_L5', 'Flawless Run',   'Win 50 games in a row with zero mistakes', 'diamond',  'streak', 5, 4, 'Perfect Run', 5000, 10000, 3035),

  -- M5: Pure Run (max consecutive no-hint games) — 2/5/10/20/50
  ('ACH_STREAK_M5_L1', 'Solo Pair',      'Complete 2 games in a row without hints',  'bronze',   'streak', 1, 5, 'Pure Run', 100,  200, 3041),
  ('ACH_STREAK_M5_L2', 'Solo Five',      'Complete 5 games in a row without hints',  'silver',   'streak', 2, 5, 'Pure Run', 300,  600, 3042),
  ('ACH_STREAK_M5_L3', 'Solo Ten',       'Complete 10 games in a row without hints', 'gold',     'streak', 3, 5, 'Pure Run', 800, 1500, 3043),
  ('ACH_STREAK_M5_L4', 'Solo Machine',   'Complete 20 games in a row without hints', 'platinum', 'streak', 4, 5, 'Pure Run', 2000, 4000, 3044),
  ('ACH_STREAK_M5_L5', 'Pure Legend',    'Complete 50 games in a row without hints', 'diamond',  'streak', 5, 5, 'Pure Run', 5000, 10000, 3045);

-- ============================================================
-- FLAWLESS GROUP — 5 missions × 5 levels = 25 achievements
-- ============================================================
INSERT INTO achievements_definitions
  (id, name, description, tier, category, badge_level, badge_mission, mission_name, reward_coin, reward_xp, sort_order)
VALUES
  -- M1: Zero Mistakes — any mode (1/5/10/20/50)
  ('ACH_FLAWLESS_M1_L1', 'First Flawless',    'Win 1 game with zero mistakes',   'bronze',   'flawless', 1, 1, 'Zero Mistakes', 100,  200, 4001),
  ('ACH_FLAWLESS_M1_L2', 'Flawless Five',     'Win 5 games with zero mistakes',  'silver',   'flawless', 2, 1, 'Zero Mistakes', 300,  600, 4002),
  ('ACH_FLAWLESS_M1_L3', 'Flawless Ten',      'Win 10 games with zero mistakes', 'gold',     'flawless', 3, 1, 'Zero Mistakes', 800, 1500, 4003),
  ('ACH_FLAWLESS_M1_L4', 'Flawless Master',   'Win 20 games with zero mistakes', 'platinum', 'flawless', 4, 1, 'Zero Mistakes', 2000, 4000, 4004),
  ('ACH_FLAWLESS_M1_L5', 'Flawless Legend',   'Win 50 games with zero mistakes', 'diamond',  'flawless', 5, 1, 'Zero Mistakes', 5000, 10000, 4005),

  -- M2: Flawless Practice (1/5/10/20/50)
  ('ACH_FLAWLESS_M2_L1', 'Perfect Practice',       'Win 1 Practice game with zero mistakes',   'bronze',   'flawless', 1, 2, 'Flawless Practice', 100,  200, 4011),
  ('ACH_FLAWLESS_M2_L2', 'Practice Clean',         'Win 5 Practice games with zero mistakes',  'silver',   'flawless', 2, 2, 'Flawless Practice', 300,  600, 4012),
  ('ACH_FLAWLESS_M2_L3', 'Practice Flawless',      'Win 10 Practice games with zero mistakes', 'gold',     'flawless', 3, 2, 'Flawless Practice', 800, 1500, 4013),
  ('ACH_FLAWLESS_M2_L4', 'Practice Perfect Pro',   'Win 20 Practice games with zero mistakes', 'platinum', 'flawless', 4, 2, 'Flawless Practice', 2000, 4000, 4014),
  ('ACH_FLAWLESS_M2_L5', 'Practice Perfect Legend','Win 50 Practice games with zero mistakes', 'diamond',  'flawless', 5, 2, 'Flawless Practice', 5000, 10000, 4015),

  -- M3: Flawless Easy (1/5/10/20/50)
  ('ACH_FLAWLESS_M3_L1', 'Easy Ace',        'Win 1 Easy game with zero mistakes',   'bronze',   'flawless', 1, 3, 'Flawless Easy', 100,  200, 4021),
  ('ACH_FLAWLESS_M3_L2', 'Easy Ace Pro',    'Win 5 Easy games with zero mistakes',  'silver',   'flawless', 2, 3, 'Flawless Easy', 300,  600, 4022),
  ('ACH_FLAWLESS_M3_L3', 'Easy Ace Vet',    'Win 10 Easy games with zero mistakes', 'gold',     'flawless', 3, 3, 'Flawless Easy', 800, 1500, 4023),
  ('ACH_FLAWLESS_M3_L4', 'Easy Ace Master', 'Win 20 Easy games with zero mistakes', 'platinum', 'flawless', 4, 3, 'Flawless Easy', 2000, 4000, 4024),
  ('ACH_FLAWLESS_M3_L5', 'Easy Ace King',   'Win 50 Easy games with zero mistakes', 'diamond',  'flawless', 5, 3, 'Flawless Easy', 5000, 10000, 4025),

  -- M4: Flawless Hard (1/3/5/10/20)
  ('ACH_FLAWLESS_M4_L1', 'Hard Ace',        'Win 1 Hard game with zero mistakes',   'bronze',   'flawless', 1, 4, 'Flawless Hard', 200,  400, 4031),
  ('ACH_FLAWLESS_M4_L2', 'Hard Ace Pro',    'Win 3 Hard games with zero mistakes',  'silver',   'flawless', 2, 4, 'Flawless Hard', 500, 1000, 4032),
  ('ACH_FLAWLESS_M4_L3', 'Hard Ace Vet',    'Win 5 Hard games with zero mistakes',  'gold',     'flawless', 3, 4, 'Flawless Hard', 1000, 2000, 4033),
  ('ACH_FLAWLESS_M4_L4', 'Hard Ace Master', 'Win 10 Hard games with zero mistakes', 'platinum', 'flawless', 4, 4, 'Flawless Hard', 3000, 6000, 4034),
  ('ACH_FLAWLESS_M4_L5', 'Hard Ace King',   'Win 20 Hard games with zero mistakes', 'diamond',  'flawless', 5, 4, 'Flawless Hard', 8000, 15000, 4035),

  -- M5: Flawless Expert (1/3/5/10/15)
  ('ACH_FLAWLESS_M5_L1', 'Expert Ace',        'Win 1 Expert game with zero mistakes',  'bronze',   'flawless', 1, 5, 'Flawless Expert', 300,  600, 4041),
  ('ACH_FLAWLESS_M5_L2', 'Expert Ace Pro',    'Win 3 Expert games with zero mistakes', 'silver',   'flawless', 2, 5, 'Flawless Expert', 800, 1500, 4042),
  ('ACH_FLAWLESS_M5_L3', 'Expert Ace Vet',    'Win 5 Expert games with zero mistakes', 'gold',     'flawless', 3, 5, 'Flawless Expert', 1500, 3000, 4043),
  ('ACH_FLAWLESS_M5_L4', 'Expert Ace Master', 'Win 10 Expert games with zero mistakes','platinum', 'flawless', 4, 5, 'Flawless Expert', 4000, 8000, 4044),
  ('ACH_FLAWLESS_M5_L5', 'Expert Ace King',   'Win 15 Expert games with zero mistakes','diamond',  'flawless', 5, 5, 'Flawless Expert', 10000, 20000, 4045);

-- ============================================================
-- Updated check_and_grant_achievements — full replacement
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_grant_achievements(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_game_count          int := 0;
  v_daily_count         int := 0;
  v_perfect_count       int := 0;
  v_streak              int := 0;
  v_longest_streak      int := 0;
  v_level               int := 1;
  v_coins               numeric := 0;
  v_themes_owned        int := 0;
  v_quest_count         int := 0;
  v_inventory_count     int := 0;
  v_distinct_days       int := 0;
  -- Play missions
  v_practice_count      int := 0;
  v_easy_count          int := 0;
  v_hard_count          int := 0;
  v_expert_count        int := 0;
  -- Daily missions
  v_daily_easy_count    int := 0;
  v_daily_hard_count    int := 0;
  v_daily_perfect_count int := 0;
  v_daily_nohint_count  int := 0;
  -- Streak missions
  v_max_perfect_run     int := 0;
  v_max_pure_run        int := 0;
  -- Flawless missions
  v_perfect_practice    int := 0;
  v_perfect_easy        int := 0;
  v_perfect_hard        int := 0;
  v_perfect_expert      int := 0;
  -- Speedster
  v_easy_daily_best     int;
  v_medium_daily_best   int;
  v_hard_best           int;
  v_hardexpert_best     int;
  v_expert_best         int;
  -- Pure (no-hint by difficulty)
  v_pure_easy_count     int := 0;
  v_pure_medium_count   int := 0;
  v_pure_hard_count     int := 0;
  v_pure_expert_count   int := 0;
  v_pure_expert_perf    bool := false;
  -- Leaderboard
  v_lb_top100  int := 0;
  v_lb_top50   int := 0;
  v_lb_top10   int := 0;
  v_lb_top3    int := 0;
  v_lb_top1    int := 0;
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
  SELECT COUNT(*) INTO v_game_count    FROM user_game_history WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_daily_count   FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily';
  SELECT COUNT(*) INTO v_perfect_count FROM user_game_history WHERE user_id = p_user_id AND mistakes = 0;
  SELECT COUNT(*) INTO v_practice_count FROM user_game_history WHERE user_id = p_user_id AND mode = 'practice';
  SELECT COUNT(*) INTO v_easy_count     FROM user_game_history WHERE user_id = p_user_id AND level = 'easy'::difficulty_enum;
  SELECT COUNT(*) INTO v_hard_count     FROM user_game_history WHERE user_id = p_user_id AND level IN ('hard'::difficulty_enum, 'hard-expert'::difficulty_enum);
  SELECT COUNT(*) INTO v_expert_count   FROM user_game_history WHERE user_id = p_user_id AND level = 'expert'::difficulty_enum;
  SELECT COUNT(*) INTO v_daily_easy_count    FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily' AND level = 'easy'::difficulty_enum;
  SELECT COUNT(*) INTO v_daily_hard_count    FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily' AND level IN ('hard'::difficulty_enum, 'hard-expert'::difficulty_enum);
  SELECT COUNT(*) INTO v_daily_perfect_count FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily' AND mistakes = 0;
  SELECT COUNT(*) INTO v_daily_nohint_count  FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily' AND hints_used = 0;
  SELECT COUNT(*) INTO v_perfect_practice FROM user_game_history WHERE user_id = p_user_id AND mistakes = 0 AND mode = 'practice';
  SELECT COUNT(*) INTO v_perfect_easy     FROM user_game_history WHERE user_id = p_user_id AND mistakes = 0 AND level = 'easy'::difficulty_enum;
  SELECT COUNT(*) INTO v_perfect_hard     FROM user_game_history WHERE user_id = p_user_id AND mistakes = 0 AND level IN ('hard'::difficulty_enum, 'hard-expert'::difficulty_enum);
  SELECT COUNT(*) INTO v_perfect_expert   FROM user_game_history WHERE user_id = p_user_id AND mistakes = 0 AND level = 'expert'::difficulty_enum;
  SELECT COALESCE(current_streak,  0) INTO v_streak         FROM user_progression WHERE user_id = p_user_id;
  SELECT COALESCE(longest_streak,  0) INTO v_longest_streak  FROM user_progression WHERE user_id = p_user_id;
  SELECT COALESCE(level, 1)           INTO v_level           FROM user_progression WHERE user_id = p_user_id;
  SELECT COALESCE(coins, 0)           INTO v_coins           FROM user_wallet       WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_themes_owned    FROM user_inventory WHERE user_id = p_user_id AND item_id LIKE 'theme_%';
  SELECT COUNT(*) INTO v_inventory_count FROM user_inventory WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_quest_count     FROM user_daily_quests WHERE user_id = p_user_id AND claimed_at IS NOT NULL;
  SELECT COUNT(DISTINCT DATE(completed_at AT TIME ZONE 'Asia/Bangkok'))
    INTO v_distinct_days FROM user_game_history WHERE user_id = p_user_id;

  -- Max consecutive no-mistake run
  WITH numbered AS (
    SELECT mistakes, ROW_NUMBER() OVER (ORDER BY completed_at) AS rn
    FROM user_game_history WHERE user_id = p_user_id
  ),
  islands AS (
    SELECT (mistakes = 0) AS ok,
           rn - ROW_NUMBER() OVER (PARTITION BY (mistakes=0) ORDER BY rn) AS iid
    FROM numbered
  )
  SELECT COALESCE(MAX(c), 0) INTO v_max_perfect_run
  FROM (SELECT COUNT(*) AS c FROM islands WHERE ok GROUP BY iid) s;

  -- Max consecutive no-hint run
  WITH numbered AS (
    SELECT hints_used, ROW_NUMBER() OVER (ORDER BY completed_at) AS rn
    FROM user_game_history WHERE user_id = p_user_id
  ),
  islands AS (
    SELECT (hints_used = 0) AS ok,
           rn - ROW_NUMBER() OVER (PARTITION BY (hints_used=0) ORDER BY rn) AS iid
    FROM numbered
  )
  SELECT COALESCE(MAX(c), 0) INTO v_max_pure_run
  FROM (SELECT COUNT(*) AS c FROM islands WHERE ok GROUP BY iid) s;

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
  SELECT COUNT(*) INTO v_pure_easy_count   FROM user_game_history WHERE user_id = p_user_id AND hints_used = 0 AND level = 'easy'::difficulty_enum;
  SELECT COUNT(*) INTO v_pure_medium_count FROM user_game_history WHERE user_id = p_user_id AND hints_used = 0 AND level = 'medium'::difficulty_enum;
  SELECT COUNT(*) INTO v_pure_hard_count   FROM user_game_history WHERE user_id = p_user_id AND hints_used = 0 AND level = 'hard'::difficulty_enum;
  SELECT COUNT(*) INTO v_pure_expert_count FROM user_game_history WHERE user_id = p_user_id AND hints_used = 0 AND level = 'expert'::difficulty_enum;
  SELECT EXISTS(SELECT 1 FROM user_game_history
    WHERE user_id = p_user_id AND hints_used = 0 AND mistakes = 0 AND level = 'expert'::difficulty_enum)
    INTO v_pure_expert_perf;
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

  FOR rec IN SELECT * FROM achievements_definitions ORDER BY sort_order LOOP
    CONTINUE WHEN EXISTS (
      SELECT 1 FROM user_achievements WHERE user_id = p_user_id AND achievement_id = rec.id
    );
    v_cond := FALSE;
    CASE rec.id
      -- ── Play M1 ──────────────────────────────────────────────
      WHEN 'ACH_PLAY_M1_L1' THEN v_cond := v_game_count >= 1;
      WHEN 'ACH_PLAY_M1_L2' THEN v_cond := v_game_count >= 10;
      WHEN 'ACH_PLAY_M1_L3' THEN v_cond := v_game_count >= 50;
      WHEN 'ACH_PLAY_M1_L4' THEN v_cond := v_game_count >= 200;
      WHEN 'ACH_PLAY_M1_L5' THEN v_cond := v_game_count >= 500;
      -- ── Play M2 ──────────────────────────────────────────────
      WHEN 'ACH_PLAY_M2_L1' THEN v_cond := v_practice_count >= 1;
      WHEN 'ACH_PLAY_M2_L2' THEN v_cond := v_practice_count >= 10;
      WHEN 'ACH_PLAY_M2_L3' THEN v_cond := v_practice_count >= 50;
      WHEN 'ACH_PLAY_M2_L4' THEN v_cond := v_practice_count >= 200;
      WHEN 'ACH_PLAY_M2_L5' THEN v_cond := v_practice_count >= 500;
      -- ── Play M3 ──────────────────────────────────────────────
      WHEN 'ACH_PLAY_M3_L1' THEN v_cond := v_easy_count >= 1;
      WHEN 'ACH_PLAY_M3_L2' THEN v_cond := v_easy_count >= 5;
      WHEN 'ACH_PLAY_M3_L3' THEN v_cond := v_easy_count >= 20;
      WHEN 'ACH_PLAY_M3_L4' THEN v_cond := v_easy_count >= 100;
      WHEN 'ACH_PLAY_M3_L5' THEN v_cond := v_easy_count >= 300;
      -- ── Play M4 ──────────────────────────────────────────────
      WHEN 'ACH_PLAY_M4_L1' THEN v_cond := v_hard_count >= 1;
      WHEN 'ACH_PLAY_M4_L2' THEN v_cond := v_hard_count >= 5;
      WHEN 'ACH_PLAY_M4_L3' THEN v_cond := v_hard_count >= 20;
      WHEN 'ACH_PLAY_M4_L4' THEN v_cond := v_hard_count >= 100;
      WHEN 'ACH_PLAY_M4_L5' THEN v_cond := v_hard_count >= 300;
      -- ── Play M5 ──────────────────────────────────────────────
      WHEN 'ACH_PLAY_M5_L1' THEN v_cond := v_expert_count >= 1;
      WHEN 'ACH_PLAY_M5_L2' THEN v_cond := v_expert_count >= 5;
      WHEN 'ACH_PLAY_M5_L3' THEN v_cond := v_expert_count >= 20;
      WHEN 'ACH_PLAY_M5_L4' THEN v_cond := v_expert_count >= 100;
      WHEN 'ACH_PLAY_M5_L5' THEN v_cond := v_expert_count >= 300;
      -- ── Daily M1 ─────────────────────────────────────────────
      WHEN 'ACH_DAILY_M1_L1' THEN v_cond := v_daily_count >= 1;
      WHEN 'ACH_DAILY_M1_L2' THEN v_cond := v_daily_count >= 10;
      WHEN 'ACH_DAILY_M1_L3' THEN v_cond := v_daily_count >= 30;
      WHEN 'ACH_DAILY_M1_L4' THEN v_cond := v_daily_count >= 100;
      WHEN 'ACH_DAILY_M1_L5' THEN v_cond := v_daily_count >= 365;
      -- ── Daily M2 ─────────────────────────────────────────────
      WHEN 'ACH_DAILY_M2_L1' THEN v_cond := v_daily_easy_count >= 1;
      WHEN 'ACH_DAILY_M2_L2' THEN v_cond := v_daily_easy_count >= 5;
      WHEN 'ACH_DAILY_M2_L3' THEN v_cond := v_daily_easy_count >= 20;
      WHEN 'ACH_DAILY_M2_L4' THEN v_cond := v_daily_easy_count >= 50;
      WHEN 'ACH_DAILY_M2_L5' THEN v_cond := v_daily_easy_count >= 200;
      -- ── Daily M3 ─────────────────────────────────────────────
      WHEN 'ACH_DAILY_M3_L1' THEN v_cond := v_daily_hard_count >= 1;
      WHEN 'ACH_DAILY_M3_L2' THEN v_cond := v_daily_hard_count >= 5;
      WHEN 'ACH_DAILY_M3_L3' THEN v_cond := v_daily_hard_count >= 20;
      WHEN 'ACH_DAILY_M3_L4' THEN v_cond := v_daily_hard_count >= 50;
      WHEN 'ACH_DAILY_M3_L5' THEN v_cond := v_daily_hard_count >= 200;
      -- ── Daily M4 ─────────────────────────────────────────────
      WHEN 'ACH_DAILY_M4_L1' THEN v_cond := v_daily_perfect_count >= 1;
      WHEN 'ACH_DAILY_M4_L2' THEN v_cond := v_daily_perfect_count >= 5;
      WHEN 'ACH_DAILY_M4_L3' THEN v_cond := v_daily_perfect_count >= 20;
      WHEN 'ACH_DAILY_M4_L4' THEN v_cond := v_daily_perfect_count >= 50;
      WHEN 'ACH_DAILY_M4_L5' THEN v_cond := v_daily_perfect_count >= 100;
      -- ── Daily M5 ─────────────────────────────────────────────
      WHEN 'ACH_DAILY_M5_L1' THEN v_cond := v_daily_nohint_count >= 1;
      WHEN 'ACH_DAILY_M5_L2' THEN v_cond := v_daily_nohint_count >= 5;
      WHEN 'ACH_DAILY_M5_L3' THEN v_cond := v_daily_nohint_count >= 20;
      WHEN 'ACH_DAILY_M5_L4' THEN v_cond := v_daily_nohint_count >= 50;
      WHEN 'ACH_DAILY_M5_L5' THEN v_cond := v_daily_nohint_count >= 100;
      -- ── Streak M1: Daily Streak ───────────────────────────────
      WHEN 'ACH_STREAK_M1_L1' THEN v_cond := v_streak >= 3;
      WHEN 'ACH_STREAK_M1_L2' THEN v_cond := v_streak >= 7;
      WHEN 'ACH_STREAK_M1_L3' THEN v_cond := v_streak >= 14;
      WHEN 'ACH_STREAK_M1_L4' THEN v_cond := v_streak >= 30;
      WHEN 'ACH_STREAK_M1_L5' THEN v_cond := v_streak >= 60;
      -- ── Streak M2: All-Time Record ────────────────────────────
      WHEN 'ACH_STREAK_M2_L1' THEN v_cond := v_longest_streak >= 7;
      WHEN 'ACH_STREAK_M2_L2' THEN v_cond := v_longest_streak >= 14;
      WHEN 'ACH_STREAK_M2_L3' THEN v_cond := v_longest_streak >= 30;
      WHEN 'ACH_STREAK_M2_L4' THEN v_cond := v_longest_streak >= 100;
      WHEN 'ACH_STREAK_M2_L5' THEN v_cond := v_longest_streak >= 365;
      -- ── Streak M3: Active Days ────────────────────────────────
      WHEN 'ACH_STREAK_M3_L1' THEN v_cond := v_distinct_days >= 7;
      WHEN 'ACH_STREAK_M3_L2' THEN v_cond := v_distinct_days >= 30;
      WHEN 'ACH_STREAK_M3_L3' THEN v_cond := v_distinct_days >= 90;
      WHEN 'ACH_STREAK_M3_L4' THEN v_cond := v_distinct_days >= 180;
      WHEN 'ACH_STREAK_M3_L5' THEN v_cond := v_distinct_days >= 365;
      -- ── Streak M4: Perfect Run ────────────────────────────────
      WHEN 'ACH_STREAK_M4_L1' THEN v_cond := v_max_perfect_run >= 2;
      WHEN 'ACH_STREAK_M4_L2' THEN v_cond := v_max_perfect_run >= 5;
      WHEN 'ACH_STREAK_M4_L3' THEN v_cond := v_max_perfect_run >= 10;
      WHEN 'ACH_STREAK_M4_L4' THEN v_cond := v_max_perfect_run >= 20;
      WHEN 'ACH_STREAK_M4_L5' THEN v_cond := v_max_perfect_run >= 50;
      -- ── Streak M5: Pure Run ───────────────────────────────────
      WHEN 'ACH_STREAK_M5_L1' THEN v_cond := v_max_pure_run >= 2;
      WHEN 'ACH_STREAK_M5_L2' THEN v_cond := v_max_pure_run >= 5;
      WHEN 'ACH_STREAK_M5_L3' THEN v_cond := v_max_pure_run >= 10;
      WHEN 'ACH_STREAK_M5_L4' THEN v_cond := v_max_pure_run >= 20;
      WHEN 'ACH_STREAK_M5_L5' THEN v_cond := v_max_pure_run >= 50;
      -- ── Flawless M1: Zero Mistakes ───────────────────────────
      WHEN 'ACH_FLAWLESS_M1_L1' THEN v_cond := v_perfect_count >= 1;
      WHEN 'ACH_FLAWLESS_M1_L2' THEN v_cond := v_perfect_count >= 5;
      WHEN 'ACH_FLAWLESS_M1_L3' THEN v_cond := v_perfect_count >= 10;
      WHEN 'ACH_FLAWLESS_M1_L4' THEN v_cond := v_perfect_count >= 20;
      WHEN 'ACH_FLAWLESS_M1_L5' THEN v_cond := v_perfect_count >= 50;
      -- ── Flawless M2: Practice ────────────────────────────────
      WHEN 'ACH_FLAWLESS_M2_L1' THEN v_cond := v_perfect_practice >= 1;
      WHEN 'ACH_FLAWLESS_M2_L2' THEN v_cond := v_perfect_practice >= 5;
      WHEN 'ACH_FLAWLESS_M2_L3' THEN v_cond := v_perfect_practice >= 10;
      WHEN 'ACH_FLAWLESS_M2_L4' THEN v_cond := v_perfect_practice >= 20;
      WHEN 'ACH_FLAWLESS_M2_L5' THEN v_cond := v_perfect_practice >= 50;
      -- ── Flawless M3: Easy ────────────────────────────────────
      WHEN 'ACH_FLAWLESS_M3_L1' THEN v_cond := v_perfect_easy >= 1;
      WHEN 'ACH_FLAWLESS_M3_L2' THEN v_cond := v_perfect_easy >= 5;
      WHEN 'ACH_FLAWLESS_M3_L3' THEN v_cond := v_perfect_easy >= 10;
      WHEN 'ACH_FLAWLESS_M3_L4' THEN v_cond := v_perfect_easy >= 20;
      WHEN 'ACH_FLAWLESS_M3_L5' THEN v_cond := v_perfect_easy >= 50;
      -- ── Flawless M4: Hard ────────────────────────────────────
      WHEN 'ACH_FLAWLESS_M4_L1' THEN v_cond := v_perfect_hard >= 1;
      WHEN 'ACH_FLAWLESS_M4_L2' THEN v_cond := v_perfect_hard >= 3;
      WHEN 'ACH_FLAWLESS_M4_L3' THEN v_cond := v_perfect_hard >= 5;
      WHEN 'ACH_FLAWLESS_M4_L4' THEN v_cond := v_perfect_hard >= 10;
      WHEN 'ACH_FLAWLESS_M4_L5' THEN v_cond := v_perfect_hard >= 20;
      -- ── Flawless M5: Expert ──────────────────────────────────
      WHEN 'ACH_FLAWLESS_M5_L1' THEN v_cond := v_perfect_expert >= 1;
      WHEN 'ACH_FLAWLESS_M5_L2' THEN v_cond := v_perfect_expert >= 3;
      WHEN 'ACH_FLAWLESS_M5_L3' THEN v_cond := v_perfect_expert >= 5;
      WHEN 'ACH_FLAWLESS_M5_L4' THEN v_cond := v_perfect_expert >= 10;
      WHEN 'ACH_FLAWLESS_M5_L5' THEN v_cond := v_perfect_expert >= 15;
      -- ── Speedster ────────────────────────────────────────────
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
      -- ── Pure ─────────────────────────────────────────────────
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
      -- ── Leaderboard ──────────────────────────────────────────
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
      -- ── Progression ──────────────────────────────────────────
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
      -- ── Quest ────────────────────────────────────────────────
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
      -- ── Special ──────────────────────────────────────────────
      WHEN 'ACH_NIGHT_OWL'     THEN v_cond := v_night_owl;
      WHEN 'ACH_EARLY_BIRD'    THEN v_cond := v_early_bird;
      WHEN 'ACH_WEEKEND'       THEN v_cond := v_weekend;
      WHEN 'ACH_NAMED'         THEN v_cond := v_has_display_name;
      WHEN 'ACH_AVATAR'        THEN v_cond := v_has_avatar;
      WHEN 'ACH_GLOBETROTTER'  THEN v_cond := v_has_country;
      WHEN 'ACH_THEME_COLLECT' THEN v_cond := v_themes_owned >= 5;
      WHEN 'ACH_RICH'          THEN v_cond := v_coins >= 10000;
      WHEN 'ACH_LOYAL_FAN'     THEN v_cond := v_distinct_days >= 30;
      WHEN 'ACH_SHOPAHOLIC'    THEN v_cond := v_inventory_count >= 10;
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

-- Backfill
DO $$
DECLARE uid uuid;
BEGIN
  FOR uid IN SELECT DISTINCT user_id FROM user_game_history LOOP
    PERFORM check_and_grant_achievements(uid);
  END LOOP;
END $$;
