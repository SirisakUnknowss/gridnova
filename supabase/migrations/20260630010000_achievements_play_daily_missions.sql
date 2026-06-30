-- Add mission columns to achievements_definitions
ALTER TABLE achievements_definitions
  ADD COLUMN IF NOT EXISTS badge_mission INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS mission_name  TEXT;

-- Remove old play and daily achievements
DELETE FROM user_achievements  WHERE achievement_id LIKE 'ACH_PLAYER_%' OR achievement_id LIKE 'ACH_DAILY_%';
DELETE FROM achievements_definitions WHERE id LIKE 'ACH_PLAYER_%' OR id LIKE 'ACH_DAILY_%';

-- ============================================================
-- PLAY GROUP — 5 missions × 5 levels = 25 achievements
-- ============================================================
INSERT INTO achievements_definitions
  (id, name, description, tier, category, badge_level, badge_mission, mission_name, reward_coin, reward_xp, sort_order)
VALUES
  -- M1: เล่นเกมทั้งหมด (1 / 10 / 50 / 200 / 500)
  ('ACH_PLAY_M1_L1', 'นักผจญภัยมือใหม่',    'เล่นเกม Sudoku ครั้งแรก',  'bronze',   'play', 1, 1, 'เล่นเกมทั้งหมด',  50,   100,  1001),
  ('ACH_PLAY_M1_L2', 'นักผจญภัย',            'เล่นเกม 10 ครั้ง',         'silver',   'play', 2, 1, 'เล่นเกมทั้งหมด', 150,   300,  1002),
  ('ACH_PLAY_M1_L3', 'ผู้ชำนาญการ',           'เล่นเกม 50 ครั้ง',         'gold',     'play', 3, 1, 'เล่นเกมทั้งหมด', 400,   800,  1003),
  ('ACH_PLAY_M1_L4', 'เซียนซูโดกุ',           'เล่นเกม 200 ครั้ง',        'platinum', 'play', 4, 1, 'เล่นเกมทั้งหมด', 1000, 2000,  1004),
  ('ACH_PLAY_M1_L5', 'ตำนานซูโดกุ',           'เล่นเกม 500 ครั้ง',        'diamond',  'play', 5, 1, 'เล่นเกมทั้งหมด', 3000, 5000,  1005),

  -- M2: เล่น Practice (1 / 10 / 50 / 200 / 500)
  ('ACH_PLAY_M2_L1', 'ฝึกฝนมือใหม่',          'เล่น Practice 1 ครั้ง',    'bronze',   'play', 1, 2, 'เล่น Practice',   50,   100,  1011),
  ('ACH_PLAY_M2_L2', 'ฝึกฝนสม่ำเสมอ',         'เล่น Practice 10 ครั้ง',   'silver',   'play', 2, 2, 'เล่น Practice',  150,   300,  1012),
  ('ACH_PLAY_M2_L3', 'นักฝึกฝน',               'เล่น Practice 50 ครั้ง',   'gold',     'play', 3, 2, 'เล่น Practice',  400,   800,  1013),
  ('ACH_PLAY_M2_L4', 'ยอดนักฝึก',              'เล่น Practice 200 ครั้ง',  'platinum', 'play', 4, 2, 'เล่น Practice', 1000, 2000,  1014),
  ('ACH_PLAY_M2_L5', 'มาสเตอร์แห่งการฝึก',    'เล่น Practice 500 ครั้ง',  'diamond',  'play', 5, 2, 'เล่น Practice', 3000, 5000,  1015),

  -- M3: Easy Games (1 / 5 / 20 / 100 / 300)
  ('ACH_PLAY_M3_L1', 'ผ่านด่านง่าย',           'เล่น Easy 1 ครั้ง',        'bronze',   'play', 1, 3, 'Easy Games',      50,   100,  1021),
  ('ACH_PLAY_M3_L2', 'คุ้นเคยกับ Easy',        'เล่น Easy 5 ครั้ง',        'silver',   'play', 2, 3, 'Easy Games',     150,   300,  1022),
  ('ACH_PLAY_M3_L3', 'ชำนาญ Easy',             'เล่น Easy 20 ครั้ง',       'gold',     'play', 3, 3, 'Easy Games',     400,   800,  1023),
  ('ACH_PLAY_M3_L4', 'เจ้า Easy',               'เล่น Easy 100 ครั้ง',      'platinum', 'play', 4, 3, 'Easy Games',    1000, 2000,  1024),
  ('ACH_PLAY_M3_L5', 'ราชา Easy',               'เล่น Easy 300 ครั้ง',      'diamond',  'play', 5, 3, 'Easy Games',    3000, 5000,  1025),

  -- M4: Hard Games — hard + hard-expert (1 / 5 / 20 / 100 / 300)
  ('ACH_PLAY_M4_L1', 'ท้าทายความยาก',          'เล่น Hard 1 ครั้ง',        'bronze',   'play', 1, 4, 'Hard Games',      50,   100,  1031),
  ('ACH_PLAY_M4_L2', 'ยอมรับความยาก',          'เล่น Hard 5 ครั้ง',        'silver',   'play', 2, 4, 'Hard Games',     150,   300,  1032),
  ('ACH_PLAY_M4_L3', 'ชำนาญ Hard',             'เล่น Hard 20 ครั้ง',       'gold',     'play', 3, 4, 'Hard Games',     400,   800,  1033),
  ('ACH_PLAY_M4_L4', 'เจ้า Hard',               'เล่น Hard 100 ครั้ง',      'platinum', 'play', 4, 4, 'Hard Games',    1000, 2000,  1034),
  ('ACH_PLAY_M4_L5', 'ราชา Hard',               'เล่น Hard 300 ครั้ง',      'diamond',  'play', 5, 4, 'Hard Games',    3000, 5000,  1035),

  -- M5: Expert Games (1 / 5 / 20 / 100 / 300)
  ('ACH_PLAY_M5_L1', 'กล้าลอง Expert',          'เล่น Expert 1 ครั้ง',      'bronze',   'play', 1, 5, 'Expert Games',    50,   100,  1041),
  ('ACH_PLAY_M5_L2', 'เริ่มชิน Expert',          'เล่น Expert 5 ครั้ง',      'silver',   'play', 2, 5, 'Expert Games',   150,   300,  1042),
  ('ACH_PLAY_M5_L3', 'ชำนาญ Expert',            'เล่น Expert 20 ครั้ง',     'gold',     'play', 3, 5, 'Expert Games',   400,   800,  1043),
  ('ACH_PLAY_M5_L4', 'เจ้า Expert',              'เล่น Expert 100 ครั้ง',    'platinum', 'play', 4, 5, 'Expert Games',  1000, 2000,  1044),
  ('ACH_PLAY_M5_L5', 'ราชา Expert',              'เล่น Expert 300 ครั้ง',    'diamond',  'play', 5, 5, 'Expert Games',  3000, 5000,  1045);

