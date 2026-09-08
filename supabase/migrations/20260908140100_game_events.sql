-- =====================================================================
-- Game event log — the outcomes we were never recording
-- =====================================================================
-- Until now the database only ever learned about games that were WON:
-- submit-daily-score / submit-practice-score fire on a win, and nothing
-- fires on a loss, a game-over, a Time Attack timeout or an abandon. That
-- made it impossible to size the two mechanics that act on exactly those
-- events (Hearts spends on a loss; the Practice cap counts finishes), so
-- both are on hold until this table has real data behind it.
--
-- user_game_history also has no origin column, which makes Practice,
-- Random and Book indistinguishable once written. This log keeps origin,
-- so "Practice" can finally be measured on its own.
--
-- Rows are client-reported (guests have no auth session, and guests are
-- the whole top of the funnel). Treat it as behavioural analytics, never
-- as an authority for rewards or anti-cheat — those stay server-side.
-- =====================================================================

-- One definition of "which mode did the player think they were playing",
-- shared by the admin panel and ad-hoc queries — same idea as
-- visitor_source() for traffic.
CREATE OR REPLACE FUNCTION public.game_surface(p_mode text, p_origin text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_origin IN ('random', 'book', 'time-attack') THEN p_origin
    WHEN p_mode = 'daily' THEN 'daily'
    ELSE 'practice'
  END;
$$;

CREATE TABLE IF NOT EXISTS public.game_events (
  id             bigserial PRIMARY KEY,
  session_id     text NOT NULL,
  user_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_guest       boolean NOT NULL DEFAULT true,
  event          text NOT NULL CHECK (event IN ('start','win','game_over','timeout','abandon')),
  mode           text NOT NULL CHECK (mode IN ('daily','practice')),
  origin         text CHECK (origin IN ('random','book','time-attack')),
  level          text NOT NULL,
  -- A resumed start is not a new attempt; without this flag every reopen of
  -- a saved Daily would look like a fresh game and inflate the funnel.
  resumed        boolean NOT NULL DEFAULT false,
  time_seconds   int,
  mistakes       int,
  hints_used     int,
  paid_hints     int,
  continues_used int,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_events_created ON public.game_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_events_funnel  ON public.game_events (created_at DESC, event, mode, origin, level);
CREATE INDEX IF NOT EXISTS idx_game_events_user    ON public.game_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_events_session ON public.game_events (session_id, created_at DESC);

ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;
-- No policy on purpose: writes go through the SECURITY DEFINER function
-- below and reads through the admin function. Nothing reads this directly.

-- ---------------------------------------------------------------------
-- record_game_event(...) — fire-and-forget from the client. Callable by
-- anon so guests are captured too; user_id/is_guest are taken from the
-- session, never from the caller's arguments.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_game_event(
  p_session_id     text,
  p_event          text,
  p_mode           text,
  p_level          text,
  p_origin         text DEFAULT NULL,
  p_resumed        boolean DEFAULT false,
  p_time_seconds   int DEFAULT NULL,
  p_mistakes       int DEFAULT NULL,
  p_hints_used     int DEFAULT NULL,
  p_paid_hints     int DEFAULT NULL,
  p_continues_used int DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF p_session_id IS NULL OR p_session_id = '' THEN RETURN; END IF;
  IF p_event NOT IN ('start','win','game_over','timeout','abandon') THEN RETURN; END IF;
  IF p_mode NOT IN ('daily','practice') THEN RETURN; END IF;
  IF p_origin IS NOT NULL AND p_origin NOT IN ('random','book','time-attack') THEN RETURN; END IF;

  INSERT INTO game_events (
    session_id, user_id, is_guest, event, mode, origin, level, resumed,
    time_seconds, mistakes, hints_used, paid_hints, continues_used
  ) VALUES (
    left(p_session_id, 64), v_uid, v_uid IS NULL, p_event, p_mode, p_origin,
    left(coalesce(p_level, ''), 32), coalesce(p_resumed, false),
    -- Clamped: these are client-reported and only ever read in aggregate,
    -- so a bad value should distort nothing.
    least(greatest(p_time_seconds, 0), 86400),
    least(greatest(p_mistakes, 0), 999),
    least(greatest(p_hints_used, 0), 99),
    least(greatest(p_paid_hints, 0), 99),
    least(greatest(p_continues_used, 0), 99)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_game_event(
  text, text, text, text, text, boolean, int, int, int, int, int
) TO anon, authenticated;

-- ---------------------------------------------------------------------
-- get_game_funnel(p_days) — admin only. One row per surface + difficulty:
-- how many games were started, and how they ended. This is the query the
-- Hearts / Practice-cap decision is waiting on.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_game_funnel(p_days int DEFAULT 14)
RETURNS TABLE (
  surface      text,
  level        text,
  fresh_starts bigint,
  resumes      bigint,
  wins         bigint,
  game_overs   bigint,
  timeouts     bigint,
  abandons     bigint,
  guest_starts bigint,
  finish_rate  numeric,
  loss_rate    numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  RETURN QUERY
  WITH e AS (
    SELECT game_surface(ge.mode, ge.origin) AS surface, ge.*
    FROM game_events ge
    WHERE ge.created_at > now() - make_interval(days => greatest(p_days, 1))
  )
  SELECT
    e.surface,
    e.level,
    count(*) FILTER (WHERE e.event = 'start' AND NOT e.resumed),
    count(*) FILTER (WHERE e.event = 'start' AND e.resumed),
    count(*) FILTER (WHERE e.event = 'win'),
    count(*) FILTER (WHERE e.event = 'game_over'),
    count(*) FILTER (WHERE e.event = 'timeout'),
    count(*) FILTER (WHERE e.event = 'abandon'),
    count(*) FILTER (WHERE e.event = 'start' AND NOT e.resumed AND e.is_guest),
    -- Of the games that ended at all, how many were finished rather than
    -- walked away from.
    round(100.0 * count(*) FILTER (WHERE e.event IN ('win','game_over','timeout'))
          / nullif(count(*) FILTER (WHERE e.event IN ('win','game_over','timeout','abandon')), 0), 1),
    -- Of the games that reached an outcome, how many were losses — this is
    -- what a heart actually costs.
    round(100.0 * count(*) FILTER (WHERE e.event IN ('game_over','timeout'))
          / nullif(count(*) FILTER (WHERE e.event IN ('win','game_over','timeout')), 0), 1)
  FROM e
  GROUP BY e.surface, e.level
  ORDER BY 3 DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_game_funnel(int) TO authenticated;

-- ---------------------------------------------------------------------
-- get_practice_load(p_days, p_cap) — admin only. The Practice daily-cap
-- question, answered from finishes rather than wins: per difficulty, how
-- many games does one player actually finish in a day, and how much play
-- would a cap of p_cap have deleted?
--
-- "One player" is the account for members and the session for guests —
-- guests have no account and are the whole top of the funnel.
-- A finish is win/game_over/timeout; an abandon is not a play.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_practice_load(p_days int DEFAULT 14, p_cap int DEFAULT 10)
RETURNS TABLE (
  level             text,
  player_days       bigint,
  games             bigint,
  avg_per_day       numeric,
  p50               int,
  p90               int,
  max_per_day       int,
  days_over_cap     bigint,
  pct_days_over_cap numeric,
  pct_games_lost    numeric,
  guest_share       numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_cap int := greatest(coalesce(p_cap, 10), 1);
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  RETURN QUERY
  WITH finishes AS (
    SELECT
      ge.level AS lvl,
      coalesce(ge.user_id::text, 'guest:' || ge.session_id) AS actor,
      (ge.created_at AT TIME ZONE 'UTC')::date AS d,
      ge.is_guest
    FROM game_events ge
    WHERE ge.event IN ('win', 'game_over', 'timeout')
      AND game_surface(ge.mode, ge.origin) = 'practice'
      AND ge.created_at > now() - make_interval(days => greatest(p_days, 1))
  ), per_day AS (
    SELECT f.lvl, f.actor, f.d, count(*)::int AS n,
           bool_or(f.is_guest) AS any_guest
    FROM finishes f
    GROUP BY 1, 2, 3
  )
  SELECT
    pd.lvl,
    count(*),
    sum(pd.n),
    round(avg(pd.n), 2),
    percentile_disc(0.5) WITHIN GROUP (ORDER BY pd.n),
    percentile_disc(0.9) WITHIN GROUP (ORDER BY pd.n),
    max(pd.n),
    count(*) FILTER (WHERE pd.n >= v_cap),
    round(100.0 * count(*) FILTER (WHERE pd.n >= v_cap) / nullif(count(*), 0), 1),
    -- Share of play a cap of v_cap would have removed
    round(100.0 * sum(greatest(pd.n - v_cap, 0)) / nullif(sum(pd.n), 0), 1),
    round(100.0 * count(*) FILTER (WHERE pd.any_guest) / nullif(count(*), 0), 1)
  FROM per_day pd
  GROUP BY pd.lvl
  ORDER BY 3 DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_practice_load(int, int) TO authenticated;
