-- Time Attack: how many players are on a tier's board.
--
-- submit-time-attack-score returned a rank with no denominator, so the win
-- modal rendered "Rank #2 / undefined".
--
-- Counts DISTINCT user_id, not rows: time_attack_leaderboard keeps every run,
-- while get_time_attack_leaderboard collapses them with DISTINCT ON (user_id).
-- A row count would inflate the denominator by however many times people
-- replayed the tier, which is exactly the population that replays most.

CREATE OR REPLACE FUNCTION public.get_time_attack_player_count(p_tier text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(DISTINCT l.user_id)::integer
    FROM time_attack_leaderboard l
   WHERE l.tier = p_tier;
$$;

GRANT EXECUTE ON FUNCTION public.get_time_attack_player_count(text) TO anon, authenticated;
