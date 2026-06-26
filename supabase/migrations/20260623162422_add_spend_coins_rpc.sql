-- spend_coins(p_user_id, p_amount, p_reason, p_metadata): atomic coin spend with
-- balance check + transaction log. Reconstructed from the deployed function definition
-- to reconcile migration history (originally applied out-of-band; idempotent).

CREATE OR REPLACE FUNCTION public.spend_coins(p_user_id uuid, p_amount integer, p_reason text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_balance     integer;
  v_new_balance integer;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  SELECT coins INTO v_balance FROM user_wallet WHERE user_id = p_user_id;
  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'wallet not found';
  END IF;
  IF v_balance < p_amount THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'insufficient_coins', 'balance', v_balance);
  END IF;

  UPDATE user_wallet
  SET coins       = coins - p_amount,
      total_spent = total_spent + p_amount,
      updated_at  = now()
  WHERE user_id = p_user_id
  RETURNING coins INTO v_new_balance;

  INSERT INTO coin_transactions (user_id, amount, reason, metadata, balance_after)
  VALUES (p_user_id, -p_amount, p_reason, p_metadata, v_new_balance);

  RETURN jsonb_build_object('ok', true, 'balance', v_new_balance);
END;
$function$;
