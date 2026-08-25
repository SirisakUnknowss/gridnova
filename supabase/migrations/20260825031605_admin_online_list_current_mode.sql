-- Surface what mode each online session is currently playing, derived from
-- session_views (see logView() in src/lib/api.ts, called on every in-app
-- navigation with values like 'game_daily' / 'game_practice' / 'home' / …).
-- The admin panel maps this raw view string to a friendly mode label.
CREATE OR REPLACE FUNCTION public.get_admin_online_list()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security: admin only
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  -- Clean stale sessions first
  DELETE FROM online_sessions WHERE last_seen < now() - interval '2 minutes';

  RETURN (
    SELECT json_agg(t ORDER BY t.last_seen DESC)
    FROM (
      SELECT
        os.session_id,
        os.is_guest,
        os.last_seen,
        CASE
          WHEN os.is_guest = false THEN COALESCE(p.display_name, p.username, 'Member')
          ELSE NULL
        END AS display_name,
        CASE
          WHEN os.is_guest = false THEN p.username
          ELSE NULL
        END AS username,
        sv.view AS current_view
      FROM online_sessions os
      LEFT JOIN profiles p ON p.id = os.user_id AND os.is_guest = false
      LEFT JOIN LATERAL (
        SELECT view FROM session_views
        WHERE session_views.session_id = os.session_id
        ORDER BY created_at DESC
        LIMIT 1
      ) sv ON true
    ) t
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_admin_online_list() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_online_list() TO authenticated;
