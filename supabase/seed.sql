-- =====================================================================
-- Seed data — runs after `supabase db reset`
-- =====================================================================

-- Free starter items
INSERT INTO shop_items (id, category, subcategory, name, description, price_coin, rarity, unlock_type, sort_order) VALUES
  ('theme_classic', 'theme', NULL, 'Classic', 'The original theme', 0, 'common', 'free', 1),
  ('theme_paper', 'theme', NULL, 'Paper', 'Warm paper-like background', 0, 'common', 'free', 2),
  ('theme_dark', 'theme', NULL, 'Dark Mode', 'Easy on the eyes', 0, 'common', 'level', 3),
  ('theme_pastel', 'theme', NULL, 'Pastel Dream', 'Soft pink and blue', 200, 'common', 'shop', 4),
  ('theme_ocean', 'theme', NULL, 'Ocean', 'Cool blue tones', 300, 'common', 'shop', 5),
  ('theme_forest', 'theme', NULL, 'Forest', 'Natural green tones', 300, 'common', 'shop', 6),
  ('theme_sunset', 'theme', NULL, 'Sunset', 'Orange and purple', 400, 'rare', 'shop', 7),
  ('theme_neon', 'theme', NULL, 'Neon Night', 'Cyberpunk vibes', 500, 'rare', 'shop', 8),
  ('theme_sakura', 'theme', NULL, 'Sakura', 'Cherry blossom pink', 600, 'epic', 'shop', 9),
  ('theme_thai', 'theme', NULL, 'Thai Heritage', 'Gold and red traditional', 800, 'epic', 'shop', 10),
  ('theme_mono', 'theme', NULL, 'Mono Pro', 'Premium black and white', 1000, 'epic', 'shop', 11);

UPDATE shop_items SET unlock_value = '3' WHERE id = 'theme_dark';

-- Backgrounds (subset)
INSERT INTO shop_items (id, category, name, price_coin, rarity, unlock_type, sort_order) VALUES
  ('bg_default', 'background', 'Default Gradient', 0, 'common', 'free', 1),
  ('bg_blank_white', 'background', 'Blank White', 0, 'common', 'free', 2),
  ('bg_solid_navy', 'background', 'Navy Solid', 100, 'common', 'shop', 3),
  ('bg_solid_forest', 'background', 'Forest Solid', 100, 'common', 'shop', 4),
  ('bg_pattern_dots', 'background', 'Dot Pattern', 200, 'common', 'shop', 5),
  ('bg_pattern_waves', 'background', 'Wavy Pattern', 200, 'common', 'shop', 6),
  ('bg_photo_mountain', 'background', 'Mountain Photo', 400, 'rare', 'shop', 7),
  ('bg_photo_space', 'background', 'Space Photo', 400, 'rare', 'shop', 8),
  ('bg_anim_rain', 'background', 'Animated Rain', 1000, 'epic', 'shop', 9);

-- Avatar items (sample subset)
INSERT INTO shop_items (id, category, subcategory, name, price_coin, rarity, unlock_type, sort_order) VALUES
  ('avatar_face_happy', 'avatar', 'face', 'Happy Face', 0, 'common', 'free', 1),
  ('avatar_face_cool', 'avatar', 'face', 'Cool Face', 50, 'common', 'shop', 2),
  ('avatar_face_nerd', 'avatar', 'face', 'Nerd Face', 200, 'rare', 'shop', 3),
  ('avatar_face_lion', 'avatar', 'face', 'Lion Face', 500, 'epic', 'shop', 4),

  ('avatar_hat_cap', 'avatar', 'hat', 'Cap', 100, 'common', 'shop', 1),
  ('avatar_hat_top', 'avatar', 'hat', 'Top Hat', 200, 'rare', 'shop', 2),
  ('avatar_hat_crown', 'avatar', 'hat', 'Crown', 800, 'epic', 'shop', 3),

  ('avatar_pet_dog', 'avatar', 'pet', 'Dog', 300, 'common', 'shop', 1),
  ('avatar_pet_cat', 'avatar', 'pet', 'Cat', 300, 'common', 'shop', 2),
  ('avatar_pet_dragon', 'avatar', 'pet', 'Dragon', 2000, 'epic', 'shop', 3),

  ('avatar_frame_bronze', 'avatar', 'frame', 'Bronze Frame', 200, 'common', 'shop', 1),
  ('avatar_frame_gold', 'avatar', 'frame', 'Gold Frame', 600, 'rare', 'shop', 2),
  ('avatar_frame_rainbow', 'avatar', 'frame', 'Rainbow Frame', 1500, 'epic', 'shop', 3);

-- Consumables
INSERT INTO shop_items (id, category, name, description, price_coin, rarity, unlock_type, sort_order) VALUES
  ('item_streak_freeze', 'consumable', 'Streak Freeze', 'Protects your streak for 1 day', 200, 'common', 'shop', 1),
  ('item_hint_pack', 'consumable', 'Hint Pack +3', 'Adds 3 hints to next game', 100, 'common', 'shop', 2),
  ('item_coin_boost_2x', 'consumable', 'Coin Boost 2× (24h)', 'Double all coin earnings for 24 hours', 500, 'rare', 'shop', 3);

-- =====================================================================
-- Achievements — tiered badge system (8 groups × 5 levels + 8 special)
-- =====================================================================
INSERT INTO achievements_definitions
  (id, name, description, tier, category, reward_coin, reward_xp, sort_order, badge_level)
