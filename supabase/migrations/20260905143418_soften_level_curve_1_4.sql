-- =====================================================================
-- Soften the level curve: 100 * L^1.5 -> 100 * L^1.4
--
-- The 1.5 curve shipped on 2026-09-03 made level 22 cost 10,318 XP
-- (vs 2,449 on the curve before it) — roughly 8 days per level for an
-- active daily player. 1.4 keeps the intended slowdown (still ~3.6x the
-- old curve, cumulative L1->L100 ≈ 2.6M) without stalling the top of
-- the ladder.
--
-- No back-fill: players keep the XP they have and it is re-measured
-- against the new threshold on their next grant.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.grant_xp(p_user_id uuid, p_amount integer)
 RETURNS TABLE(new_xp bigint, new_level integer, leveled_up boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_xp BIGINT;
  v_level INTEGER;
  v_old_level INTEGER;
  v_xp_for_level INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT xp, level INTO v_xp, v_old_level FROM user_progression WHERE user_id = p_user_id;
  IF v_xp IS NULL THEN
    RAISE EXCEPTION 'progression not found for user';
  END IF;
  v_xp := v_xp + p_amount;
  v_level := v_old_level;
  LOOP
    IF v_level >= 100 THEN EXIT; END IF;
    v_xp_for_level := floor(100 * power(v_level, 1.4));
    IF v_xp < v_xp_for_level THEN EXIT; END IF;
    v_xp := v_xp - v_xp_for_level;
    v_level := v_level + 1;
  END LOOP;
  UPDATE user_progression
  SET xp = v_xp, level = v_level, updated_at = now()
  WHERE user_id = p_user_id;
  RETURN QUERY SELECT v_xp, v_level, v_level > v_old_level;
END;
$function$;

-- Settle everyone whose stored XP already clears the new threshold, so the
-- change lands as a level-up instead of a bar that silently sits over 100%.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM user_progression
           WHERE level < 100 AND xp >= floor(100 * power(level, 1.4))
  LOOP
    PERFORM grant_xp(r.user_id, 0);
  END LOOP;
END $$;
