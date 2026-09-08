-- =====================================================================
-- Practice daily play limit
-- =====================================================================
-- Practice is the one mode Hearts never gated (it is meant to stay free),
-- which left it an unbounded grind loop. This caps it instead at 10
-- finished games PER DIFFICULTY per UTC day.
--
-- A play is counted when a game FINISHES (win or game-over), not when it
-- starts — quitting or abandoning costs nothing, so the counter can never
-- be burned by a mis-tap or a re-rolled puzzle.
--
-- Running out is not a wall: extra plays for that difficulty can be bought
-- with coins (a pack of 5, priced per difficulty). Members are tracked
-- here; guests have no auth session at all, so their counters live in
-- localStorage client-side (same split as Hearts) and they cannot buy.
--
-- The same counter also drives the difficulty LADDER: a new player starts
-- with Easy only and unlocks the next difficulty by finishing 10 games on
-- the current one. Lifetime totals live in practice_level_totals, which
-- only ever grows — so an unlock, once earned, is permanent.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.practice_plays (
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  play_date   date NOT NULL,
  level       text NOT NULL,
  plays_used  int  NOT NULL DEFAULT 0 CHECK (plays_used >= 0),
  extra_plays int  NOT NULL DEFAULT 0 CHECK (extra_plays >= 0),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, play_date, level)
);

ALTER TABLE public.practice_plays ENABLE ROW LEVEL SECURITY;

-- Players may read their own counters; every write goes through the
-- SECURITY DEFINER functions below, never directly.
DROP POLICY IF EXISTS "own practice plays read" ON public.practice_plays;
CREATE POLICY "own practice plays read" ON public.practice_plays
  FOR SELECT USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Lifetime plays per difficulty. Separate from the daily table because it
-- must survive the date rollover: it is the unlock ledger, not a counter.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.practice_level_totals (
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level       text NOT NULL,
  total_plays int  NOT NULL DEFAULT 0 CHECK (total_plays >= 0),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, level)
);

ALTER TABLE public.practice_level_totals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own practice totals read" ON public.practice_level_totals;
CREATE POLICY "own practice totals read" ON public.practice_level_totals
  FOR SELECT USING (auth.uid() = user_id);

-- Backfill so nobody who already plays this game gets sent back to Easy.
-- practice_progress.plays counts completed practice wins per level/stage
-- and predates this feature, which makes it the only history that goes
-- back far enough (user_game_history is trimmed to the last 100 games).
INSERT INTO public.practice_level_totals (user_id, level, total_plays)
SELECT user_id, level::text, SUM(plays)::int
  FROM public.practice_progress
  WHERE plays > 0
  GROUP BY user_id, level::text
ON CONFLICT (user_id, level) DO NOTHING;

-- ---------------------------------------------------------------------
-- Coin price of a +5 pack, per difficulty. Same shape as the continue
-- prices in game.ts: it scales with how much a run of that difficulty is
-- worth, so buying past the cap stays a real sink at every level.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._practice_pack_price(p_level text)
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_level
    WHEN 'easy'        THEN 300
    WHEN 'easy-medium' THEN 400
    WHEN 'medium'      THEN 500
    WHEN 'medium-hard' THEN 650
    WHEN 'hard'        THEN 800
    WHEN 'hard-expert' THEN 1000
    WHEN 'expert'      THEN 1200
    ELSE NULL
  END;
$$;

-- ---------------------------------------------------------------------
-- get_practice_plays() — today's counters. Only rows that exist are
-- returned; the client treats a missing difficulty as 0 used / 0 extra.
-- Rows for past days are left alone (they are the reset — a new UTC date
-- is simply a new primary key).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_practice_plays()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_date   date := (now() AT TIME ZONE 'UTC')::date;
  v_levels json;
  v_totals json;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  SELECT COALESCE(json_object_agg(level, json_build_object('used', plays_used, 'extra', extra_plays)), '{}'::json)
    INTO v_levels
    FROM practice_plays
    WHERE user_id = v_uid AND play_date = v_date;

  SELECT COALESCE(json_object_agg(level, total_plays), '{}'::json)
    INTO v_totals
    FROM practice_level_totals
    WHERE user_id = v_uid;

  RETURN json_build_object('ok', true, 'date', v_date, 'limit', 10, 'pack', 5,
                           'unlock_at', 10, 'levels', v_levels, 'totals', v_totals);
END;
$$;

-- ---------------------------------------------------------------------
-- record_practice_play(p_level) — called when a practice game finishes.
-- Deliberately does NOT reject once the cap is reached: the gate lives on
-- the start path, and a game already in progress (resumed from a save
-- made before the cap) must always be allowed to finish and be recorded.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_practice_play(p_level text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_date  date := (now() AT TIME ZONE 'UTC')::date;
  v_row   public.practice_plays;
  v_total int;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;
  IF p_level IS NULL OR p_level = '' THEN
    RETURN json_build_object('ok', false, 'reason', 'bad_level');
  END IF;

  INSERT INTO practice_plays (user_id, play_date, level, plays_used)
    VALUES (v_uid, v_date, p_level, 1)
    ON CONFLICT (user_id, play_date, level)
    DO UPDATE SET plays_used = practice_plays.plays_used + 1, updated_at = now()
    RETURNING * INTO v_row;

  INSERT INTO practice_level_totals (user_id, level, total_plays)
    VALUES (v_uid, p_level, 1)
    ON CONFLICT (user_id, level)
    DO UPDATE SET total_plays = practice_level_totals.total_plays + 1, updated_at = now()
    RETURNING total_plays INTO v_total;

  RETURN json_build_object('ok', true, 'level', p_level,
                           'used', v_row.plays_used, 'extra', v_row.extra_plays,
                           'total', v_total);
END;
$$;

-- ---------------------------------------------------------------------
-- buy_practice_plays(p_level) — spend coins for +5 plays on one
-- difficulty, today only. Extras do not carry over: the row is keyed by
-- date, so tomorrow starts clean.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.buy_practice_plays(p_level text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_date  date := (now() AT TIME ZONE 'UTC')::date;
  v_price int;
  v_spend jsonb;
  v_row   public.practice_plays;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  v_price := _practice_pack_price(p_level);
  IF v_price IS NULL THEN
    RETURN json_build_object('ok', false, 'reason', 'bad_level');
  END IF;

  v_spend := spend_coins(v_uid, v_price, 'practice_extra_plays',
                         jsonb_build_object('level', p_level, 'plays', 5));
  IF NOT COALESCE((v_spend->>'ok')::boolean, false) THEN
    RETURN json_build_object('ok', false,
                             'reason', COALESCE(v_spend->>'reason', 'insufficient_coins'),
                             'balance', (v_spend->>'balance')::int);
  END IF;

  INSERT INTO practice_plays (user_id, play_date, level, extra_plays)
    VALUES (v_uid, v_date, p_level, 5)
    ON CONFLICT (user_id, play_date, level)
    DO UPDATE SET extra_plays = practice_plays.extra_plays + 5, updated_at = now()
    RETURNING * INTO v_row;

  RETURN json_build_object('ok', true, 'level', p_level,
                           'used', v_row.plays_used, 'extra', v_row.extra_plays,
                           'balance', (v_spend->>'balance')::int);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_practice_plays()        TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_practice_play(text)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.buy_practice_plays(text)    TO authenticated;
