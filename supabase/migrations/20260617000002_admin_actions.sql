-- Admin helpers: adjust coins, verify is_admin column exists

-- Ensure is_admin column exists on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- RPC: admin adjust coins (adds or subtracts, records in coin_transactions)
CREATE OR REPLACE FUNCTION admin_adjust_coins(
  p_user_id UUID,
  p_amount   INTEGER,
  p_reason   TEXT DEFAULT 'admin_adjust'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update wallet
  INSERT INTO user_wallet (user_id, coins)
  VALUES (p_user_id, GREATEST(0, p_amount))
  ON CONFLICT (user_id) DO UPDATE
    SET coins = GREATEST(0, user_wallet.coins + p_amount);

  -- Record in ledger
  INSERT INTO coin_transactions (user_id, delta, reason, created_at)
  VALUES (p_user_id, p_amount, p_reason, now());
END;
$$;
