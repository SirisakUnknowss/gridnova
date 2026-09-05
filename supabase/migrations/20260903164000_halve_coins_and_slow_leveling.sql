-- =====================================================================
-- Halve coin rewards across the entire system and slow down leveling
-- =====================================================================

-- 1. Halve achievement rewards
UPDATE achievements_definitions SET reward_coin = GREATEST(1, reward_coin / 2);

-- 2. Halve existing uncompleted daily/weekly quest rewards
UPDATE user_daily_quests SET reward_coin = GREATEST(1, reward_coin / 2) WHERE completed_at IS NULL;
UPDATE user_weekly_quests SET reward_coin = GREATEST(1, reward_coin / 2) WHERE completed_at IS NULL;

-- 3. Update seed_daily_quests with halved rewards
CREATE OR REPLACE FUNCTION seed_daily_quests(p_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM user_daily_quests WHERE user_id = v_user_id AND date = p_date) THEN
    RETURN;
  END IF;

  INSERT INTO user_daily_quests
    (user_id, date, quest_id, tier, target, reward_coin, reward_xp,
     trigger_type, trigger_param, description, progress, completed_at)
  SELECT
    v_user_id, p_date, c.quest_id, c.tier, c.target, c.reward_coin, c.reward_xp,
    c.trigger_type, c.trigger_param, c.description,
    CASE WHEN c.trigger_type = 'login' THEN c.target ELSE 0 END,
    CASE WHEN c.trigger_type = 'login' THEN now() ELSE NULL END
  FROM (
    SELECT
      tier::int AS tier, quest_id::text AS quest_id, target::int AS target,
      reward_coin::int AS reward_coin, reward_xp::int AS reward_xp,
      trigger_type::text AS trigger_type, trigger_param::text AS trigger_param,
      description::text AS description,
      row_number() OVER (PARTITION BY tier ORDER BY md5(v_user_id::text || p_date::text || quest_id)) AS rn
    FROM (VALUES
      -- tier, quest_id, target, coin, xp, trigger_type, trigger_param, description
      (1,'t1_daily',     1, 7,  10, 'play_daily',      NULL,        'Play today''s Daily Puzzle'),
      (1,'t1_login',     1, 2,  10, 'login',           NULL,        'Open the app today'),
      (1,'t1_play_any',  1, 5,  10, 'play_any',        NULL,        'Finish any game'),
      (1,'t1_easy',      1, 5,  10, 'play_level',      'easy',      'Finish an Easy game'),
      (1,'t1_practice',  1, 5,  10, 'play_practice',   NULL,        'Play a Practice game'),
      (1,'t1_medium',    1, 5,  10, 'play_level',      'medium',    'Finish a Medium game'),
      (2,'t2_play3',     3, 12, 30, 'play_any',        NULL,        'Finish 3 games'),
      (2,'t2_easy2',     2, 10, 20, 'play_level',      'easy',      'Finish 2 Easy games'),
      (2,'t2_nohint',    1, 15, 30, 'win_no_hint',     NULL,        'Finish a game without using hints'),
      (2,'t2_nomistake', 1, 12, 30, 'win_no_mistake',  NULL,        'Finish a game with no mistakes'),
      (2,'t2_fast_easy', 1, 12, 30, 'win_fast',        'easy:300',  'Finish an Easy game under 5 min'),
      (2,'t2_practice3', 3, 10, 30, 'play_practice',   NULL,        'Play 3 Practice games'),
      (3,'t3_hard',          1, 27,  70,  'play_level',     'hard',      'Finish a Hard game'),
      (3,'t3_expert',        1, 37,  120, 'play_level',     'expert',    'Finish an Expert game'),
      (3,'t3_perfect_expert',1, 45,  130, 'win_no_mistake', 'expert',    'Finish an Expert game with no mistakes'),
      (3,'t3_fast_medium',   1, 22,  50,  'win_fast',       'medium:240','Finish a Medium game under 4 min'),
      (3,'t3_top500',        1, 30,  60,  'leaderboard_rank','500',      'Reach Daily Leaderboard top 500'),
      (3,'t3_top100',        1, 60, 120, 'leaderboard_rank','100',      'Reach Daily Leaderboard top 100'),
      (3,'t3_play5',         5, 30,  70,  'play_any',       NULL,        'Finish 5 games today')
    ) AS cat(tier, quest_id, target, reward_coin, reward_xp, trigger_type, trigger_param, description)
  ) c
  WHERE (c.tier IN (1,2) AND c.rn <= 2) OR (c.tier = 3 AND c.rn <= 1)
  ON CONFLICT (user_id, date, quest_id) DO NOTHING;
END;
$function$;

