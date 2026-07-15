-- Rebalance achievement coin/XP rewards + flatten the level XP curve.
--
-- Coin inflation was real and measured: 31 wallets held 717,226 coin total
-- (avg 23,136 idle each) while the entire shop is worth only 15,100 coin —
-- the average player already had 1.5x the whole shop sitting unspendable.
-- The worst offenders were L5/L10 achievement rewards up to 15,000-25,000
-- coin, 7.5-12.5x the priciest single shop item (2,000). This does NOT
-- touch coins already granted (existing user_wallet balances untouched,
-- per product decision) — only reward_coin/reward_xp on achievements not
-- yet unlocked change, going forward.
--
-- New total pool: ~110,330 coin / ~220,550 xp (was ~373,250 / ~742,600).
-- Max single reward: 2,800 coin (was up to 25,000) — now ~1.4x the
-- priciest shop item instead of ~12.5x.
--
-- Level curve: xpForLevel(L) = floor(60 * L^1.2), was floor(100 * L^1.6).
-- Cumulative XP to level 100 drops from ~6.0M to ~677K. Existing
-- user_progression rows are untouched (xp is "XP within current level",
-- recomputed against the new thresholds on the next grant_xp call — no
-- backfill needed, nobody gets bumped or demoted a level by this change).
--
-- Level also gets its first real gameplay perk: practice/random mode free
-- hints scale with level (+1 per 20 levels, capped at +3). Daily is
-- excluded — it has a global leaderboard, so hint count must stay equal
-- for everyone there regardless of level. See src/lib/level.ts
-- freeHintsForLevel() and src/ui/views/game.ts.

UPDATE achievements_definitions ad SET
  reward_coin = v.new_coin,
  reward_xp = v.new_xp
