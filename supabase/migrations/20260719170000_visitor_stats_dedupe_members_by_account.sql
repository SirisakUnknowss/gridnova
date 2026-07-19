-- "Members online today" was counting rows in visitor_sessions, which is
-- keyed by session_id (one per browser/device, from localStorage) — it had
-- no user_id at all. One member opening the app from 3 different browsers/
-- devices/incognito windows in a day showed up as 3 "members" instead of 1.
-- Guests still count per-session since they have no account to dedupe by.

ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

CREATE OR REPLACE FUNCTION public.get_visitor_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_online          BIGINT;
  v_online_guests   BIGINT;
  v_online_members  BIGINT;

  v_today           BIGINT;
  v_today_guests    BIGINT;
  v_today_members   BIGINT;

  v_week            BIGINT;
  v_total           BIGINT;
BEGIN
  -- Clean up stale online sessions (> 2 minutes)
  DELETE FROM online_sessions WHERE last_seen < now() - interval '2 minutes';

  -- Online counts: members deduped by user_id (same account, multiple
  -- devices = 1), guests deduped by session_id (no account to dedupe by).
  SELECT COUNT(*) FILTER (WHERE is_guest = true) + COUNT(DISTINCT user_id) FILTER (WHERE is_guest = false),
         COUNT(*) FILTER (WHERE is_guest = true),
         COUNT(DISTINCT user_id) FILTER (WHERE is_guest = false)
    INTO v_online, v_online_guests, v_online_members
    FROM online_sessions;

  -- Today's counts: same dedupe logic, from visitor_sessions.
  SELECT COUNT(*) FILTER (WHERE is_guest = true) + COUNT(DISTINCT user_id) FILTER (WHERE is_guest = false),
         COUNT(*) FILTER (WHERE is_guest = true),
         COUNT(DISTINCT user_id) FILTER (WHERE is_guest = false)
    INTO v_today, v_today_guests, v_today_members
    FROM visitor_sessions
   WHERE visited_date = CURRENT_DATE;

  -- Calculate last 7 days unique sessions
  SELECT COUNT(DISTINCT session_id)
    INTO v_week
    FROM visitor_sessions
   WHERE visited_date >= CURRENT_DATE - INTERVAL '6 days';

  -- Calculate total unique sessions
  SELECT COUNT(DISTINCT session_id)
    INTO v_total
    FROM visitor_sessions;

  RETURN json_build_object(
    'online',          COALESCE(v_online, 0),
    'online_guests',   COALESCE(v_online_guests, 0),
    'online_members',  COALESCE(v_online_members, 0),
    'today',           COALESCE(v_today, 0),
    'today_guests',    COALESCE(v_today_guests, 0),
    'today_members',   COALESCE(v_today_members, 0),
    'week',            COALESCE(v_week, 0),
    'total',           COALESCE(v_total, 0)
  );
END;
$function$;