VALUES
  ('ACH_PLAYER_L1','First Steps','Complete your first game','bronze','player',50,100,1,1),
  ('ACH_PLAYER_L2','Beginner','Play 10 games','silver','player',100,200,2,2),
  ('ACH_PLAYER_L3','Regular','Play 50 games','gold','player',300,500,3,3),
  ('ACH_PLAYER_L4','Veteran','Play 200 games','platinum','player',800,1500,4,4),
  ('ACH_PLAYER_L5','Master','Play 1000 games','diamond','player',3000,8000,5,5),

  ('ACH_DAILY_L1','First Daily','Complete your first Daily Puzzle','bronze','daily',50,100,11,1),
  ('ACH_DAILY_L2','Daily Habit','Complete 10 Daily Puzzles','silver','daily',150,300,12,2),
  ('ACH_DAILY_L3','Daily Regular','Complete 30 Daily Puzzles','gold','daily',400,800,13,3),
  ('ACH_DAILY_L4','Daily Devotee','Complete 100 Daily Puzzles','platinum','daily',1000,2000,14,4),
  ('ACH_DAILY_L5','Year of Puzzles','Complete 365 Daily Puzzles','diamond','daily',5000,15000,15,5),

  ('ACH_STREAK_L1','Trio','Keep a 3-day streak','bronze','streak',100,200,21,1),
  ('ACH_STREAK_L2','Week Warrior','Keep a 7-day streak','silver','streak',300,500,22,2),
  ('ACH_STREAK_L3','Monthly','Keep a 30-day streak','gold','streak',1000,2000,23,3),
  ('ACH_STREAK_L4','Centurion','Keep a 100-day streak','platinum','streak',3000,8000,24,4),
  ('ACH_STREAK_L5','Year Long','Keep a 365-day streak','diamond','streak',10000,30000,25,5),

  ('ACH_FLAWLESS_L1','Flawless Start','Win 5 games without mistakes','bronze','flawless',50,100,31,1),
  ('ACH_FLAWLESS_L2','Clean Player','Win 10 games without mistakes','silver','flawless',100,200,32,2),
  ('ACH_FLAWLESS_L3','Precision','Win 20 games without mistakes','gold','flawless',200,400,33,3),
  ('ACH_FLAWLESS_L4','Perfectionist','Win 50 games without mistakes','platinum','flawless',300,600,34,4),
  ('ACH_FLAWLESS_L5','Untouchable','Win 100 games without mistakes','diamond','flawless',500,1000,35,5),

  ('ACH_SPEED_L1','Quick Draw','Beat Easy in under 3 minutes (Daily only)','bronze','speedster',150,300,41,1),
  ('ACH_SPEED_L2','Fast Mind','Beat Medium in under 5 minutes (Daily only)','silver','speedster',400,800,42,2),
  ('ACH_SPEED_L3','Speed Solver','Beat Hard in under 10 minutes','gold','speedster',1000,2000,43,3),
  ('ACH_SPEED_L4','Lightning','Beat Hard-Expert in under 15 minutes','platinum','speedster',2000,5000,44,4),
  ('ACH_SPEED_L5','Flash','Beat Expert in under 25 minutes','diamond','speedster',5000,15000,45,5),

  ('ACH_PURE_L1','No Training Wheels','Win Easy without hints','bronze','pure',100,200,51,1),
  ('ACH_PURE_L2','Self-Reliant','Win Medium without hints','silver','pure',200,400,52,2),
  ('ACH_PURE_L3','Pure Skill','Win Hard without hints','gold','pure',600,1500,53,3),
  ('ACH_PURE_L4','Genius','Win Expert without hints','platinum','pure',2000,5000,54,4),
  ('ACH_PURE_L5','Nightmare Mode','Win Expert with no hints and no mistakes','diamond','pure',5000,15000,55,5),

  ('ACH_LB_L1','Rising Star','Reach Top 100 on Daily Leaderboard once','bronze','leaderboard',300,500,61,1),
  ('ACH_LB_L2','Top 50','Reach Top 50 three times','silver','leaderboard',500,1000,62,2),
  ('ACH_LB_L3','Top 10','Reach Top 10 three times','gold','leaderboard',1500,3000,63,3),
  ('ACH_LB_L4','Podium','Reach Top 3 three times','platinum','leaderboard',3000,8000,64,4),
  ('ACH_LB_L5','Daily Champion','Reach #1 five times','diamond','leaderboard',5000,20000,65,5),

  ('ACH_PROG_L1','Apprentice','Reach level 5','bronze','progression',200,400,71,1),
  ('ACH_PROG_L2','Adept','Reach level 10','silver','progression',500,1000,72,2),
  ('ACH_PROG_L3','Expert','Reach level 25','gold','progression',1500,3000,73,3),
  ('ACH_PROG_L4','Master','Reach level 50','platinum','progression',5000,10000,74,4),
  ('ACH_PROG_L5','Grandmaster','Reach level 100','diamond','progression',15000,50000,75,5),

  ('ACH_NIGHT_OWL','Night Owl','Play between 23:00 and 04:00','bronze','special',100,100,81,0),
  ('ACH_EARLY_BIRD','Early Bird','Play between 05:00 and 07:00','bronze','special',100,100,82,0),
  ('ACH_WEEKEND','Weekend Warrior','Play on both Saturday and Sunday','bronze','special',100,200,83,0),
  ('ACH_NAMED','Identified','Set a custom display name','bronze','special',50,100,84,0),
  ('ACH_AVATAR','Self-Portrait','Choose a custom avatar','bronze','special',50,100,85,0),
  ('ACH_GLOBETROTTER','Globetrotter','Set your country in profile','bronze','special',50,100,86,0),
  ('ACH_THEME_COLLECT','Theme Collector','Own 5 or more themes','silver','special',500,1000,87,0),
  ('ACH_RICH','Coin Hoarder','Hold 10,000 coins at once','gold','special',1000,2000,88,0);
