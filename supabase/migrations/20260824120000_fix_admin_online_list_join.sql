-- Fix get_admin_online_list(): join profiles on os.user_id, not os.session_id.
-- session_id is a client-generated UUID (localStorage, see getSessionId() in
-- src/lib/api.ts) unrelated to the account id. user_id is the actual auth uid,
-- populated by heartbeat() when is_guest is false. The old join always missed,
-- so every online member showed up as "Member" / "—" in the admin panel.
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
        END AS username
      FROM online_sessions os
      LEFT JOIN profiles p ON p.id = os.user_id AND os.is_guest = false
    ) t
  );
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_admin_online_list() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_online_list() TO authenticated;
