-- Fix: First Win / First Daily achievements never unlocked.
-- check_and_grant_achievements had no CASE branch for ACH_FIRST_WIN or
-- ACH_DAILY_FIRST, so these "play 1 game" achievements were never granted even
-- after completing practice and daily puzzles. Add the missing branches.

CREATE OR REPLACE FUNCTION public.check_and_grant_achievements(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_game_count    INTEGER;
  v_daily_count   INTEGER;
  v_perfect_count INTEGER;
  v_streak        INTEGER;
  v_level         INTEGER;
  v_coins         INTEGER;
  v_themes_owned  INTEGER;
  v_newly_unlocked JSONB := '[]'::JSONB;
  rec             RECORD;
  v_target        INTEGER;
  v_current       INTEGER;
BEGIN
  -- Gather current stats
  SELECT COUNT(*) INTO v_game_count    FROM user_game_history WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_daily_count   FROM user_game_history WHERE user_id = p_user_id AND mode = 'daily';
  SELECT COUNT(*) INTO v_perfect_count FROM user_game_history WHERE user_id = p_user_id AND mistakes = 0;
  SELECT COALESCE(current_streak, 0), COALESCE(level, 1)
    INTO v_streak, v_level
    FROM user_progression WHERE user_id = p_user_id;
  SELECT COALESCE(coins, 0) INTO v_coins FROM user_wallet WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_themes_owned
    FROM user_inventory ui
    JOIN shop_items si ON si.id = ui.item_id
    WHERE ui.user_id = p_user_id AND si.category = 'theme';

  FOR rec IN
    SELECT ad.id, ad.reward_coin, ad.reward_xp
    FROM achievements_definitions ad
    WHERE NOT EXISTS (
      SELECT 1 FROM user_achievements ua
      WHERE ua.user_id = p_user_id AND ua.achievement_id = ad.id
    )
  LOOP
    v_target  := NULL;
    v_current := NULL;

    CASE rec.id
      WHEN 'ACH_FIRST_WIN'   THEN v_target := 1;     v_current := v_game_count;
      WHEN 'ACH_DAILY_FIRST' THEN v_target := 1;     v_current := v_daily_count;
      WHEN 'ACH_PLAY_10'    THEN v_target := 10;    v_current := v_game_count;
      WHEN 'ACH_PLAY_50'    THEN v_target := 50;    v_current := v_game_count;
      WHEN 'ACH_PLAY_100'   THEN v_target := 100;   v_current := v_game_count;
      WHEN 'ACH_PLAY_500'   THEN v_target := 500;   v_current := v_game_count;
      WHEN 'ACH_PLAY_1000'  THEN v_target := 1000;  v_current := v_game_count;
      WHEN 'ACH_PLAY_5000'  THEN v_target := 5000;  v_current := v_game_count;
      WHEN 'ACH_DAILY_10'   THEN v_target := 10;    v_current := v_daily_count;
      WHEN 'ACH_DAILY_50'   THEN v_target := 50;    v_current := v_daily_count;
      WHEN 'ACH_PERFECT_5'  THEN v_target := 5;     v_current := v_perfect_count;
      WHEN 'ACH_PERFECT_25' THEN v_target := 25;    v_current := v_perfect_count;
      WHEN 'ACH_STREAK_3'   THEN v_target := 3;     v_current := v_streak;
      WHEN 'ACH_STREAK_7'   THEN v_target := 7;     v_current := v_streak;
      WHEN 'ACH_STREAK_14'  THEN v_target := 14;    v_current := v_streak;
      WHEN 'ACH_STREAK_30'  THEN v_target := 30;    v_current := v_streak;
      WHEN 'ACH_STREAK_60'  THEN v_target := 60;    v_current := v_streak;
      WHEN 'ACH_STREAK_100' THEN v_target := 100;   v_current := v_streak;
      WHEN 'ACH_STREAK_365' THEN v_target := 365;   v_current := v_streak;
      WHEN 'ACH_LEVEL_10'   THEN v_target := 10;    v_current := v_level;
      WHEN 'ACH_LEVEL_25'   THEN v_target := 25;    v_current := v_level;
      WHEN 'ACH_LEVEL_50'   THEN v_target := 50;    v_current := v_level;
      WHEN 'ACH_LEVEL_100'  THEN v_target := 100;   v_current := v_level;
      WHEN 'ACH_RICH'       THEN v_target := 10000; v_current := v_coins;
      WHEN 'ACH_THEME_COLLECT' THEN v_target := 5;  v_current := v_themes_owned;
      ELSE NULL;
    END CASE;

    IF v_target IS NOT NULL AND v_current >= v_target THEN
      INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
      VALUES (p_user_id, rec.id, now())
      ON CONFLICT DO NOTHING;

      IF rec.reward_coin > 0 THEN
        PERFORM grant_coins(p_user_id, rec.reward_coin, 'achievement_unlock', jsonb_build_object('achievement_id', rec.id));
      END IF;

      v_newly_unlocked := v_newly_unlocked || jsonb_build_array(rec.id);
    END IF;
  END LOOP;

  RETURN v_newly_unlocked;
END;
$function$;
