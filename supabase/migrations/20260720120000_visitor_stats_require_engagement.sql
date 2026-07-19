-- "Visitors Today" counted anyone whose page loaded, including bots and
-- bounces that never touched the board (checked today: 5 of 13 guest rows
-- had zero time between created_at and last_seen — landed and left, no
-- heartbeat ever fired). Client now counts real board moves and calls
-- record_visitor_action() once it hits 3 — a much stronger signal of an
-- actual person playing than "the page loaded" or "a heartbeat fired".

ALTER TABLE visitor_sessions ADD COLUMN IF NOT EXISTS engaged boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.record_visitor_action(p_session_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  UPDATE visitor_sessions
     SET engaged = true
   WHERE session_id = p_session_id
     AND visited_date = CURRENT_DATE;
$function$;

GRANT EXECUTE ON FUNCTION public.record_visitor_action(uuid) TO anon, authenticated;

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

  -- Online counts: only sessions that have made 3+ in-game moves today
  -- count as a real visitor. Members deduped by user_id, guests by session_id.
  SELECT COUNT(*) FILTER (WHERE os.is_guest = true AND COALESCE(vs.engaged, false))
           + COUNT(DISTINCT os.user_id) FILTER (WHERE os.is_guest = false AND COALESCE(vs.engaged, false)),
         COUNT(*) FILTER (WHERE os.is_guest = true AND COALESCE(vs.engaged, false)),
         COUNT(DISTINCT os.user_id) FILTER (WHERE os.is_guest = false AND COALESCE(vs.engaged, false))
    INTO v_online, v_online_guests, v_online_members
    FROM online_sessions os
    LEFT JOIN visitor_sessions vs
      ON vs.session_id = os.session_id AND vs.visited_date = CURRENT_DATE;

  -- Today's counts: same engagement + dedupe logic.
  SELECT COUNT(*) FILTER (WHERE is_guest = true AND engaged)
           + COUNT(DISTINCT user_id) FILTER (WHERE is_guest = false AND engaged),
         COUNT(*) FILTER (WHERE is_guest = true AND engaged),
         COUNT(DISTINCT user_id) FILTER (WHERE is_guest = false AND engaged)
    INTO v_today, v_today_guests, v_today_members
    FROM visitor_sessions
   WHERE visited_date = CURRENT_DATE;

  -- Week/total stay raw traffic reach (unique sessions, no engagement
  -- filter) — these are about reach, not "how many actually played".
  SELECT COUNT(DISTINCT session_id)
    INTO v_week
    FROM visitor_sessions
   WHERE visited_date >= CURRENT_DATE - INTERVAL '6 days';

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
