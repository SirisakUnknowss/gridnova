BEGIN;

UPDATE public.shop_items SET price_coin = 5000
WHERE category = 'theme' AND price_coin > 0;

UPDATE public.shop_items SET name = 'Sky Citadel', description = 'A serene city above the clouds'
WHERE id = 'theme_neon';

INSERT INTO public.shop_items
  (id, name, description, category, price_coin, rarity, unlock_type, sort_order, available, metadata)
VALUES
  ('avatar_rare_classic', 'Astral Guardian', 'Matches Classic', 'avatar', 3500, 'rare', 'shop', 200, true, '{"theme_id": "theme_classic"}'::jsonb),
  ('avatar_rare_paper', 'Origami Sage', 'Matches Paper', 'avatar', 3500, 'rare', 'shop', 201, true, '{"theme_id": "theme_paper"}'::jsonb),
  ('avatar_rare_dark', 'Moon Warden', 'Matches Dark Mode', 'avatar', 3500, 'rare', 'shop', 202, true, '{"theme_id": "theme_dark"}'::jsonb),
  ('avatar_rare_pastel', 'Cloud Sprite', 'Matches Pastel Dream', 'avatar', 3500, 'rare', 'shop', 203, true, '{"theme_id": "theme_pastel"}'::jsonb),
  ('avatar_rare_ocean', 'Coral Keeper', 'Matches Ocean', 'avatar', 3500, 'rare', 'shop', 204, true, '{"theme_id": "theme_ocean"}'::jsonb),
  ('avatar_rare_forest', 'Grove Ranger', 'Matches Forest', 'avatar', 3500, 'rare', 'shop', 205, true, '{"theme_id": "theme_forest"}'::jsonb),
  ('avatar_rare_sunset', 'Dawn Phoenix', 'Matches Sunset', 'avatar', 3500, 'rare', 'shop', 206, true, '{"theme_id": "theme_sunset"}'::jsonb),
  ('avatar_rare_neon', 'Citadel Sentinel', 'Matches Sky Citadel', 'avatar', 3500, 'rare', 'shop', 207, true, '{"theme_id": "theme_neon"}'::jsonb),
  ('avatar_rare_sakura', 'Blossom Kitsune', 'Matches Sakura', 'avatar', 3500, 'rare', 'shop', 208, true, '{"theme_id": "theme_sakura"}'::jsonb),
  ('avatar_rare_thai', 'Lotus Guardian', 'Matches Thai Heritage', 'avatar', 3500, 'rare', 'shop', 209, true, '{"theme_id": "theme_thai"}'::jsonb),
  ('avatar_rare_mono', 'Marble Oracle', 'Matches Mono Pro', 'avatar', 3500, 'rare', 'shop', 210, true, '{"theme_id": "theme_mono"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  price_coin = EXCLUDED.price_coin, rarity = EXCLUDED.rarity,
  metadata = EXCLUDED.metadata, available = EXCLUDED.available;

COMMIT;
