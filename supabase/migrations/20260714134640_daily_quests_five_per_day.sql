-- Reduce daily quest count from 6 (2 per tier x3) to 5: keep tier 1 & 2 at
-- 2 picks each, cap tier 3 (hardest) to 1 pick.
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
      (1,'t1_daily',     1, 50, 20, 'play_daily',      NULL,        'Play today''s Daily Puzzle'),
      (1,'t1_login',     1, 20, 10, 'login',           NULL,        'Open the app today'),
      (1,'t1_play_any',  1, 30, 15, 'play_any',        NULL,        'Finish any game'),
      (1,'t1_easy',      1, 30, 15, 'play_level',      'easy',      'Finish an Easy game'),
      (1,'t1_practice',  1, 30, 15, 'play_practice',   NULL,        'Play a Practice game'),
      (1,'t1_medium',    1, 40, 25, 'play_level',      'medium',    'Finish a Medium game'),
      (2,'t2_play3',     3, 80, 100,'play_any',        NULL,        'Finish 3 games'),
      (2,'t2_easy2',     2, 60, 80, 'play_level',      'easy',      'Finish 2 Easy games'),
      (2,'t2_nohint',    1, 100,100,'win_no_hint',     NULL,        'Finish a game without using hints'),
      (2,'t2_nomistake', 1, 90, 90, 'win_no_mistake',  NULL,        'Finish a game with no mistakes'),
      (2,'t2_fast_easy', 1, 80, 100,'win_fast',        'easy:300',  'Finish an Easy game under 5 min'),
      (2,'t2_practice3', 3, 70, 90, 'play_practice',   NULL,        'Play 3 Practice games'),
      (3,'t3_hard',          1, 180,250,'play_level',     'hard',      'Finish a Hard game'),
      (3,'t3_expert',        1, 250,400,'play_level',     'expert',    'Finish an Expert game'),
      (3,'t3_perfect_expert',1, 300,450,'win_no_mistake', 'expert',    'Finish an Expert game with no mistakes'),
      (3,'t3_fast_medium',   1, 150,180,'win_fast',       'medium:240','Finish a Medium game under 4 min'),
      (3,'t3_top500',        1, 200,200,'leaderboard_rank','500',      'Reach Daily Leaderboard top 500'),
      (3,'t3_top100',        1, 400,400,'leaderboard_rank','100',      'Reach Daily Leaderboard top 100'),
      (3,'t3_play5',         5, 200,250,'play_any',       NULL,        'Finish 5 games today')
    ) AS cat(tier, quest_id, target, reward_coin, reward_xp, trigger_type, trigger_param, description)
  ) c
  WHERE (c.tier IN (1,2) AND c.rn <= 2) OR (c.tier = 3 AND c.rn <= 1)
  ON CONFLICT (user_id, date, quest_id) DO NOTHING;
END;
$function$;