-- ============================================================
-- DAILY GROUP — 5 missions × 5 levels = 25 achievements
-- ============================================================
INSERT INTO achievements_definitions
  (id, name, description, tier, category, badge_level, badge_mission, mission_name, reward_coin, reward_xp, sort_order)
VALUES
  -- M1: Daily รวม (1 / 10 / 30 / 100 / 365)
  ('ACH_DAILY_M1_L1', 'ลองเล่น Daily',          'เล่น Daily puzzle ครั้งแรก',             'bronze',   'daily', 1, 1, 'Daily รวม',       50,   100,  2001),
  ('ACH_DAILY_M1_L2', 'เล่น Daily สม่ำเสมอ',   'เล่น Daily 10 วัน',                     'silver',   'daily', 2, 1, 'Daily รวม',      150,   300,  2002),
  ('ACH_DAILY_M1_L3', 'นักเล่น Daily',           'เล่น Daily 30 วัน',                     'gold',     'daily', 3, 1, 'Daily รวม',      400,   800,  2003),
  ('ACH_DAILY_M1_L4', 'เจ้า Daily',               'เล่น Daily 100 วัน',                    'platinum', 'daily', 4, 1, 'Daily รวม',     1000, 2000,  2004),
  ('ACH_DAILY_M1_L5', 'ราชา Daily',               'เล่น Daily 365 วัน',                    'diamond',  'daily', 5, 1, 'Daily รวม',     3000, 5000,  2005),

  -- M2: Daily Easy (1 / 5 / 20 / 50 / 200)
  ('ACH_DAILY_M2_L1', 'Daily ง่ายๆ',             'เล่น Daily Easy 1 ครั้ง',               'bronze',   'daily', 1, 2, 'Daily Easy',      50,   100,  2011),
  ('ACH_DAILY_M2_L2', 'คุ้นเคย Daily Easy',      'เล่น Daily Easy 5 ครั้ง',               'silver',   'daily', 2, 2, 'Daily Easy',     150,   300,  2012),
  ('ACH_DAILY_M2_L3', 'ชำนาญ Daily Easy',        'เล่น Daily Easy 20 ครั้ง',              'gold',     'daily', 3, 2, 'Daily Easy',     400,   800,  2013),
  ('ACH_DAILY_M2_L4', 'เจ้า Daily Easy',          'เล่น Daily Easy 50 ครั้ง',              'platinum', 'daily', 4, 2, 'Daily Easy',    1000, 2000,  2014),
  ('ACH_DAILY_M2_L5', 'ราชา Daily Easy',          'เล่น Daily Easy 200 ครั้ง',             'diamond',  'daily', 5, 2, 'Daily Easy',    3000, 5000,  2015),

  -- M3: Daily Hard — hard + hard-expert (1 / 5 / 20 / 50 / 200)
  ('ACH_DAILY_M3_L1', 'ท้า Daily Hard',           'เล่น Daily Hard 1 ครั้ง',               'bronze',   'daily', 1, 3, 'Daily Hard',      50,   100,  2021),
  ('ACH_DAILY_M3_L2', 'สู้ Daily Hard',            'เล่น Daily Hard 5 ครั้ง',               'silver',   'daily', 2, 3, 'Daily Hard',     150,   300,  2022),
  ('ACH_DAILY_M3_L3', 'ชำนาญ Daily Hard',         'เล่น Daily Hard 20 ครั้ง',              'gold',     'daily', 3, 3, 'Daily Hard',     400,   800,  2023),
  ('ACH_DAILY_M3_L4', 'เจ้า Daily Hard',           'เล่น Daily Hard 50 ครั้ง',              'platinum', 'daily', 4, 3, 'Daily Hard',    1000, 2000,  2024),
  ('ACH_DAILY_M3_L5', 'ราชา Daily Hard',           'เล่น Daily Hard 200 ครั้ง',             'diamond',  'daily', 5, 3, 'Daily Hard',    3000, 5000,  2025),

  -- M4: Daily ไม่ผิดเลย (1 / 5 / 20 / 50 / 100)
  ('ACH_DAILY_M4_L1', 'Daily ไม่พลาด',            'เล่น Daily โดยไม่ผิดเลย 1 ครั้ง',      'bronze',   'daily', 1, 4, 'Daily ไม่ผิดเลย', 100,  200,  2031),
  ('ACH_DAILY_M4_L2', 'Daily มือสะอาด',           'เล่น Daily โดยไม่ผิดเลย 5 ครั้ง',      'silver',   'daily', 2, 4, 'Daily ไม่ผิดเลย', 300,  600,  2032),
  ('ACH_DAILY_M4_L3', 'Daily นักแม่นยำ',          'เล่น Daily โดยไม่ผิดเลย 20 ครั้ง',     'gold',     'daily', 3, 4, 'Daily ไม่ผิดเลย', 800, 1500,  2033),
  ('ACH_DAILY_M4_L4', 'Daily เทพแม่นยำ',          'เล่น Daily โดยไม่ผิดเลย 50 ครั้ง',     'platinum', 'daily', 4, 4, 'Daily ไม่ผิดเลย', 2000, 4000, 2034),
  ('ACH_DAILY_M4_L5', 'ราชาไม่ผิด',               'เล่น Daily โดยไม่ผิดเลย 100 ครั้ง',    'diamond',  'daily', 5, 4, 'Daily ไม่ผิดเลย', 5000, 10000, 2035),

  -- M5: Daily ไม่ใช้ Hint (1 / 5 / 20 / 50 / 100)
  ('ACH_DAILY_M5_L1', 'Daily ไม่พึ่ง Hint',       'เล่น Daily โดยไม่ใช้ Hint 1 ครั้ง',    'bronze',   'daily', 1, 5, 'Daily ไม่ใช้ Hint', 100,  200, 2041),
  ('ACH_DAILY_M5_L2', 'Daily พึ่งตัวเอง',          'เล่น Daily โดยไม่ใช้ Hint 5 ครั้ง',    'silver',   'daily', 2, 5, 'Daily ไม่ใช้ Hint', 300,  600, 2042),
  ('ACH_DAILY_M5_L3', 'Daily สมองแล่น',            'เล่น Daily โดยไม่ใช้ Hint 20 ครั้ง',   'gold',     'daily', 3, 5, 'Daily ไม่ใช้ Hint', 800, 1500, 2043),
  ('ACH_DAILY_M5_L4', 'Daily เก่งโดยไม่พึ่ง',     'เล่น Daily โดยไม่ใช้ Hint 50 ครั้ง',   'platinum', 'daily', 4, 5, 'Daily ไม่ใช้ Hint', 2000, 4000, 2044),
  ('ACH_DAILY_M5_L5', 'ราชาไม่ใช้ Hint',           'เล่น Daily โดยไม่ใช้ Hint 100 ครั้ง',  'diamond',  'daily', 5, 5, 'Daily ไม่ใช้ Hint', 5000, 10000, 2045);

