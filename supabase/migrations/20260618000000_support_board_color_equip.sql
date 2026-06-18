-- Migration to update equip_item DB function to support board_color_id

CREATE OR REPLACE FUNCTION public.equip_item(
  p_user_id UUID,
  p_theme_id TEXT DEFAULT NULL,
  p_background_id TEXT DEFAULT NULL,
  p_board_color_id TEXT DEFAULT NULL,
  p_avatar JSONB DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owned BOOLEAN;
BEGIN
  -- Verify caller
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- 1. Verify theme ownership if provided
  IF p_theme_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM shop_items WHERE id = p_theme_id AND price_coin = 0
    ) OR EXISTS (
      SELECT 1 FROM user_inventory WHERE user_id = p_user_id AND item_id = p_theme_id
    ) INTO v_owned;

    IF NOT v_owned THEN
      RAISE EXCEPTION 'theme_not_owned';
    END IF;
  END IF;

  -- 2. Verify background ownership if provided
  IF p_background_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM shop_items WHERE id = p_background_id AND price_coin = 0
    ) OR EXISTS (
      SELECT 1 FROM user_inventory WHERE user_id = p_user_id AND item_id = p_background_id
    ) INTO v_owned;

    IF NOT v_owned THEN
      RAISE EXCEPTION 'background_not_owned';
    END IF;
  END IF;

  -- 3. Verify board color ownership if provided
  IF p_board_color_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM shop_items WHERE id = p_board_color_id AND price_coin = 0
    ) OR EXISTS (
      SELECT 1 FROM user_inventory WHERE user_id = p_user_id AND item_id = p_board_color_id
    ) INTO v_owned;

    IF NOT v_owned THEN
      RAISE EXCEPTION 'board_color_not_owned';
    END IF;
  END IF;

  -- 4. Verify avatar items ownership if provided
  IF p_avatar IS NOT NULL THEN
    DECLARE
      v_val TEXT;
    BEGIN
      FOR v_val IN SELECT value FROM jsonb_each_text(p_avatar) LOOP
        IF v_val IS NOT NULL AND v_val <> '' THEN
          SELECT EXISTS (
            SELECT 1 FROM shop_items WHERE id = v_val AND price_coin = 0
          ) OR EXISTS (
            SELECT 1 FROM user_inventory WHERE user_id = p_user_id AND item_id = v_val
          ) INTO v_owned;

          IF NOT v_owned THEN
            RAISE EXCEPTION 'avatar_item_not_owned: %', v_val;
          END IF;
        END IF;
      END LOOP;
    END;
  END IF;

  -- 5. Update or Insert user_equipped
  INSERT INTO user_equipped (user_id, theme_id, background_id, board_color_id, avatar, updated_at)
  VALUES (
    p_user_id,
    p_theme_id,
    p_background_id,
    p_board_color_id,
    COALESCE(p_avatar, '{}'::jsonb),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    theme_id = COALESCE(p_theme_id, user_equipped.theme_id),
    background_id = COALESCE(p_background_id, user_equipped.background_id),
    board_color_id = COALESCE(p_board_color_id, user_equipped.board_color_id),
    avatar = COALESCE(p_avatar, user_equipped.avatar),
    updated_at = now();

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.equip_item TO authenticated;
