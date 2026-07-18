-- Weekly quest catalog felt sparse — only 1 candidate per tier meant every
-- user got the exact same 3 quests every single week, no variety at all.
-- Expand to 6 candidates per tier (18 total) and pick 5/week (2+2+1),
-- mirroring the daily quest catalog's proven shape exactly.

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
      (1,'w1_play10',     10, 150, 300, 'play_any',      NULL,        'Finish 10 games this week'),
      (1,'w1_daily5',     5,  150, 300, 'play_daily',    NULL,        'Complete 5 Daily Puzzles this week'),
      (1,'w1_practice10', 10, 150, 300, 'play_practice', NULL,        'Play 10 Practice games this week'),
      (1,'w1_easy10',     10, 150, 300, 'play_level',    'easy',      'Finish 10 Easy games this week'),
      (1,'w1_medium8',    8,  150, 300, 'play_level',    'medium',    'Finish 8 Medium games this week'),
      (1,'w1_fast_easy5', 5,  150, 300, 'win_fast',      'easy:300',  'Finish 5 Easy games under 5 min this week'),
      (2,'w2_nohint8',      8,  300, 600, 'win_no_hint',    NULL,          'Win 8 games without hints this week'),
      (2,'w2_nomistake8',   8,  300, 600, 'win_no_mistake', NULL,          'Win 8 games with no mistakes this week'),
      (2,'w2_hard5',        5,  300, 600, 'play_level',     'hard',        'Finish 5 Hard games this week'),
      (2,'w2_practice15',   15, 300, 600, 'play_practice',  NULL,          'Play 15 Practice games this week'),
      (2,'w2_daily7',       7,  300, 600, 'play_daily',     NULL,          'Complete all 7 Daily Puzzles this week'),
      (2,'w2_fast_medium5', 5,  300, 600, 'win_fast',       'medium:240',  'Finish 5 Medium games under 4 min this week'),
      (3,'w3_play25',          25, 700, 1400, 'play_any',       NULL,     'Finish 25 games this week'),
      (3,'w3_expert5',         5,  700, 1400, 'play_level',     'expert', 'Finish 5 Expert games this week'),
      (3,'w3_perfect_expert3', 3,  700, 1400, 'win_no_mistake', 'expert', 'Win 3 Expert games with no mistakes this week'),
      (3,'w3_hard10',          10, 700, 1400, 'play_level',     'hard',   'Finish 10 Hard games this week'),
      (3,'w3_nohint15',        15, 700, 1400, 'win_no_hint',    NULL,     'Win 15 games without hints this week'),
      (3,'w3_nomistake15',     15, 700, 1400, 'win_no_mistake', NULL,     'Win 15 games with no mistakes this week')
    ) AS cat(tier, quest_id, target, reward_coin, reward_xp, trigger_type, trigger_param, description)
  ) c
  WHERE (c.tier IN (1,2) AND c.rn <= 2) OR (c.tier = 3 AND c.rn <= 1)
  ON CONFLICT (user_id, week_start, quest_id) DO NOTHING;
END;
$function$;
