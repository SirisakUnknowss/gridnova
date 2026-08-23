-- Visitor attribution — where a session actually came from.
--
-- visitor_sessions recorded that a visit happened but never its origin, which
-- is why the 2026-08-22/23 spike (10/day -> 1,378/day) could not be attributed
-- to anything afterwards.
--
-- Why this is more than a `referrer` column: most Thai social traffic arrives
-- through the LINE and Facebook in-app browsers, and both routinely strip
-- document.referrer. app_hint (parsed from the User-Agent) and click_id_kind
-- (fbclid / gclid / ttclid) are what stop those sessions from collapsing into
-- an undifferentiated "direct" bucket that answers nothing.

ALTER TABLE public.visitor_sessions
  ADD COLUMN IF NOT EXISTS referrer      text,
  ADD COLUMN IF NOT EXISTS referrer_host text,
  ADD COLUMN IF NOT EXISTS utm_source    text,
  ADD COLUMN IF NOT EXISTS utm_medium    text,
  ADD COLUMN IF NOT EXISTS utm_campaign  text,
  ADD COLUMN IF NOT EXISTS click_id_kind text,
  ADD COLUMN IF NOT EXISTS app_hint      text,
  ADD COLUMN IF NOT EXISTS landing_path  text;

CREATE INDEX IF NOT EXISTS visitor_sessions_attribution_idx
  ON public.visitor_sessions (visited_date, referrer_host);

-- Single place that decides what a session's "source" is, so the admin panel
-- and any later query agree. Ordered most-specific first.
CREATE OR REPLACE FUNCTION public.visitor_source(
  p_utm_source    text,
  p_click_id_kind text,
  p_referrer_host text,
  p_app_hint      text
) RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    NULLIF(p_utm_source,    ''),
    NULLIF(p_click_id_kind, ''),
    NULLIF(p_referrer_host, ''),
    NULLIF(p_app_hint,      ''),
    'direct'
  );
$$;

-- Called by the client right after trackVisit() upserts today's row.
--
-- First write wins. Once a session has an origin it keeps it: in-app SPA
-- navigation reports our own host as the referrer, and a later page load
-- would otherwise overwrite the real source with nothing.
CREATE OR REPLACE FUNCTION public.record_visit_attribution(
  p_session_id    uuid,
  p_visited_date  date,
  p_referrer      text,
  p_referrer_host text,
  p_utm_source    text,
  p_utm_medium    text,
  p_utm_campaign  text,
  p_click_id_kind text,
  p_app_hint      text,
  p_landing_path  text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE visitor_sessions v
     SET referrer      = COALESCE(v.referrer,      NULLIF(p_referrer,      '')),
         referrer_host = COALESCE(v.referrer_host, NULLIF(p_referrer_host, '')),
         utm_source    = COALESCE(v.utm_source,    NULLIF(p_utm_source,    '')),
         utm_medium    = COALESCE(v.utm_medium,    NULLIF(p_utm_medium,    '')),
         utm_campaign  = COALESCE(v.utm_campaign,  NULLIF(p_utm_campaign,  '')),
         click_id_kind = COALESCE(v.click_id_kind, NULLIF(p_click_id_kind, '')),
         app_hint      = COALESCE(v.app_hint,      NULLIF(p_app_hint,      '')),
         landing_path  = COALESCE(v.landing_path,  NULLIF(p_landing_path,  ''))
   WHERE v.session_id   = p_session_id
     AND v.visited_date = p_visited_date;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_visit_attribution(
  uuid, date, text, text, text, text, text, text, text, text
) TO anon, authenticated;

-- Admin panel: sources for a date range, with engagement so we can see which
-- source sends people who actually play rather than which sends the most tabs.
CREATE OR REPLACE FUNCTION public.get_admin_attribution(
  p_date date DEFAULT CURRENT_DATE,
  p_days int  DEFAULT 1
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_from    date;
  v_sources json;
  v_refs    json;
  v_total   int;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  v_from := p_date - GREATEST(p_days - 1, 0);

  SELECT COUNT(*) INTO v_total
    FROM visitor_sessions
   WHERE visited_date BETWEEN v_from AND p_date;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_sources
  FROM (
    SELECT visitor_source(utm_source, click_id_kind, referrer_host, app_hint) AS source,
           COUNT(*)                                  AS sessions,
           COUNT(*) FILTER (WHERE engaged)           AS engaged,
           COUNT(*) FILTER (WHERE NOT is_guest)      AS members
      FROM visitor_sessions
     WHERE visited_date BETWEEN v_from AND p_date
     GROUP BY 1
     ORDER BY sessions DESC
  ) t;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_refs
  FROM (
    SELECT referrer_host, COUNT(*) AS sessions
      FROM visitor_sessions
     WHERE visited_date BETWEEN v_from AND p_date
       AND referrer_host IS NOT NULL
       AND referrer_host <> ''
     GROUP BY 1
     ORDER BY sessions DESC
     LIMIT 15
  ) t;

  RETURN json_build_object(
    'from',           v_from,
    'to',             p_date,
    'total_sessions', COALESCE(v_total, 0),
    'by_source',      v_sources,
    'by_referrer',    v_refs
  );
END;
$$;