-- ============================================================
-- Updated check_and_grant_achievements with Play + Daily missions
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_grant_achievements(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_game_count       int := 0;
  v_daily_count      int := 0;
  v_perfect_count    int := 0;
  v_streak           int := 0;
  v_level            int := 1;
  v_coins            numeric := 0;
  v_themes_owned     int := 0;
  v_quest_count      int := 0;
  v_inventory_count  int := 0;
  v_distinct_days    int := 0;
  -- Play mission counters
  v_practice_count   int := 0;
  v_easy_count       int := 0;
  v_hard_count       int := 0;
  v_expert_count     int := 0;
  -- Daily mission counters
  v_daily_easy_count    int := 0;
  v_daily_hard_count    int := 0;
  v_daily_perfect_count int := 0;
  v_daily_nohint_count  int := 0;
  -- Speedster / pure
  v_easy_daily_best   int;
  v_medium_daily_best int;
  v_hard_best         int;
  v_hardexpert_best   int;
  v_expert_best       int;
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
  -- Base counts
  SELECT COUNT(*) INTO v_game_count    FROM user_game_history WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_daily_count   FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily';
  SELECT COUNT(*) INTO v_perfect_count FROM user_game_history WHERE user_id = p_user_id AND mistakes = 0;

  -- Play mission counts
  SELECT COUNT(*) INTO v_practice_count FROM user_game_history WHERE user_id = p_user_id AND mode = 'practice';
  SELECT COUNT(*) INTO v_easy_count     FROM user_game_history WHERE user_id = p_user_id AND level = 'easy'::difficulty_enum;
  SELECT COUNT(*) INTO v_hard_count     FROM user_game_history WHERE user_id = p_user_id AND level IN ('hard'::difficulty_enum, 'hard-expert'::difficulty_enum);
  SELECT COUNT(*) INTO v_expert_count   FROM user_game_history WHERE user_id = p_user_id AND level = 'expert'::difficulty_enum;

  -- Daily mission counts
  SELECT COUNT(*) INTO v_daily_easy_count    FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily' AND level = 'easy'::difficulty_enum;
  SELECT COUNT(*) INTO v_daily_hard_count    FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily' AND level IN ('hard'::difficulty_enum, 'hard-expert'::difficulty_enum);
  SELECT COUNT(*) INTO v_daily_perfect_count FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily' AND mistakes = 0;
  SELECT COUNT(*) INTO v_daily_nohint_count  FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily' AND hints_used = 0;

  SELECT COALESCE(current_streak, 0) INTO v_streak FROM user_progression WHERE user_id = p_user_id;
  SELECT COALESCE(level, 1)          INTO v_level  FROM user_progression WHERE user_id = p_user_id;
  SELECT COALESCE(coins, 0)          INTO v_coins  FROM user_wallet       WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_themes_owned    FROM user_inventory WHERE user_id = p_user_id AND item_id LIKE 'theme_%';
  SELECT COUNT(*) INTO v_inventory_count FROM user_inventory WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_quest_count     FROM user_daily_quests WHERE user_id = p_user_id AND claimed_at IS NOT NULL;
  SELECT COUNT(DISTINCT DATE(completed_at AT TIME ZONE 'Asia/Bangkok'))
    INTO v_distinct_days FROM user_game_history WHERE user_id = p_user_id;

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
      -- ── Play M1: เล่นเกมทั้งหมด ──────────────────────────────
      WHEN 'ACH_PLAY_M1_L1' THEN v_cond := v_game_count >= 1;
      WHEN 'ACH_PLAY_M1_L2' THEN v_cond := v_game_count >= 10;
      WHEN 'ACH_PLAY_M1_L3' THEN v_cond := v_game_count >= 50;
      WHEN 'ACH_PLAY_M1_L4' THEN v_cond := v_game_count >= 200;
      WHEN 'ACH_PLAY_M1_L5' THEN v_cond := v_game_count >= 500;
      -- ── Play M2: Practice ────────────────────────────────────
      WHEN 'ACH_PLAY_M2_L1' THEN v_cond := v_practice_count >= 1;
      WHEN 'ACH_PLAY_M2_L2' THEN v_cond := v_practice_count >= 10;
      WHEN 'ACH_PLAY_M2_L3' THEN v_cond := v_practice_count >= 50;
      WHEN 'ACH_PLAY_M2_L4' THEN v_cond := v_practice_count >= 200;
      WHEN 'ACH_PLAY_M2_L5' THEN v_cond := v_practice_count >= 500;
      -- ── Play M3: Easy ────────────────────────────────────────
      WHEN 'ACH_PLAY_M3_L1' THEN v_cond := v_easy_count >= 1;
      WHEN 'ACH_PLAY_M3_L2' THEN v_cond := v_easy_count >= 5;
      WHEN 'ACH_PLAY_M3_L3' THEN v_cond := v_easy_count >= 20;
      WHEN 'ACH_PLAY_M3_L4' THEN v_cond := v_easy_count >= 100;
      WHEN 'ACH_PLAY_M3_L5' THEN v_cond := v_easy_count >= 300;
      -- ── Play M4: Hard (hard + hard-expert) ──────────────────
      WHEN 'ACH_PLAY_M4_L1' THEN v_cond := v_hard_count >= 1;
      WHEN 'ACH_PLAY_M4_L2' THEN v_cond := v_hard_count >= 5;
      WHEN 'ACH_PLAY_M4_L3' THEN v_cond := v_hard_count >= 20;
      WHEN 'ACH_PLAY_M4_L4' THEN v_cond := v_hard_count >= 100;
      WHEN 'ACH_PLAY_M4_L5' THEN v_cond := v_hard_count >= 300;
      -- ── Play M5: Expert ──────────────────────────────────────
      WHEN 'ACH_PLAY_M5_L1' THEN v_cond := v_expert_count >= 1;
      WHEN 'ACH_PLAY_M5_L2' THEN v_cond := v_expert_count >= 5;
      WHEN 'ACH_PLAY_M5_L3' THEN v_cond := v_expert_count >= 20;
      WHEN 'ACH_PLAY_M5_L4' THEN v_cond := v_expert_count >= 100;
      WHEN 'ACH_PLAY_M5_L5' THEN v_cond := v_expert_count >= 300;
      -- ── Daily M1: Daily รวม ──────────────────────────────────
      WHEN 'ACH_DAILY_M1_L1' THEN v_cond := v_daily_count >= 1;
      WHEN 'ACH_DAILY_M1_L2' THEN v_cond := v_daily_count >= 10;
      WHEN 'ACH_DAILY_M1_L3' THEN v_cond := v_daily_count >= 30;
      WHEN 'ACH_DAILY_M1_L4' THEN v_cond := v_daily_count >= 100;
      WHEN 'ACH_DAILY_M1_L5' THEN v_cond := v_daily_count >= 365;
      -- ── Daily M2: Daily Easy ─────────────────────────────────
      WHEN 'ACH_DAILY_M2_L1' THEN v_cond := v_daily_easy_count >= 1;
      WHEN 'ACH_DAILY_M2_L2' THEN v_cond := v_daily_easy_count >= 5;
      WHEN 'ACH_DAILY_M2_L3' THEN v_cond := v_daily_easy_count >= 20;
      WHEN 'ACH_DAILY_M2_L4' THEN v_cond := v_daily_easy_count >= 50;
      WHEN 'ACH_DAILY_M2_L5' THEN v_cond := v_daily_easy_count >= 200;
      -- ── Daily M3: Daily Hard ─────────────────────────────────
      WHEN 'ACH_DAILY_M3_L1' THEN v_cond := v_daily_hard_count >= 1;
      WHEN 'ACH_DAILY_M3_L2' THEN v_cond := v_daily_hard_count >= 5;
      WHEN 'ACH_DAILY_M3_L3' THEN v_cond := v_daily_hard_count >= 20;
      WHEN 'ACH_DAILY_M3_L4' THEN v_cond := v_daily_hard_count >= 50;
      WHEN 'ACH_DAILY_M3_L5' THEN v_cond := v_daily_hard_count >= 200;
      -- ── Daily M4: ไม่ผิดเลย ─────────────────────────────────
      WHEN 'ACH_DAILY_M4_L1' THEN v_cond := v_daily_perfect_count >= 1;
      WHEN 'ACH_DAILY_M4_L2' THEN v_cond := v_daily_perfect_count >= 5;
      WHEN 'ACH_DAILY_M4_L3' THEN v_cond := v_daily_perfect_count >= 20;
      WHEN 'ACH_DAILY_M4_L4' THEN v_cond := v_daily_perfect_count >= 50;
      WHEN 'ACH_DAILY_M4_L5' THEN v_cond := v_daily_perfect_count >= 100;
      -- ── Daily M5: ไม่ใช้ Hint ───────────────────────────────
      WHEN 'ACH_DAILY_M5_L1' THEN v_cond := v_daily_nohint_count >= 1;
      WHEN 'ACH_DAILY_M5_L2' THEN v_cond := v_daily_nohint_count >= 5;
      WHEN 'ACH_DAILY_M5_L3' THEN v_cond := v_daily_nohint_count >= 20;
      WHEN 'ACH_DAILY_M5_L4' THEN v_cond := v_daily_nohint_count >= 50;
      WHEN 'ACH_DAILY_M5_L5' THEN v_cond := v_daily_nohint_count >= 100;
      -- ── Streak ───────────────────────────────────────────────
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
      -- ── Flawless ────────────────────────────────────────────
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
      -- ── Speedster ───────────────────────────────────────────
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
      -- ── Pure ────────────────────────────────────────────────
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
      -- ── Leaderboard ─────────────────────────────────────────
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
      -- ── Progression ─────────────────────────────────────────
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
      -- ── Quest ───────────────────────────────────────────────
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
      -- ── Special ─────────────────────────────────────────────
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

-- Backfill for users who already have game history
DO $$
DECLARE uid uuid;
BEGIN
  FOR uid IN SELECT DISTINCT user_id FROM user_game_history LOOP
    PERFORM check_and_grant_achievements(uid);
  END LOOP;
END $$;