-- 4. Update seed_weekly_quests with halved rewards
CREATE OR REPLACE FUNCTION seed_weekly_quests(p_week_start date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM user_weekly_quests WHERE user_id = v_user_id AND week_start = p_week_start) THEN
    RETURN;
  END IF;

  INSERT INTO user_weekly_quests
    (user_id, week_start, quest_id, tier, target, reward_coin, reward_xp,
     trigger_type, trigger_param, description, progress, completed_at)
  SELECT
    v_user_id, p_week_start, c.quest_id, c.tier, c.target, c.reward_coin, c.reward_xp,
    c.trigger_type, c.trigger_param, c.description, 0, NULL
  FROM (
    SELECT
      tier::int AS tier, quest_id::text AS quest_id, target::int AS target,
      reward_coin::int AS reward_coin, reward_xp::int AS reward_xp,
      trigger_type::text AS trigger_type, trigger_param::text AS trigger_param,
      description::text AS description,
      row_number() OVER (PARTITION BY tier ORDER BY md5(v_user_id::text || p_week_start::text || quest_id)) AS rn
    FROM (VALUES
      -- tier, quest_id, target, coin, xp, trigger_type, trigger_param, description
      (1,'w1_play10',     10, 22, 90, 'play_any',      NULL,        'Finish 10 games this week'),
      (1,'w1_daily5',     5,  22, 90, 'play_daily',    NULL,        'Complete 5 Daily Puzzles this week'),
      (1,'w1_practice10', 10, 22, 90, 'play_practice', NULL,        'Play 10 Practice games this week'),
      (1,'w1_easy10',     10, 22, 90, 'play_level',    'easy',      'Finish 10 Easy games this week'),
      (1,'w1_medium8',    8,  22, 90, 'play_level',    'medium',    'Finish 8 Medium games this week'),
      (1,'w1_fast_easy5', 5,  22, 90, 'win_fast',      'easy:300',  'Finish 5 Easy games under 5 min this week'),
      (2,'w2_nohint8',      8,  45, 180, 'win_no_hint',    NULL,          'Win 8 games without hints this week'),
      (2,'w2_nomistake8',   8,  45, 180, 'win_no_mistake', NULL,          'Win 8 games with no mistakes this week'),
      (2,'w2_hard5',        5,  45, 180, 'play_level',     'hard',        'Finish 5 Hard games this week'),
      (2,'w2_practice15',   15, 45, 180, 'play_practice',  NULL,          'Play 15 Practice games this week'),
      (2,'w2_daily7',       7,  45, 180, 'play_daily',     NULL,          'Complete all 7 Daily Puzzles this week'),
      (2,'w2_fast_medium5', 5,  45, 180, 'win_fast',       'medium:240',  'Finish 5 Medium games under 4 min this week'),
      (3,'w3_play25',          25, 102, 410, 'play_any',       NULL,     'Finish 25 games this week'),
      (3,'w3_expert5',         5,  102, 410, 'play_level',     'expert', 'Finish 5 Expert games this week'),
      (3,'w3_perfect_expert3', 3,  102, 410, 'win_no_mistake', 'expert', 'Win 3 Expert games with no mistakes this week'),
      (3,'w3_hard10',          10, 102, 410, 'play_level',     'hard',   'Finish 10 Hard games this week'),
      (3,'w3_nohint15',        15, 102, 410, 'win_no_hint',    NULL,     'Win 15 games without hints this week'),
      (3,'w3_nomistake15',     15, 102, 410, 'win_no_mistake', NULL,     'Win 15 games with no mistakes this week')
    ) AS cat(tier, quest_id, target, reward_coin, reward_xp, trigger_type, trigger_param, description)
  ) c
  WHERE (c.tier IN (1,2) AND c.rn <= 2) OR (c.tier = 3 AND c.rn <= 1)
  ON CONFLICT (user_id, week_start, quest_id) DO NOTHING;
END;
$function$;

-- 5. Slow down level curve: xpForLevel(L) = floor(100 * L^1.5)
CREATE OR REPLACE FUNCTION public.grant_xp(p_user_id uuid, p_amount integer)
 RETURNS TABLE(new_xp bigint, new_level integer, leveled_up boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_xp BIGINT;
  v_level INTEGER;
  v_old_level INTEGER;
  v_xp_for_level INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT xp, level INTO v_xp, v_old_level FROM user_progression WHERE user_id = p_user_id;
  IF v_xp IS NULL THEN
    RAISE EXCEPTION 'progression not found for user';
  END IF;
  v_xp := v_xp + p_amount;
  v_level := v_old_level;
  LOOP
    IF v_level >= 100 THEN EXIT; END IF;
    v_xp_for_level := floor(100 * power(v_level, 1.5));
    IF v_xp < v_xp_for_level THEN EXIT; END IF;
    v_xp := v_xp - v_xp_for_level;
    v_level := v_level + 1;
  END LOOP;
  UPDATE user_progression
  SET xp = v_xp, level = v_level, updated_at = now()
  WHERE user_id = p_user_id;
  RETURN QUERY SELECT v_xp, v_level, v_level > v_old_level;
END;
$function$;
