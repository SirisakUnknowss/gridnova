-- Achievement system redesign: tiered badges (8 groups × 5 levels) + 8 special
-- Replaces all 50 old one-shot achievements with 48 new tiered achievements.

-- Step 1: Add badge_level column (badge_group reuses the existing category column)
ALTER TABLE achievements_definitions
  ADD COLUMN IF NOT EXISTS badge_level INT NOT NULL DEFAULT 0;

-- Step 2: Clear existing data (old IDs are gone; coins already granted are kept)
DELETE FROM user_achievements;
DELETE FROM achievements_definitions;

-- Step 3: Insert 48 new achievements
-- Columns: id, name, description, tier, category(=badge_group), reward_coin, reward_xp, sort_order, badge_level

INSERT INTO achievements_definitions
  (id, name, description, tier, category, reward_coin, reward_xp, sort_order, badge_level)
VALUES
  -- ── player (🎮) ──────────────────────────────────────────
  ('ACH_PLAYER_L1', 'First Steps',   'Complete your first game',   'bronze',   'player',      50,    100,  1, 1),
  ('ACH_PLAYER_L2', 'Beginner',      'Play 10 games',              'silver',   'player',     100,    200,  2, 2),
  ('ACH_PLAYER_L3', 'Regular',       'Play 50 games',              'gold',     'player',     300,    500,  3, 3),
  ('ACH_PLAYER_L4', 'Veteran',       'Play 200 games',             'platinum', 'player',     800,   1500,  4, 4),
  ('ACH_PLAYER_L5', 'Master',        'Play 1000 games',            'diamond',  'player',    3000,   8000,  5, 5),

  -- ── daily (📅) ───────────────────────────────────────────
  ('ACH_DAILY_L1',  'First Daily',   'Complete your first Daily Puzzle',  'bronze',   'daily',    50,    100, 11, 1),
  ('ACH_DAILY_L2',  'Daily Habit',   'Complete 10 Daily Puzzles',         'silver',   'daily',   150,    300, 12, 2),
  ('ACH_DAILY_L3',  'Daily Regular', 'Complete 30 Daily Puzzles',         'gold',     'daily',   400,    800, 13, 3),
  ('ACH_DAILY_L4',  'Daily Devotee', 'Complete 100 Daily Puzzles',        'platinum', 'daily',  1000,   2000, 14, 4),
  ('ACH_DAILY_L5',  'Year of Puzzles','Complete 365 Daily Puzzles',       'diamond',  'daily',  5000,  15000, 15, 5),

  -- ── streak (🔥) ──────────────────────────────────────────
  ('ACH_STREAK_L1', 'Trio',          'Keep a 3-day streak',    'bronze',   'streak',    100,    200, 21, 1),
  ('ACH_STREAK_L2', 'Week Warrior',  'Keep a 7-day streak',    'silver',   'streak',    300,    500, 22, 2),
  ('ACH_STREAK_L3', 'Monthly',       'Keep a 30-day streak',   'gold',     'streak',   1000,   2000, 23, 3),
  ('ACH_STREAK_L4', 'Centurion',     'Keep a 100-day streak',  'platinum', 'streak',   3000,   8000, 24, 4),
  ('ACH_STREAK_L5', 'Year Long',     'Keep a 365-day streak',  'diamond',  'streak',  10000,  30000, 25, 5),

  -- ── flawless (⭐) — wins with 0 mistakes ─────────────────
  ('ACH_FLAWLESS_L1', 'Flawless Start', 'Win 5 games without mistakes',   'bronze',   'flawless',   50,   100, 31, 1),
  ('ACH_FLAWLESS_L2', 'Clean Player',   'Win 10 games without mistakes',  'silver',   'flawless',  100,   200, 32, 2),
  ('ACH_FLAWLESS_L3', 'Precision',      'Win 20 games without mistakes',  'gold',     'flawless',  200,   400, 33, 3),
  ('ACH_FLAWLESS_L4', 'Perfectionist',  'Win 50 games without mistakes',  'platinum', 'flawless',  300,   600, 34, 4),
  ('ACH_FLAWLESS_L5', 'Untouchable',    'Win 100 games without mistakes', 'diamond',  'flawless',  500,  1000, 35, 5),

  -- ── speedster (⚡) ───────────────────────────────────────
  ('ACH_SPEED_L1', 'Quick Draw',  'Beat Easy in under 3 minutes (Daily only)',         'bronze',   'speedster',   150,    300, 41, 1),
  ('ACH_SPEED_L2', 'Fast Mind',   'Beat Medium in under 5 minutes (Daily only)',       'silver',   'speedster',   400,    800, 42, 2),
  ('ACH_SPEED_L3', 'Speed Solver','Beat Hard in under 10 minutes',                    'gold',     'speedster',  1000,   2000, 43, 3),
  ('ACH_SPEED_L4', 'Lightning',   'Beat Hard-Expert in under 15 minutes',             'platinum', 'speedster',  2000,   5000, 44, 4),
  ('ACH_SPEED_L5', 'Flash',       'Beat Expert in under 25 minutes',                  'diamond',  'speedster',  5000,  15000, 45, 5),

  -- ── pure (🧠) — no hints ─────────────────────────────────
  ('ACH_PURE_L1', 'No Training Wheels', 'Win Easy without hints',                      'bronze',   'pure',   100,    200, 51, 1),
  ('ACH_PURE_L2', 'Self-Reliant',       'Win Medium without hints',                    'silver',   'pure',   200,    400, 52, 2),
  ('ACH_PURE_L3', 'Pure Skill',         'Win Hard without hints',                      'gold',     'pure',   600,   1500, 53, 3),
  ('ACH_PURE_L4', 'Genius',             'Win Expert without hints',                    'platinum', 'pure',  2000,   5000, 54, 4),
  ('ACH_PURE_L5', 'Nightmare Mode',     'Win Expert with no hints and no mistakes',    'diamond',  'pure',  5000,  15000, 55, 5),

  -- ── leaderboard (🏆) — accumulate top-N finishes ─────────
  ('ACH_LB_L1', 'Rising Star',    'Reach Top 100 on Daily Leaderboard once',  'bronze',   'leaderboard',   300,    500, 61, 1),
  ('ACH_LB_L2', 'Top 50',         'Reach Top 50 three times',                 'silver',   'leaderboard',   500,   1000, 62, 2),
  ('ACH_LB_L3', 'Top 10',         'Reach Top 10 three times',                 'gold',     'leaderboard',  1500,   3000, 63, 3),
  ('ACH_LB_L4', 'Podium',         'Reach Top 3 three times',                  'platinum', 'leaderboard',  3000,   8000, 64, 4),
  ('ACH_LB_L5', 'Daily Champion', 'Reach #1 five times',                      'diamond',  'leaderboard',  5000,  20000, 65, 5),

  -- ── progression (📈) — player level ──────────────────────
  ('ACH_PROG_L1', 'Apprentice', 'Reach level 5',   'bronze',   'progression',   200,    400, 71, 1),
  ('ACH_PROG_L2', 'Adept',      'Reach level 10',  'silver',   'progression',   500,   1000, 72, 2),
  ('ACH_PROG_L3', 'Expert',     'Reach level 25',  'gold',     'progression',  1500,   3000, 73, 3),
  ('ACH_PROG_L4', 'Master',     'Reach level 50',  'platinum', 'progression',  5000,  10000, 74, 4),
  ('ACH_PROG_L5', 'Grandmaster','Reach level 100', 'diamond',  'progression', 15000,  50000, 75, 5),

  -- ── special (✨) — one-time, badge_level = 0 ─────────────
  ('ACH_NIGHT_OWL',    'Night Owl',       'Play between 23:00 and 04:00',         'bronze', 'special',   100,   100, 81, 0),
  ('ACH_EARLY_BIRD',   'Early Bird',      'Play between 05:00 and 07:00',         'bronze', 'special',   100,   100, 82, 0),
  ('ACH_WEEKEND',      'Weekend Warrior', 'Play on both Saturday and Sunday',     'bronze', 'special',   100,   200, 83, 0),
  ('ACH_NAMED',        'Identified',      'Set a custom display name',            'bronze', 'special',    50,   100, 84, 0),
  ('ACH_AVATAR',       'Self-Portrait',   'Choose a custom avatar',               'bronze', 'special',    50,   100, 85, 0),
  ('ACH_GLOBETROTTER', 'Globetrotter',    'Set your country in profile',          'bronze', 'special',    50,   100, 86, 0),
  ('ACH_THEME_COLLECT','Theme Collector', 'Own 5 or more themes',                 'silver', 'special',   500,  1000, 87, 0),
  ('ACH_RICH',         'Coin Hoarder',    'Hold 10,000 coins at once',            'gold',   'special',  1000,  2000, 88, 0);

