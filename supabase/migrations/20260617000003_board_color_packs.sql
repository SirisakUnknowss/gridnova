-- Board Color Packs — new shop category "board_color"
-- CSS vars stored in unlock_value as JSON string
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS metadata JSONB;

INSERT INTO shop_items (id, name, description, category, price_coin, rarity, sort_order, available, metadata)
VALUES
  ('board_default',  'Default',       'Classic purple grid',        'board_color', 0,   'common',   100, true, '{"css_vars":{"--board-cell-bg":"rgba(108,92,231,0.06)","--board-cell-given":"rgba(108,92,231,0.18)","--board-highlight":"rgba(108,92,231,0.12)"}}'),
  ('board_ocean',    'Ocean Blue',    'Cool deep-sea vibes',        'board_color', 200, 'uncommon', 101, true, '{"css_vars":{"--board-cell-bg":"rgba(14,165,233,0.06)","--board-cell-given":"rgba(14,165,233,0.18)","--board-highlight":"rgba(14,165,233,0.12)"}}'),
  ('board_forest',   'Forest Green',  'Fresh and natural',          'board_color', 350, 'uncommon', 102, true, '{"css_vars":{"--board-cell-bg":"rgba(16,185,129,0.06)","--board-cell-given":"rgba(16,185,129,0.18)","--board-highlight":"rgba(16,185,129,0.12)"}}'),
  ('board_sakura',   'Sakura Pink',   'Cherry blossom aesthetic',   'board_color', 0,   'rare',     103, true, '{"premium":true,"css_vars":{"--board-cell-bg":"rgba(244,114,182,0.06)","--board-cell-given":"rgba(244,114,182,0.18)","--board-highlight":"rgba(244,114,182,0.12)"}}'),
  ('board_midnight', 'Midnight',      'Dark monochrome focus mode', 'board_color', 0,   'rare',     104, true, '{"premium":true,"css_vars":{"--board-cell-bg":"rgba(100,116,139,0.08)","--board-cell-given":"rgba(100,116,139,0.22)","--board-highlight":"rgba(100,116,139,0.14)"}}'),
  ('board_ember',    'Ember Orange',  'Warm sunset energy',         'board_color', 500, 'epic',     105, true, '{"css_vars":{"--board-cell-bg":"rgba(249,115,22,0.06)","--board-cell-given":"rgba(249,115,22,0.18)","--board-highlight":"rgba(249,115,22,0.12)"}}')
ON CONFLICT (id) DO UPDATE SET
  metadata    = EXCLUDED.metadata,
  price_coin  = EXCLUDED.price_coin,
  available   = EXCLUDED.available;

-- Add board_color_id to user_equipped (nullable)
ALTER TABLE user_equipped ADD COLUMN IF NOT EXISTS board_color_id TEXT REFERENCES shop_items(id);
