-- Level-specific quest triggers (play_level, win_fast, and win_no_hint/
-- win_no_mistake when scoped to a difficulty) only checked
-- user_game_history.level, never mode. Daily Puzzle's difficulty rotates
-- day to day and is recorded with the same level column, so e.g. "Finish
-- an Easy game under 5 min" (win_fast, 'easy:300') was silently satisfied
-- by playing that day's Daily Puzzle if it happened to be Easy and fast —
-- nothing to do with the deliberate Practice-mode challenge the quest
-- describes. Restrict these to mode = 'practice'. Triggers without a
-- difficulty param (plain win_no_hint/win_no_mistake) are untouched —
-- those are legitimately mode-agnostic.

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
          AND mode = 'practice'
          AND level = q.trigger_param::difficulty_enum;

    ELSIF q.trigger_type = 'win_no_hint' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date = p_date
          AND hints_used = 0
          AND (q.trigger_param IS NULL OR (mode = 'practice' AND level = q.trigger_param::difficulty_enum));

    ELSIF q.trigger_type = 'win_no_mistake' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date = p_date
          AND mistakes = 0
          AND (q.trigger_param IS NULL OR (mode = 'practice' AND level = q.trigger_param::difficulty_enum));

    ELSIF q.trigger_type = 'win_fast' THEN
      v_level := split_part(q.trigger_param, ':', 1);
      v_secs  := split_part(q.trigger_param, ':', 2)::int;
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date = p_date
          AND time_seconds <= v_secs
          AND (v_level = '' OR (mode = 'practice' AND level = v_level::difficulty_enum));

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
          AND mode = 'practice'
          AND level = q.trigger_param::difficulty_enum;

    ELSIF q.trigger_type = 'win_no_hint' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date BETWEEN p_week_start AND v_week_end
          AND hints_used = 0
          AND (q.trigger_param IS NULL OR (mode = 'practice' AND level = q.trigger_param::difficulty_enum));

    ELSIF q.trigger_type = 'win_no_mistake' THEN
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date BETWEEN p_week_start AND v_week_end
          AND mistakes = 0
          AND (q.trigger_param IS NULL OR (mode = 'practice' AND level = q.trigger_param::difficulty_enum));

    ELSIF q.trigger_type = 'win_fast' THEN
      v_level := split_part(q.trigger_param, ':', 1);
      v_secs  := split_part(q.trigger_param, ':', 2)::int;
      SELECT count(*) INTO v_progress FROM user_game_history
        WHERE user_id = p_user_id AND (completed_at AT TIME ZONE 'UTC')::date BETWEEN p_week_start AND v_week_end
          AND time_seconds <= v_secs
          AND (v_level = '' OR (mode = 'practice' AND level = v_level::difficulty_enum));

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
