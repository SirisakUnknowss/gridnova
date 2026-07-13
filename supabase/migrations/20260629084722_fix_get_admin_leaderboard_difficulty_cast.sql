-- Backfill: applied directly via Supabase MCP without a matching local file.
-- Final version of get_admin_leaderboard after the auth-check / param-type /
-- difficulty-cast fix chain (20260629074522 → 20260629082021 → 20260629083304
-- → this migration). Reconstructed from the live function definition.
CREATE OR REPLACE FUNCTION public.get_admin_leaderboard(p_date text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_date       date := p_date::date;
  v_difficulty text;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT difficulty::text INTO v_difficulty FROM daily_puzzles WHERE date = v_date LIMIT 1;
  v_difficulty := COALESCE(v_difficulty, 'unknown');

  RETURN (
    SELECT jsonb_build_object(
      'date',       v_date,
      'difficulty', v_difficulty,
      'rows', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'score',        dl.score,
            'time_seconds', dl.time_seconds,
            'mistakes',     dl.mistakes,
            'hints_used',   dl.hints_used,
            'submitted_at', dl.submitted_at,
            'display_name', p.display_name,
            'username',     p.username
          )
          ORDER BY dl.score DESC, dl.time_seconds ASC
        )
        FROM daily_leaderboard dl
        LEFT JOIN profiles p ON p.id = dl.user_id
        WHERE dl.date = v_date
      ), '[]'::jsonb)
    )
  );
END;
$function$;