-- Step 4: Rewrite check_and_grant_achievements
CREATE OR REPLACE FUNCTION public.check_and_grant_achievements(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  -- Simple counters
  v_game_count   int := 0;
  v_daily_count  int := 0;
  v_perfect_count int := 0;
  v_streak       int := 0;
  v_level        int := 1;
  v_coins        numeric := 0;
  v_themes_owned int := 0;

  -- Speedster: best time per difficulty (NULL = never played that difficulty)
  v_easy_daily_best    int;
  v_medium_daily_best  int;
  v_hard_best          int;
  v_hardexpert_best    int;
  v_expert_best        int;

  -- Pure: has ever won without hints at each difficulty
  v_pure_easy            bool := false;
  v_pure_medium          bool := false;
  v_pure_hard            bool := false;
  v_pure_expert          bool := false;
  v_pure_expert_perfect  bool := false;

  -- Leaderboard: count of top-N finishes
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
  -- ── Simple counters ─────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_game_count
    FROM user_game_history WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_daily_count
    FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily';

  SELECT COUNT(*) INTO v_perfect_count
    FROM user_game_history WHERE user_id = p_user_id AND mistakes = 0;

  SELECT COALESCE(current_streak, 0) INTO v_streak
    FROM user_progression WHERE user_id = p_user_id;

  SELECT COALESCE(level, 1) INTO v_level
    FROM user_progression WHERE user_id = p_user_id;

  SELECT COALESCE(coins, 0) INTO v_coins
    FROM user_wallet WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_themes_owned
    FROM user_inventory WHERE user_id = p_user_id AND item_id LIKE 'theme_%';

  -- ── Speedster: best times ───────────────────────────────────────────────
  -- L1/L2: Daily only (Easy/Medium practice doesn't count)
  SELECT MIN(time_seconds) INTO v_easy_daily_best
    FROM user_game_history
    WHERE user_id = p_user_id AND mode = 'daily' AND level = 'easy'::difficulty_enum;

  SELECT MIN(time_seconds) INTO v_medium_daily_best
    FROM user_game_history
    WHERE user_id = p_user_id AND mode = 'daily' AND level = 'medium'::difficulty_enum;

  -- L3-L5: Both Daily and Practice count (difficulty name ≥ hard)
  SELECT MIN(time_seconds) INTO v_hard_best
    FROM user_game_history
    WHERE user_id = p_user_id AND level = 'hard'::difficulty_enum;

  SELECT MIN(time_seconds) INTO v_hardexpert_best
    FROM user_game_history
    WHERE user_id = p_user_id AND level = 'hard-expert'::difficulty_enum;

  SELECT MIN(time_seconds) INTO v_expert_best
    FROM user_game_history
    WHERE user_id = p_user_id AND level = 'expert'::difficulty_enum;

  -- ── Pure: no-hint wins ──────────────────────────────────────────────────
  SELECT EXISTS(SELECT 1 FROM user_game_history
    WHERE user_id = p_user_id AND hints_used = 0 AND level = 'easy'::difficulty_enum)
    INTO v_pure_easy;

  SELECT EXISTS(SELECT 1 FROM user_game_history
    WHERE user_id = p_user_id AND hints_used = 0 AND level = 'medium'::difficulty_enum)
    INTO v_pure_medium;

  SELECT EXISTS(SELECT 1 FROM user_game_history
    WHERE user_id = p_user_id AND hints_used = 0 AND level = 'hard'::difficulty_enum)
    INTO v_pure_hard;

  SELECT EXISTS(SELECT 1 FROM user_game_history
    WHERE user_id = p_user_id AND hints_used = 0 AND level = 'expert'::difficulty_enum)
    INTO v_pure_expert;

  SELECT EXISTS(SELECT 1 FROM user_game_history
    WHERE user_id = p_user_id AND hints_used = 0 AND mistakes = 0
          AND level = 'expert'::difficulty_enum)
    INTO v_pure_expert_perfect;

  -- ── Leaderboard: count of top-N daily finishes ──────────────────────────
  WITH ranked AS (
    SELECT dl.user_id,
      RANK() OVER (PARTITION BY dl.date ORDER BY dl.score DESC, dl.time_seconds ASC) AS rnk
    FROM daily_leaderboard dl
  )
  SELECT
    COALESCE(COUNT(*) FILTER (WHERE rnk <= 100), 0),
    COALESCE(COUNT(*) FILTER (WHERE rnk <= 50),  0),
    COALESCE(COUNT(*) FILTER (WHERE rnk <= 10),  0),
    COALESCE(COUNT(*) FILTER (WHERE rnk <= 3),   0),
    COALESCE(COUNT(*) FILTER (WHERE rnk = 1),    0)
  INTO v_lb_top100, v_lb_top50, v_lb_top10, v_lb_top3, v_lb_top1
  FROM ranked
  WHERE user_id = p_user_id;

  -- ── Special: time-based ─────────────────────────────────────────────────
  SELECT EXISTS(
    SELECT 1 FROM user_game_history WHERE user_id = p_user_id
    AND (
      EXTRACT(HOUR FROM completed_at AT TIME ZONE 'Asia/Bangkok') >= 23
      OR EXTRACT(HOUR FROM completed_at AT TIME ZONE 'Asia/Bangkok') <= 3
    )
  ) INTO v_night_owl;

  SELECT EXISTS(
    SELECT 1 FROM user_game_history WHERE user_id = p_user_id
    AND EXTRACT(HOUR FROM completed_at AT TIME ZONE 'Asia/Bangkok') BETWEEN 5 AND 6
  ) INTO v_early_bird;

  -- Weekend: has played on BOTH Saturday (DOW=6) and Sunday (DOW=0)
  SELECT COUNT(DISTINCT EXTRACT(DOW FROM completed_at AT TIME ZONE 'Asia/Bangkok')::int) >= 2
  INTO v_weekend
  FROM user_game_history WHERE user_id = p_user_id
  AND EXTRACT(DOW FROM completed_at AT TIME ZONE 'Asia/Bangkok') IN (0, 6);

  -- ── Special: profile-based ──────────────────────────────────────────────
  SELECT
    COALESCE(display_name, '') <> '',
    COALESCE(avatar_url,   '') <> '',
    COALESCE(country,      '') <> ''
  INTO v_has_display_name, v_has_avatar, v_has_country
  FROM profiles WHERE id = p_user_id;

  -- ── Check & grant ───────────────────────────────────────────────────────
  FOR rec IN SELECT * FROM achievements_definitions ORDER BY sort_order LOOP
    CONTINUE WHEN EXISTS (
      SELECT 1 FROM user_achievements
      WHERE user_id = p_user_id AND achievement_id = rec.id
    );

    v_cond := FALSE;

    CASE rec.id
      -- player
      WHEN 'ACH_PLAYER_L1' THEN v_cond := v_game_count >= 1;
      WHEN 'ACH_PLAYER_L2' THEN v_cond := v_game_count >= 10;
      WHEN 'ACH_PLAYER_L3' THEN v_cond := v_game_count >= 50;
      WHEN 'ACH_PLAYER_L4' THEN v_cond := v_game_count >= 200;
      WHEN 'ACH_PLAYER_L5' THEN v_cond := v_game_count >= 1000;
      -- daily
      WHEN 'ACH_DAILY_L1'  THEN v_cond := v_daily_count >= 1;
      WHEN 'ACH_DAILY_L2'  THEN v_cond := v_daily_count >= 10;
      WHEN 'ACH_DAILY_L3'  THEN v_cond := v_daily_count >= 30;
      WHEN 'ACH_DAILY_L4'  THEN v_cond := v_daily_count >= 100;
      WHEN 'ACH_DAILY_L5'  THEN v_cond := v_daily_count >= 365;
      -- streak
      WHEN 'ACH_STREAK_L1' THEN v_cond := v_streak >= 3;
      WHEN 'ACH_STREAK_L2' THEN v_cond := v_streak >= 7;
      WHEN 'ACH_STREAK_L3' THEN v_cond := v_streak >= 30;
      WHEN 'ACH_STREAK_L4' THEN v_cond := v_streak >= 100;
      WHEN 'ACH_STREAK_L5' THEN v_cond := v_streak >= 365;
      -- flawless
      WHEN 'ACH_FLAWLESS_L1' THEN v_cond := v_perfect_count >= 5;
      WHEN 'ACH_FLAWLESS_L2' THEN v_cond := v_perfect_count >= 10;
      WHEN 'ACH_FLAWLESS_L3' THEN v_cond := v_perfect_count >= 20;
      WHEN 'ACH_FLAWLESS_L4' THEN v_cond := v_perfect_count >= 50;
      WHEN 'ACH_FLAWLESS_L5' THEN v_cond := v_perfect_count >= 100;
      -- speedster
      WHEN 'ACH_SPEED_L1' THEN v_cond := v_easy_daily_best   IS NOT NULL AND v_easy_daily_best   <= 180;
      WHEN 'ACH_SPEED_L2' THEN v_cond := v_medium_daily_best IS NOT NULL AND v_medium_daily_best <= 300;
      WHEN 'ACH_SPEED_L3' THEN v_cond := v_hard_best         IS NOT NULL AND v_hard_best         <= 600;
      WHEN 'ACH_SPEED_L4' THEN v_cond := v_hardexpert_best   IS NOT NULL AND v_hardexpert_best   <= 900;
      WHEN 'ACH_SPEED_L5' THEN v_cond := v_expert_best       IS NOT NULL AND v_expert_best       <= 1500;
      -- pure
      WHEN 'ACH_PURE_L1' THEN v_cond := v_pure_easy;
      WHEN 'ACH_PURE_L2' THEN v_cond := v_pure_medium;
      WHEN 'ACH_PURE_L3' THEN v_cond := v_pure_hard;
      WHEN 'ACH_PURE_L4' THEN v_cond := v_pure_expert;
      WHEN 'ACH_PURE_L5' THEN v_cond := v_pure_expert_perfect;
      -- leaderboard
      WHEN 'ACH_LB_L1' THEN v_cond := v_lb_top100 >= 1;
      WHEN 'ACH_LB_L2' THEN v_cond := v_lb_top50  >= 3;
      WHEN 'ACH_LB_L3' THEN v_cond := v_lb_top10  >= 3;
      WHEN 'ACH_LB_L4' THEN v_cond := v_lb_top3   >= 3;
      WHEN 'ACH_LB_L5' THEN v_cond := v_lb_top1   >= 5;
      -- progression
      WHEN 'ACH_PROG_L1' THEN v_cond := v_level >= 5;
      WHEN 'ACH_PROG_L2' THEN v_cond := v_level >= 10;
      WHEN 'ACH_PROG_L3' THEN v_cond := v_level >= 25;
      WHEN 'ACH_PROG_L4' THEN v_cond := v_level >= 50;
      WHEN 'ACH_PROG_L5' THEN v_cond := v_level >= 100;
      -- special
      WHEN 'ACH_NIGHT_OWL'    THEN v_cond := v_night_owl;
      WHEN 'ACH_EARLY_BIRD'   THEN v_cond := v_early_bird;
      WHEN 'ACH_WEEKEND'      THEN v_cond := v_weekend;
      WHEN 'ACH_NAMED'        THEN v_cond := v_has_display_name;
      WHEN 'ACH_AVATAR'       THEN v_cond := v_has_avatar;
      WHEN 'ACH_GLOBETROTTER' THEN v_cond := v_has_country;
      WHEN 'ACH_THEME_COLLECT'THEN v_cond := v_themes_owned >= 5;
      WHEN 'ACH_RICH'         THEN v_cond := v_coins >= 10000;
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
