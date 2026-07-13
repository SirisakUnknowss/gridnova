-- Dynamic daily quests: rotate from a catalog per (user, date), with a
-- generic progress engine driven by trigger_type stored on each row.
-- Idempotent: safe to re-run.

ALTER TABLE user_daily_quests ADD COLUMN IF NOT EXISTS trigger_type  text;
ALTER TABLE user_daily_quests ADD COLUMN IF NOT EXISTS trigger_param text;
ALTER TABLE user_daily_quests ADD COLUMN IF NOT EXISTS description   text;

-- Backfill any legacy rows so the new generic engine can drive them too.
UPDATE user_daily_quests SET
  trigger_type = CASE quest_id
    WHEN 'daily_complete'  THEN 'play_daily'
    WHEN 'no_mistakes'     THEN 'win_no_mistake'
    WHEN 'no_hints'        THEN 'win_no_hint'
    WHEN 'fast_finish'     THEN 'win_fast'
    WHEN 'practice_streak' THEN 'play_practice'
  END,
  trigger_param = CASE quest_id WHEN 'fast_finish' THEN ':480' ELSE NULL END,
  description = CASE quest_id
    WHEN 'daily_complete'  THEN 'Play today''s Daily Puzzle'
    WHEN 'no_mistakes'     THEN 'Finish with no mistakes'
    WHEN 'no_hints'        THEN 'Finish without using hints'
    WHEN 'fast_finish'     THEN 'Finish under the target time'
    WHEN 'practice_streak' THEN 'Complete 3 Practice games'
  END
WHERE quest_id IN ('daily_complete','no_mistakes','no_hints','fast_finish','practice_streak')
  AND trigger_type IS NULL;

-- =====================================================================
-- Seed: pick 2 quests per tier, deterministic per (user, date)
-- =====================================================================
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
  WHERE c.rn <= 2
  ON CONFLICT (user_id, date, quest_id) DO NOTHING;
END;
$function$;

-- =====================================================================
-- Generic progress engine — recompute all of a user's quests for a date
-- from their game history + daily leaderboard standing.
-- =====================================================================
CREATE OR REPLACE FUNCTION recompute_daily_quests(p_user_id uuid, p_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  q record;
  v_progress int;
  v_level text;
  v_secs int;
  v_rank int;
  v_my_score int;
  v_my_time int;
BEGIN
  FOR q IN
    SELECT * FROM user_daily_quests
    WHERE user_id = p_user_id AND date = p_date AND claimed_at IS NULL
  LOOP
    v_progress := q.progress;

    IF q.trigger_type = 'login' THEN
      v_progress := q.target;

    ELSIF q.trigger_type = 'play_any' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date = p_date;

    ELSIF q.trigger_type = 'play_daily' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND mode = 'daily' AND (completed_at AT TIME ZONE 'UTC')::date = p_date;

    ELSIF q.trigger_type = 'play_practice' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND mode = 'practice' AND (completed_at AT TIME ZONE 'UTC')::date = p_date;

    ELSIF q.trigger_type = 'play_level' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date = p_date
          AND level = q.trigger_param::difficulty_enum;

    ELSIF q.trigger_type = 'win_no_hint' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date = p_date
          AND hints_used = 0
          AND (q.trigger_param IS NULL OR level = q.trigger_param::difficulty_enum);

    ELSIF q.trigger_type = 'win_no_mistake' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date = p_date
          AND mistakes = 0
          AND (q.trigger_param IS NULL OR level = q.trigger_param::difficulty_enum);

    ELSIF q.trigger_type = 'win_fast' THEN
      v_level := split_part(q.trigger_param, ':', 1);
      v_secs  := split_part(q.trigger_param, ':', 2)::int;
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date = p_date
          AND time_seconds <= v_secs
          AND (v_level = '' OR level = v_level::difficulty_enum);

    ELSIF q.trigger_type = 'leaderboard_rank' THEN
      SELECT score, time_seconds INTO v_my_score, v_my_time
        FROM daily_leaderboard WHERE user_id = p_user_id AND date = p_date LIMIT 1;
      IF v_my_score IS NULL THEN
        v_progress := 0;
      ELSE
        SELECT 1 + count(*) INTO v_rank FROM daily_leaderboard o
          WHERE o.date = p_date
            AND (o.score > v_my_score OR (o.score = v_my_score AND o.time_seconds < v_my_time));
        v_progress := CASE WHEN v_rank <= q.trigger_param::int THEN q.target ELSE 0 END;
      END IF;

    ELSE
      CONTINUE; -- unknown / null trigger_type: leave untouched
    END IF;

    v_progress := LEAST(v_progress, q.target);

    UPDATE user_daily_quests
    SET progress = v_progress,
        completed_at = COALESCE(completed_at, CASE WHEN v_progress >= q.target THEN now() END)
    WHERE user_id = p_user_id AND date = p_date AND quest_id = q.quest_id AND claimed_at IS NULL;
  END LOOP;
END;
$function$;

GRANT EXECUTE ON FUNCTION recompute_daily_quests(uuid, date) TO service_role;
