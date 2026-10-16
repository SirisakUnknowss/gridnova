-- Free avatar symbols are explicit choices; paid avatars must retain catalog ownership.

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

  IF p_avatar IS NOT NULL THEN
    IF jsonb_typeof(p_avatar) <> 'object' OR (select count(*) from jsonb_object_keys(p_avatar)) <> 1 THEN
      RAISE EXCEPTION 'invalid_avatar';
    END IF;
    IF p_avatar ? 'emoji' THEN
      IF NOT (p_avatar->>'emoji' = ANY(ARRAY['👤','🤖','🦸','🧙','🥷','🐱','🦊','🐼','🐯','🦁','🐸','🐧','🦉','🐙','👻','🧑','space_orbit-bunny'])) THEN
        RAISE EXCEPTION 'avatar_item_not_owned';
      END IF;
    ELSIF p_avatar ? 'item_id' THEN
      IF NOT EXISTS (select 1 from public.shop_items s where s.id=p_avatar->>'item_id' and s.category='avatar' and
        (s.price_coin=0 OR EXISTS(select 1 from public.user_inventory i where i.user_id=p_user_id and i.item_id=s.id))) THEN
        RAISE EXCEPTION 'avatar_item_not_owned';
      END IF;
    ELSE RAISE EXCEPTION 'invalid_avatar'; END IF;
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

REVOKE ALL ON FUNCTION public.equip_item(UUID,TEXT,TEXT,TEXT,JSONB) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.equip_item(UUID,TEXT,TEXT,TEXT,JSONB) TO service_role;
