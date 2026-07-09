-- Random Mode: win-streak tracking (per docs/01-game-design/play-mode-hub.md)
CREATE TABLE random_mode_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_win_streak INTEGER NOT NULL DEFAULT 0,
  longest_win_streak INTEGER NOT NULL DEFAULT 0,
  total_played INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE random_mode_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own random mode stats"
  ON random_mode_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own random mode stats via service"
  ON random_mode_stats FOR ALL
  USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION record_random_mode_result(p_user_id uuid, p_won boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current int;
  v_longest int;
  v_total int;
BEGIN
  INSERT INTO random_mode_stats (user_id, current_win_streak, longest_win_streak, total_played, updated_at)
  VALUES (p_user_id, CASE WHEN p_won THEN 1 ELSE 0 END, CASE WHEN p_won THEN 1 ELSE 0 END, 1, now())
  ON CONFLICT (user_id) DO UPDATE SET
    current_win_streak = CASE WHEN p_won THEN random_mode_stats.current_win_streak + 1 ELSE 0 END,
    longest_win_streak  = GREATEST(random_mode_stats.longest_win_streak, CASE WHEN p_won THEN random_mode_stats.current_win_streak + 1 ELSE 0 END),
    total_played        = random_mode_stats.total_played + 1,
    updated_at          = now()
  RETURNING current_win_streak, longest_win_streak, total_played
  INTO v_current, v_longest, v_total;

  RETURN jsonb_build_object(
    'current_win_streak', v_current,
    'longest_win_streak', v_longest,
    'total_played', v_total
  );
END;
$function$;

CREATE OR REPLACE FUNCTION get_random_mode_leaderboard(p_limit int DEFAULT 50)
RETURNS TABLE (user_id uuid, display_name text, avatar_url text, longest_win_streak int, current_win_streak int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT r.user_id, p.display_name, p.avatar_url, r.longest_win_streak, r.current_win_streak
  FROM random_mode_stats r
  JOIN profiles p ON p.id = r.user_id
  ORDER BY r.longest_win_streak DESC, r.current_win_streak DESC
  LIMIT p_limit;
$$;
