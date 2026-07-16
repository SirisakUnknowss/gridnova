-- Retroactive economy reset — apply the rebalanced formula to EXISTING
-- users too, not just future grants (see prior migration
-- 20260715201223_rebalance_economy_and_level_curve.sql for the new
-- reward/curve values themselves).
--
-- Product decision: coin history is too messy to reconcile precisely —
-- 34% of all-time achievement coin grants (240,300 of 704,500) reference
-- achievement IDs from earlier redesigns that no longer exist in
-- achievements_definitions, and some grants were double-paid (a past
-- check_and_grant_achievements bug). Rather than a partial/unfair
-- reconciliation, every wallet is reset and recomputed from scratch as
-- the sum of reward_coin for achievements the user currently holds
-- (using the already-rebalanced values) — game history and past spending
-- are intentionally ignored.
--
-- Level/XP has NO grant ledger at all (grant_xp never logged a reason,
-- unlike grant_coins), so precise reconciliation is impossible. Applied
-- a rough approximation instead: reconstruct each user's current total
-- XP-equivalent under the OLD curve (100*L^1.6), scale it down by ~3.375x
-- (the blended reduction ratio of the coin/xp reward rebalance), then
-- remap that onto the NEW curve (60*L^1.2). This is explicitly a rough
-- estimate, not an exact replay of history.
--
-- Snapshots of pre-reset state are kept in *_pre_reset_20260716 tables
-- for support/rollback reference.

CREATE TABLE IF NOT EXISTS user_wallet_pre_reset_20260716 AS
  SELECT * FROM user_wallet;

CREATE TABLE IF NOT EXISTS user_progression_pre_reset_20260716 AS
  SELECT * FROM user_progression;

-- =====================================================================
-- Coin: reset every wallet to sum(reward_coin) of currently-unlocked
-- achievements, using the rebalanced reward table. Log one audit
-- transaction per changed wallet.
-- =====================================================================
INSERT INTO coin_transactions (user_id, amount, reason, metadata, balance_after)
SELECT
  uw.user_id,
  new_coins - uw.coins,
  'economy_reset_2026',
  jsonb_build_object('old_balance', uw.coins, 'new_balance', new_coins),
  new_coins
FROM user_wallet uw
CROSS JOIN LATERAL (
  SELECT COALESCE(SUM(ad.reward_coin), 0) AS new_coins
  FROM user_achievements ua
  JOIN achievements_definitions ad ON ad.id = ua.achievement_id
  WHERE ua.user_id = uw.user_id
) t
WHERE t.new_coins <> uw.coins;

UPDATE user_wallet uw SET
  coins = t.new_coins,
  total_earned = t.new_coins,
  total_spent = 0,
  updated_at = now()
FROM (
  SELECT uw2.user_id, COALESCE(SUM(ad.reward_coin), 0) AS new_coins
  FROM user_wallet uw2
  LEFT JOIN user_achievements ua ON ua.user_id = uw2.user_id
  LEFT JOIN achievements_definitions ad ON ad.id = ua.achievement_id
  GROUP BY uw2.user_id
) t
WHERE t.user_id = uw.user_id;

-- =====================================================================
-- Level/XP: rough rescale onto the new curve (see comment above — not
-- an exact replay, no ledger exists to replay precisely).
-- =====================================================================
DO $$
DECLARE
  r RECORD;
  v_old_total NUMERIC;
  v_scaled_total NUMERIC;
  v_new_level INT;
  v_new_xp NUMERIC;
  v_needed NUMERIC;
BEGIN
  FOR r IN SELECT user_id, level, xp FROM user_progression LOOP
    SELECT COALESCE(SUM(floor(100 * power(l, 1.6))), 0)
      INTO v_old_total
      FROM generate_series(1, r.level - 1) AS l;
    v_old_total := v_old_total + r.xp;

    v_scaled_total := v_old_total / 3.375;

    v_new_level := 1;
    v_new_xp := v_scaled_total;
    WHILE v_new_level < 100 LOOP
      v_needed := floor(60 * power(v_new_level, 1.2));
      EXIT WHEN v_new_xp < v_needed;
      v_new_xp := v_new_xp - v_needed;
      v_new_level := v_new_level + 1;
    END LOOP;

    UPDATE user_progression
    SET level = v_new_level, xp = floor(v_new_xp), updated_at = now()
    WHERE user_id = r.user_id;
  END LOOP;
END $$;
