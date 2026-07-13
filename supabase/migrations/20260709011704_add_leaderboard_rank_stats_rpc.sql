-- Backfill: applied directly via Supabase MCP without a matching local file.
-- Reconstructed from the live function definition.
CREATE OR REPLACE FUNCTION public.get_leaderboard_rank_stats(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH ranked AS (
    SELECT RANK() OVER (PARTITION BY date ORDER BY score DESC, time_seconds ASC) AS rnk
    FROM daily_leaderboard WHERE user_id = p_user_id
  )
  SELECT jsonb_build_object(
    'top100', COALESCE(COUNT(*) FILTER (WHERE rnk <= 100), 0),
    'top50',  COALESCE(COUNT(*) FILTER (WHERE rnk <= 50), 0),
    'top10',  COALESCE(COUNT(*) FILTER (WHERE rnk <= 10), 0),
    'top3',   COALESCE(COUNT(*) FILTER (WHERE rnk <= 3), 0),
    'top1',   COALESCE(COUNT(*) FILTER (WHERE rnk = 1), 0)
  )
  FROM ranked;
$function$;