FROM (VALUES
  ('ACH_PLAY_M1_L1', 50, 100),
  ('ACH_PLAY_M1_L2', 120, 250),
  ('ACH_PLAY_M1_L3', 300, 600),
  ('ACH_PLAY_M1_L4', 700, 1400),
  ('ACH_PLAY_M1_L5', 1500, 3000),
  ('ACH_PLAY_M2_L1', 50, 100),
  ('ACH_PLAY_M2_L2', 120, 250),
  ('ACH_PLAY_M2_L3', 300, 600),
  ('ACH_PLAY_M2_L4', 700, 1400),
  ('ACH_PLAY_M2_L5', 1500, 3000),
  ('ACH_PLAY_M3_L1', 50, 100),
  ('ACH_PLAY_M3_L2', 120, 250),
  ('ACH_PLAY_M3_L3', 300, 600),
  ('ACH_PLAY_M3_L4', 700, 1400),
  ('ACH_PLAY_M3_L5', 1500, 3000),
  ('ACH_PLAY_M4_L1', 50, 100),
  ('ACH_PLAY_M4_L2', 120, 250),
  ('ACH_PLAY_M4_L3', 300, 600),
  ('ACH_PLAY_M4_L4', 700, 1400),
  ('ACH_PLAY_M4_L5', 1500, 3000),
  ('ACH_PLAY_M5_L1', 50, 100),
  ('ACH_PLAY_M5_L2', 120, 250),
  ('ACH_PLAY_M5_L3', 300, 600),
  ('ACH_PLAY_M5_L4', 700, 1400),
  ('ACH_PLAY_M5_L5', 1500, 3000),
  ('ACH_DAILY_M1_L1', 50, 100),
  ('ACH_DAILY_M1_L2', 120, 250),
  ('ACH_DAILY_M1_L3', 300, 600),
  ('ACH_DAILY_M1_L4', 700, 1400),
  ('ACH_DAILY_M1_L5', 1500, 3000),
  ('ACH_DAILY_M2_L1', 50, 100),
  ('ACH_DAILY_M2_L2', 120, 250),
  ('ACH_DAILY_M2_L3', 300, 600),
  ('ACH_DAILY_M2_L4', 700, 1400),
  ('ACH_DAILY_M2_L5', 1500, 3000),
  ('ACH_DAILY_M3_L1', 50, 100),
  ('ACH_DAILY_M3_L2', 120, 250),
  ('ACH_DAILY_M3_L3', 300, 600),
  ('ACH_DAILY_M3_L4', 700, 1400),
  ('ACH_DAILY_M3_L5', 1500, 3000),
  ('ACH_DAILY_M4_L1', 50, 100),
  ('ACH_DAILY_M4_L2', 120, 250),
  ('ACH_DAILY_M4_L3', 300, 600),
  ('ACH_DAILY_M4_L4', 700, 1400),
  ('ACH_DAILY_M4_L5', 1500, 3000),
  ('ACH_DAILY_M5_L1', 50, 100),
  ('ACH_DAILY_M5_L2', 120, 250),
  ('ACH_DAILY_M5_L3', 300, 600),
  ('ACH_DAILY_M5_L4', 700, 1400),
  ('ACH_DAILY_M5_L5', 1500, 3000),
  ('ACH_STREAK_M1_L1', 50, 100),
  ('ACH_STREAK_M1_L2', 120, 250),
  ('ACH_STREAK_M1_L3', 300, 600),
  ('ACH_STREAK_M1_L4', 700, 1400),
  ('ACH_STREAK_M1_L5', 1500, 3000),
  ('ACH_STREAK_M2_L1', 50, 100),
  ('ACH_STREAK_M2_L2', 120, 250),
  ('ACH_STREAK_M2_L3', 300, 600),
  ('ACH_STREAK_M2_L4', 700, 1400),
  ('ACH_STREAK_M2_L5', 1500, 3000),
  ('ACH_STREAK_M3_L1', 50, 100),
  ('ACH_STREAK_M3_L2', 120, 250),
  ('ACH_STREAK_M3_L3', 300, 600),
  ('ACH_STREAK_M3_L4', 700, 1400),
  ('ACH_STREAK_M3_L5', 1500, 3000),
  ('ACH_STREAK_M4_L1', 50, 100),
  ('ACH_STREAK_M4_L2', 120, 250),
  ('ACH_STREAK_M4_L3', 300, 600),
  ('ACH_STREAK_M4_L4', 700, 1400),
  ('ACH_STREAK_M4_L5', 1500, 3000),
  ('ACH_STREAK_M5_L1', 50, 100),
  ('ACH_STREAK_M5_L2', 120, 250),
  ('ACH_STREAK_M5_L3', 300, 600),
  ('ACH_STREAK_M5_L4', 700, 1400),
  ('ACH_STREAK_M5_L5', 1500, 3000),
  ('ACH_FLAWLESS_M1_L1', 50, 100),
  ('ACH_FLAWLESS_M1_L2', 120, 250),
  ('ACH_FLAWLESS_M1_L3', 300, 600),
  ('ACH_FLAWLESS_M1_L4', 700, 1400),
  ('ACH_FLAWLESS_M1_L5', 1500, 3000),
  ('ACH_FLAWLESS_M2_L1', 50, 100),
  ('ACH_FLAWLESS_M2_L2', 120, 250),
  ('ACH_FLAWLESS_M2_L3', 300, 600),
  ('ACH_FLAWLESS_M2_L4', 700, 1400),
  ('ACH_FLAWLESS_M2_L5', 1500, 3000),
  ('ACH_FLAWLESS_M3_L1', 50, 100),
  ('ACH_FLAWLESS_M3_L2', 120, 250),
  ('ACH_FLAWLESS_M3_L3', 300, 600),
  ('ACH_FLAWLESS_M3_L4', 700, 1400),
  ('ACH_FLAWLESS_M3_L5', 1500, 3000),
  ('ACH_FLAWLESS_M4_L1', 50, 100),
  ('ACH_FLAWLESS_M4_L2', 120, 250),
  ('ACH_FLAWLESS_M4_L3', 300, 600),
  ('ACH_FLAWLESS_M4_L4', 700, 1400),
  ('ACH_FLAWLESS_M4_L5', 1500, 3000),
  ('ACH_FLAWLESS_M5_L1', 50, 100),
  ('ACH_FLAWLESS_M5_L2', 120, 250),
  ('ACH_FLAWLESS_M5_L3', 300, 600),
  ('ACH_FLAWLESS_M5_L4', 700, 1400),
  ('ACH_FLAWLESS_M5_L5', 1500, 3000),
  ('ACH_SPEED_M1_L1', 50, 100),
  ('ACH_SPEED_M1_L2', 120, 250),
  ('ACH_SPEED_M1_L3', 300, 600),
  ('ACH_SPEED_M1_L4', 700, 1400),
  ('ACH_SPEED_M1_L5', 1500, 3000),
  ('ACH_SPEED_M2_L1', 50, 100),
  ('ACH_SPEED_M2_L2', 120, 250),
  ('ACH_SPEED_M2_L3', 300, 600),
  ('ACH_SPEED_M2_L4', 700, 1400),
  ('ACH_SPEED_M2_L5', 1500, 3000),
  ('ACH_SPEED_M3_L1', 50, 100),
  ('ACH_SPEED_M3_L2', 120, 250),
  ('ACH_SPEED_M3_L3', 300, 600),
  ('ACH_SPEED_M3_L4', 700, 1400),
  ('ACH_SPEED_M3_L5', 1500, 3000),
  ('ACH_SPEED_M4_L1', 50, 100),
  ('ACH_SPEED_M4_L2', 120, 250),
  ('ACH_SPEED_M4_L3', 300, 600),
  ('ACH_SPEED_M4_L4', 700, 1400),
  ('ACH_SPEED_M4_L5', 1500, 3000),
  ('ACH_SPEED_M5_L1', 50, 100),
  ('ACH_SPEED_M5_L2', 120, 250),
  ('ACH_SPEED_M5_L3', 300, 600),
  ('ACH_SPEED_M5_L4', 700, 1400),
  ('ACH_SPEED_M5_L5', 1500, 3000),
  ('ACH_PURE_M1_L1', 50, 100),
  ('ACH_PURE_M1_L2', 120, 250),
  ('ACH_PURE_M1_L3', 300, 600),
  ('ACH_PURE_M1_L4', 700, 1400),
  ('ACH_PURE_M1_L5', 1500, 3000),
  ('ACH_PURE_M2_L1', 50, 100),
  ('ACH_PURE_M2_L2', 120, 250),
  ('ACH_PURE_M2_L3', 300, 600),
  ('ACH_PURE_M2_L4', 700, 1400),
  ('ACH_PURE_M2_L5', 1500, 3000),
  ('ACH_PURE_M3_L1', 50, 100),
  ('ACH_PURE_M3_L2', 120, 250),
  ('ACH_PURE_M3_L3', 300, 600),
  ('ACH_PURE_M3_L4', 700, 1400),
  ('ACH_PURE_M3_L5', 1500, 3000),
  ('ACH_PURE_M4_L1', 50, 100),
  ('ACH_PURE_M4_L2', 120, 250),
  ('ACH_PURE_M4_L3', 300, 600),
  ('ACH_PURE_M4_L4', 700, 1400),
  ('ACH_PURE_M4_L5', 1500, 3000),
  ('ACH_LB_L1', 50, 100),
  ('ACH_LB_L2', 100, 200),
  ('ACH_LB_L3', 200, 400),
  ('ACH_LB_L4', 350, 700),
  ('ACH_LB_L5', 550, 1100),
  ('ACH_LB_L6', 800, 1600),
  ('ACH_LB_L7', 1100, 2200),
  ('ACH_LB_L8', 1500, 3000),
  ('ACH_LB_L9', 2000, 4000),
  ('ACH_LB_L10', 2800, 5600),
  ('ACH_PROG_L1', 50, 100),
  ('ACH_PROG_L2', 100, 200),
  ('ACH_PROG_L3', 200, 400),
  ('ACH_PROG_L4', 350, 700),
  ('ACH_PROG_L5', 550, 1100),
  ('ACH_PROG_L6', 800, 1600),
  ('ACH_PROG_L7', 1100, 2200),
  ('ACH_PROG_L8', 1500, 3000),
  ('ACH_PROG_L9', 2000, 4000),
  ('ACH_PROG_L10', 2800, 5600),
  ('ACH_QUEST_L1', 50, 100),
  ('ACH_QUEST_L2', 100, 200),
  ('ACH_QUEST_L3', 200, 400),
  ('ACH_QUEST_L4', 350, 700),
  ('ACH_QUEST_L5', 550, 1100),
  ('ACH_QUEST_L6', 800, 1600),
  ('ACH_QUEST_L7', 1100, 2200),
  ('ACH_QUEST_L8', 1500, 3000),
  ('ACH_QUEST_L9', 2000, 4000),
  ('ACH_QUEST_L10', 2800, 5600),
  ('ACH_NIGHT_OWL', 100, 100),
  ('ACH_EARLY_BIRD', 100, 100),
  ('ACH_WEEKEND', 100, 200),
  ('ACH_NAMED', 50, 100),
  ('ACH_AVATAR', 50, 100),
  ('ACH_GLOBETROTTER', 50, 100),
  ('ACH_THEME_COLLECT', 500, 1000),
  ('ACH_RICH', 1000, 2000),
  ('ACH_LOYAL_FAN', 300, 600),
  ('ACH_SHOPAHOLIC', 300, 500),
  ('ACH_PURE_MASTER', 2000, 4000)
) AS v(id, new_coin, new_xp)
WHERE ad.id = v.id;

-- =====================================================================
-- Flatten the level XP curve to match src/lib/level.ts
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
    v_xp_for_level := floor(60 * power(v_level, 1.2));
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
