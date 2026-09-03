-- =====================================================================
-- Global Hearts (energy) system
-- =====================================================================
-- Hearts are a global, per-account resource (0..5) that gate starting a
-- game in every mode EXCEPT Practice. Starting a gated game costs 1 heart;
-- winning refunds it, so only a loss/game-over/quit actually spends one.
--
-- Regen differs by account type (read from auth.users.is_anonymous):
--   * Members (non-anonymous): +1 heart per 30 minutes, capped at 5.
--   * Guests (anonymous):      no time-based regen; reset to full at UTC
--                              midnight. Running out is the nudge to sign up.
--
-- An "Infinite Hearts" buff (bought with coins, 1/2/3/5 hours) makes starts
-- free while active. All mutation is server-side so the client cannot cheat
-- the clock or the balance.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_hearts (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hearts         int NOT NULL DEFAULT 5 CHECK (hearts >= 0 AND hearts <= 5),
  last_regen_at  timestamptz NOT NULL DEFAULT now(),
  infinite_until timestamptz,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_hearts ENABLE ROW LEVEL SECURITY;

-- Players may read their own row; every write goes through the SECURITY
-- DEFINER functions below, never directly.
DROP POLICY IF EXISTS "own hearts read" ON public.user_hearts;
CREATE POLICY "own hearts read" ON public.user_hearts
  FOR SELECT USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Internal: bring a player's row up to date (regen / guest reset) and
-- return the refreshed row. Locks the row FOR UPDATE so concurrent calls
-- (e.g. a double-tapped Start) can't double-spend.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._refresh_hearts(p_user_id uuid)
RETURNS public.user_hearts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row       public.user_hearts;
  v_is_anon   boolean;
  v_max       int := 5;
  v_regen_min int := 30;
  v_elapsed   numeric;
  v_regened   int;
BEGIN
  SELECT COALESCE(is_anonymous, false) INTO v_is_anon FROM auth.users WHERE id = p_user_id;

  INSERT INTO user_hearts (user_id) VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_row FROM user_hearts WHERE user_id = p_user_id FOR UPDATE;

  IF v_is_anon THEN
    -- Guests: no drip regen; refill to full when the UTC day rolls over.
    IF (v_row.last_regen_at AT TIME ZONE 'UTC')::date < (now() AT TIME ZONE 'UTC')::date THEN
      v_row.hearts := v_max;
      v_row.last_regen_at := now();
    END IF;
  ELSE
    -- Members: +1 per regen window, capped.
    IF v_row.hearts < v_max THEN
      v_elapsed := EXTRACT(EPOCH FROM (now() - v_row.last_regen_at)) / 60.0;
      v_regened := floor(v_elapsed / v_regen_min);
      IF v_regened > 0 THEN
        IF v_row.hearts + v_regened >= v_max THEN
          v_row.hearts := v_max;
          v_row.last_regen_at := now();
        ELSE
          v_row.hearts := v_row.hearts + v_regened;
          v_row.last_regen_at := v_row.last_regen_at + (v_regened * (v_regen_min || ' minutes')::interval);
        END IF;
      END IF;
    END IF;
  END IF;

  UPDATE user_hearts
    SET hearts = v_row.hearts, last_regen_at = v_row.last_regen_at, updated_at = now()
    WHERE user_id = p_user_id
    RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

-- ---------------------------------------------------------------------
-- get_hearts() — current state after applying regen. Safe to poll.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_hearts()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_row      public.user_hearts;
  v_infinite boolean;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;
  v_row := _refresh_hearts(v_uid);
  v_infinite := v_row.infinite_until IS NOT NULL AND v_row.infinite_until > now();
  RETURN json_build_object(
    'ok', true,
    'hearts', v_row.hearts,
    'max', 5,
    'regen_minutes', 30,
    'last_regen_at', v_row.last_regen_at,
    'infinite', v_infinite,
    'infinite_until', CASE WHEN v_infinite THEN v_row.infinite_until ELSE NULL END
  );
END;
$$;

-- ---------------------------------------------------------------------
-- consume_heart(p_mode) — call on START of a gated game. Returns
-- consumed=false when the infinite buff is active (no heart spent).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_heart(p_mode text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_row      public.user_hearts;
  v_infinite boolean;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;
  v_row := _refresh_hearts(v_uid);
  v_infinite := v_row.infinite_until IS NOT NULL AND v_row.infinite_until > now();

  IF v_infinite THEN
    RETURN json_build_object('ok', true, 'consumed', false, 'hearts', v_row.hearts,
                             'infinite', true, 'infinite_until', v_row.infinite_until);
  END IF;

  IF v_row.hearts <= 0 THEN
    RETURN json_build_object('ok', false, 'reason', 'no_hearts', 'hearts', 0,
                             'consumed', false, 'infinite', false,
                             'last_regen_at', v_row.last_regen_at);
  END IF;

  -- CASE reads the pre-update value: if the pool was full, start the regen
  -- clock now so the drip begins from this moment.
  UPDATE user_hearts
    SET hearts = hearts - 1,
        last_regen_at = CASE WHEN hearts = 5 THEN now() ELSE last_regen_at END,
        updated_at = now()
    WHERE user_id = v_uid
    RETURNING * INTO v_row;

  RETURN json_build_object('ok', true, 'consumed', true, 'hearts', v_row.hearts,
                           'infinite', false, 'last_regen_at', v_row.last_regen_at);
END;
$$;

-- ---------------------------------------------------------------------
-- refund_heart() — call on WIN of a gated game (only if a heart was
-- actually consumed for that game). Capped at max, so at worst it is a
-- no-op; it can never stockpile beyond 5.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refund_heart()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.user_hearts;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;
  PERFORM _refresh_hearts(v_uid);
  UPDATE user_hearts SET hearts = LEAST(5, hearts + 1), updated_at = now()
    WHERE user_id = v_uid
    RETURNING * INTO v_row;
  RETURN json_build_object('ok', true, 'hearts', v_row.hearts);
END;
$$;

-- ---------------------------------------------------------------------
-- buy_infinite_hearts(p_hours) — spend coins for an infinite-hearts buff.
-- Extends any active buff (stacks additively). Server owns the price map.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.buy_infinite_hearts(p_hours int)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_price int;
  v_spend jsonb;
  v_base  timestamptz;
  v_row   public.user_hearts;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  v_price := CASE p_hours
    WHEN 1 THEN 800
    WHEN 2 THEN 1400
    WHEN 3 THEN 1900
    WHEN 5 THEN 2800
    ELSE NULL
  END;
  IF v_price IS NULL THEN
    RETURN json_build_object('ok', false, 'reason', 'bad_hours');
  END IF;

  v_spend := spend_coins(v_uid, v_price, 'infinite_hearts',
                         jsonb_build_object('hours', p_hours));
  IF NOT COALESCE((v_spend->>'ok')::boolean, false) THEN
    RETURN json_build_object('ok', false,
                             'reason', COALESCE(v_spend->>'reason', 'insufficient_coins'),
                             'balance', (v_spend->>'balance')::int);
  END IF;

  v_row := _refresh_hearts(v_uid);
  v_base := GREATEST(now(), COALESCE(v_row.infinite_until, now()));
  UPDATE user_hearts
    SET infinite_until = v_base + (p_hours || ' hours')::interval, updated_at = now()
    WHERE user_id = v_uid
    RETURNING * INTO v_row;

  RETURN json_build_object('ok', true, 'infinite_until', v_row.infinite_until,
                           'hearts', v_row.hearts, 'balance', (v_spend->>'balance')::int);
END;
$$;

-- ---------------------------------------------------------------------
-- refill_hearts_full() — set the pool to full and restart the clock.
-- Called client-side right after a guest upgrades to a real account, so
-- signing up immediately unblocks play (the whole point of the guest gate).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refill_hearts_full()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.user_hearts;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;
  PERFORM _refresh_hearts(v_uid);
  UPDATE user_hearts SET hearts = 5, last_regen_at = now(), updated_at = now()
    WHERE user_id = v_uid
    RETURNING * INTO v_row;
  RETURN json_build_object('ok', true, 'hearts', v_row.hearts);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_hearts()            TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_heart(text)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_heart()          TO authenticated;
GRANT EXECUTE ON FUNCTION public.buy_infinite_hearts(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refill_hearts_full()    TO authenticated;
