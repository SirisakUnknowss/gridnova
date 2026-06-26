-- seed_daily_quests(p_date): assigns the 3-tier daily quest set to the calling user.
-- Reconstructed from the deployed function definition to reconcile migration history
-- (this version was originally applied out-of-band; content is idempotent CREATE OR REPLACE).

CREATE OR REPLACE FUNCTION public.seed_daily_quests(p_date date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN RETURN; END IF;

  INSERT INTO user_daily_quests (user_id, date, quest_id, tier, target, reward_coin, reward_xp)
  VALUES
    (v_user_id, p_date, 'daily_complete',   1, 1, 50,  20),
    (v_user_id, p_date, 'no_mistakes',      1, 1, 30,  10),
    (v_user_id, p_date, 'no_hints',         1, 1, 30,  10),
    (v_user_id, p_date, 'fast_finish',      1, 1, 40,  15),
    (v_user_id, p_date, 'practice_streak',  1, 3, 20,   5)
  ON CONFLICT (user_id, date, quest_id) DO NOTHING;
END;
$function$;
