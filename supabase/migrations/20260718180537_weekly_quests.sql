-- Weekly quests — same generic trigger-engine pattern as daily quests
-- (see 20260713093029_dynamic_daily_quests.sql), keyed by week_start
-- (Monday, UTC) instead of date, with bigger multi-day targets to give
-- players a reason to keep playing Practice/Random after Daily+Daily
-- Quests are done for the day.

CREATE TABLE IF NOT EXISTS user_weekly_quests (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  quest_id TEXT NOT NULL,
  tier INTEGER NOT NULL,
  target INTEGER NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  reward_coin INTEGER NOT NULL,
  reward_xp INTEGER NOT NULL DEFAULT 0,
  trigger_type TEXT,
  trigger_param TEXT,
  description TEXT,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, week_start, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_weekly_quests_user_week ON user_weekly_quests(user_id, week_start);

ALTER TABLE user_weekly_quests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own weekly quests" ON user_weekly_quests;
CREATE POLICY "Users view own weekly quests"
  ON user_weekly_quests FOR SELECT USING (auth.uid() = user_id);

-- =====================================================================
-- Seed: pick 1 quest per tier (3 tiers), deterministic per (user, week)
-- =====================================================================
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
      (1,'w1_play10',    10, 150, 300, 'play_any',      NULL,   'Finish 10 games this week'),
      (1,'w1_daily5',    5,  150, 300, 'play_daily',    NULL,   'Complete 5 Daily Puzzles this week'),
      (1,'w1_practice10',10, 150, 300, 'play_practice', NULL,   'Play 10 Practice games this week'),
      (2,'w2_nohint8',      8, 300, 600, 'win_no_hint',    NULL,   'Win 8 games without hints this week'),
      (2,'w2_nomistake8',   8, 300, 600, 'win_no_mistake', NULL,   'Win 8 games with no mistakes this week'),
      (2,'w2_hard5',        5, 300, 600, 'play_level',     'hard', 'Finish 5 Hard games this week'),
      (3,'w3_play25',          25, 700, 1400, 'play_any',       NULL,     'Finish 25 games this week'),
      (3,'w3_expert5',         5,  700, 1400, 'play_level',     'expert', 'Finish 5 Expert games this week'),
      (3,'w3_perfect_expert3', 3,  700, 1400, 'win_no_mistake', 'expert', 'Win 3 Expert games with no mistakes this week')
    ) AS cat(tier, quest_id, target, reward_coin, reward_xp, trigger_type, trigger_param, description)
  ) c
  WHERE c.rn <= 1
  ON CONFLICT (user_id, week_start, quest_id) DO NOTHING;
END;
$function$;

-- =====================================================================
-- Generic progress engine — same trigger vocabulary as daily quests,
-- widened to count across the whole week instead of a single date.
-- =====================================================================
CREATE OR REPLACE FUNCTION recompute_weekly_quests(p_user_id uuid, p_week_start date)
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
  v_week_end date := p_week_start + 6;
BEGIN
  FOR q IN
    SELECT * FROM user_weekly_quests
    WHERE user_id = p_user_id AND week_start = p_week_start AND claimed_at IS NULL
  LOOP
    v_progress := q.progress;

    IF q.trigger_type = 'play_any' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date BETWEEN p_week_start AND v_week_end;

    ELSIF q.trigger_type = 'play_daily' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND mode = 'daily'
          AND (completed_at AT TIME ZONE 'UTC')::date BETWEEN p_week_start AND v_week_end;

    ELSIF q.trigger_type = 'play_practice' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND mode = 'practice'
          AND (completed_at AT TIME ZONE 'UTC')::date BETWEEN p_week_start AND v_week_end;

    ELSIF q.trigger_type = 'play_level' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date BETWEEN p_week_start AND v_week_end
          AND level = q.trigger_param::difficulty_enum;

    ELSIF q.trigger_type = 'win_no_hint' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date BETWEEN p_week_start AND v_week_end
          AND hints_used = 0
          AND (q.trigger_param IS NULL OR level = q.trigger_param::difficulty_enum);

    ELSIF q.trigger_type = 'win_no_mistake' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date BETWEEN p_week_start AND v_week_end
          AND mistakes = 0
          AND (q.trigger_param IS NULL OR level = q.trigger_param::difficulty_enum);

    ELSIF q.trigger_type = 'win_fast' THEN
      v_level := split_part(q.trigger_param, ':', 1);
      v_secs  := split_part(q.trigger_param, ':', 2)::int;
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date BETWEEN p_week_start AND v_week_end
          AND time_seconds <= v_secs
          AND (v_level = '' OR level = v_level::difficulty_enum);

    ELSE
      CONTINUE; -- unknown / null trigger_type: leave untouched
    END IF;

    v_progress := LEAST(v_progress, q.target);

    UPDATE user_weekly_quests
    SET progress = v_progress,
        completed_at = COALESCE(completed_at, CASE WHEN v_progress >= q.target THEN now() END)
    WHERE user_id = p_user_id AND week_start = p_week_start AND quest_id = q.quest_id AND claimed_at IS NULL;
  END LOOP;
END;
$function$;

GRANT EXECUTE ON FUNCTION recompute_weekly_quests(uuid, date) TO service_role;
