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
-- Achievements — tiered badge system (10 groups × 10 levels = 100)
-- =====================================================================
INSERT INTO achievements_definitions
  (id, name, description, tier, category, reward_coin, reward_xp, sort_order, badge_level)
VALUES
  ('ACH_PLAYER_L1','First Steps','Complete your first game','bronze','player',50,100,1,1),
  ('ACH_PLAYER_L2','Getting Started','Play 5 games','bronze','player',80,150,2,2),
  ('ACH_PLAYER_L3','Regular','Play 10 games','silver','player',100,200,3,3),
  ('ACH_PLAYER_L4','Dedicated','Play 25 games','silver','player',200,400,4,4),
  ('ACH_PLAYER_L5','Seasoned','Play 50 games','gold','player',300,600,5,5),
  ('ACH_PLAYER_L6','Veteran','Play 100 games','gold','player',500,1000,6,6),
  ('ACH_PLAYER_L7','Elite','Play 200 games','platinum','player',800,2000,7,7),
  ('ACH_PLAYER_L8','Champion','Play 500 games','platinum','player',1500,4000,8,8),
  ('ACH_PLAYER_L9','Master','Play 1000 games','diamond','player',3000,8000,9,9),
  ('ACH_PLAYER_L10','Legend','Play 2000 games','diamond','player',5000,15000,10,10),

  ('ACH_DAILY_L1','First Daily','Complete your first Daily Puzzle','bronze','daily',50,100,11,1),
  ('ACH_DAILY_L2','Daily Starter','Complete 5 Daily Puzzles','bronze','daily',100,200,12,2),
  ('ACH_DAILY_L3','Daily Habit','Complete 10 Daily Puzzles','silver','daily',150,300,13,3),
  ('ACH_DAILY_L4','Consistent','Complete 20 Daily Puzzles','silver','daily',250,500,14,4),
  ('ACH_DAILY_L5','Daily Regular','Complete 30 Daily Puzzles','gold','daily',400,800,15,5),
  ('ACH_DAILY_L6','Committed','Complete 50 Daily Puzzles','gold','daily',700,1500,16,6),
  ('ACH_DAILY_L7','Daily Devotee','Complete 75 Daily Puzzles','platinum','daily',1000,2500,17,7),
  ('ACH_DAILY_L8','Daily Expert','Complete 100 Daily Puzzles','platinum','daily',1500,4000,18,8),
  ('ACH_DAILY_L9','Daily Elite','Complete 200 Daily Puzzles','diamond','daily',3000,8000,19,9),
  ('ACH_DAILY_L10','Year of Puzzles','Complete 365 Daily Puzzles','diamond','daily',5000,15000,20,10),

  ('ACH_STREAK_L1','Trio','Keep a 3-day streak','bronze','streak',100,200,21,1),
  ('ACH_STREAK_L2','Five Days','Keep a 5-day streak','bronze','streak',150,300,22,2),
  ('ACH_STREAK_L3','Week Warrior','Keep a 7-day streak','silver','streak',300,500,23,3),
  ('ACH_STREAK_L4','Fortnight','Keep a 14-day streak','silver','streak',500,1000,24,4),
  ('ACH_STREAK_L5','Monthly','Keep a 30-day streak','gold','streak',1000,2000,25,5),
  ('ACH_STREAK_L6','Two Months','Keep a 60-day streak','gold','streak',1500,3000,26,6),
  ('ACH_STREAK_L7','Quarter Year','Keep a 90-day streak','platinum','streak',2500,5000,27,7),
  ('ACH_STREAK_L8','Half Year','Keep a 180-day streak','platinum','streak',4000,8000,28,8),
  ('ACH_STREAK_L9','Year Long','Keep a 365-day streak','diamond','streak',10000,20000,29,9),
  ('ACH_STREAK_L10','Unstoppable','Keep a 500-day streak','diamond','streak',20000,50000,30,10),

  ('ACH_FLAWLESS_L1','Clean Win','Win 1 game without mistakes','bronze','flawless',50,100,31,1),
  ('ACH_FLAWLESS_L2','Flawless Start','Win 5 games without mistakes','bronze','flawless',80,200,32,2),
  ('ACH_FLAWLESS_L3','Clean Player','Win 10 games without mistakes','silver','flawless',150,300,33,3),
  ('ACH_FLAWLESS_L4','Precision','Win 20 games without mistakes','silver','flawless',250,500,34,4),
  ('ACH_FLAWLESS_L5','Sharp Mind','Win 30 games without mistakes','gold','flawless',400,800,35,5),
  ('ACH_FLAWLESS_L6','Perfectionist','Win 50 games without mistakes','gold','flawless',600,1500,36,6),
  ('ACH_FLAWLESS_L7','Flawless Expert','Win 75 games without mistakes','platinum','flawless',1000,2500,37,7),
  ('ACH_FLAWLESS_L8','Untouchable','Win 100 games without mistakes','platinum','flawless',1500,4000,38,8),
  ('ACH_FLAWLESS_L9','Error-Free','Win 150 games without mistakes','diamond','flawless',3000,8000,39,9),
  ('ACH_FLAWLESS_L10','Perfect Master','Win 200 games without mistakes','diamond','flawless',5000,15000,40,10),

  ('ACH_SPEED_L1','Quick Draw','Beat Easy in under 3 min (Daily)','bronze','speedster',150,300,41,1),
  ('ACH_SPEED_L2','Lightning Easy','Beat Easy in under 2 min (Daily)','bronze','speedster',250,500,42,2),
  ('ACH_SPEED_L3','Fast Mind','Beat Medium in under 5 min (Daily)','silver','speedster',400,800,43,3),
  ('ACH_SPEED_L4','Turbo Medium','Beat Medium in under 3 min (Daily)','silver','speedster',700,1500,44,4),
  ('ACH_SPEED_L5','Speed Solver','Beat Hard in under 10 min','gold','speedster',1000,2500,45,5),
  ('ACH_SPEED_L6','Hard Rusher','Beat Hard in under 7 min','gold','speedster',1800,4000,46,6),
  ('ACH_SPEED_L7','Lightning','Beat Hard-Expert in under 15 min','platinum','speedster',2500,6000,47,7),
  ('ACH_SPEED_L8','Expert Rusher','Beat Hard-Expert in under 10 min','platinum','speedster',4000,8000,48,8),
  ('ACH_SPEED_L9','Flash','Beat Expert in under 25 min','diamond','speedster',5000,12000,49,9),
  ('ACH_SPEED_L10','Godspeed','Beat Expert in under 18 min','diamond','speedster',10000,25000,50,10),

  ('ACH_PURE_L1','No Training Wheels','Win Easy without hints ×1','bronze','pure',100,200,51,1),
  ('ACH_PURE_L2','Self-Reliant','Win Easy without hints ×5','bronze','pure',200,400,52,2),
  ('ACH_PURE_L3','Medium Pure','Win Medium without hints ×1','silver','pure',300,600,53,3),
  ('ACH_PURE_L4','Medium Master','Win Medium without hints ×5','silver','pure',600,1200,54,4),
  ('ACH_PURE_L5','Pure Skill','Win Hard without hints ×1','gold','pure',1000,2000,55,5),
  ('ACH_PURE_L6','Hard Pure','Win Hard without hints ×5','gold','pure',2000,4000,56,6),
  ('ACH_PURE_L7','Genius','Win Expert without hints ×1','platinum','pure',3000,6000,57,7),
  ('ACH_PURE_L8','Expert Pure','Win Expert without hints ×3','platinum','pure',5000,10000,58,8),
  ('ACH_PURE_L9','Untainted','Win Expert without hints ×5','diamond','pure',8000,18000,59,9),
  ('ACH_PURE_L10','Nightmare Mode','Win Expert with no hints and no mistakes','diamond','pure',15000,30000,60,10),

  ('ACH_LB_L1','Rising Star','Reach Top 100 once','bronze','leaderboard',300,500,61,1),
  ('ACH_LB_L2','Top 100 Regular','Reach Top 100 five times','bronze','leaderboard',500,1000,62,2),
  ('ACH_LB_L3','Top 50','Reach Top 50 once','silver','leaderboard',700,1500,63,3),
  ('ACH_LB_L4','Top 50 Regular','Reach Top 50 three times','silver','leaderboard',1200,2500,64,4),
  ('ACH_LB_L5','Top 10','Reach Top 10 once','gold','leaderboard',2000,4000,65,5),
  ('ACH_LB_L6','Top 10 Regular','Reach Top 10 three times','gold','leaderboard',3000,6000,66,6),
  ('ACH_LB_L7','Podium','Reach Top 3 once','platinum','leaderboard',4000,8000,67,7),
  ('ACH_LB_L8','Podium Regular','Reach Top 3 three times','platinum','leaderboard',6000,12000,68,8),
  ('ACH_LB_L9','Champion','Reach #1 once','diamond','leaderboard',8000,15000,69,9),
  ('ACH_LB_L10','Daily Champion','Reach #1 five times','diamond','leaderboard',15000,30000,70,10),

  ('ACH_PROG_L1','Apprentice','Reach level 3','bronze','progression',100,200,71,1),
  ('ACH_PROG_L2','Learner','Reach level 5','bronze','progression',200,400,72,2),
  ('ACH_PROG_L3','Adept','Reach level 10','silver','progression',500,1000,73,3),
  ('ACH_PROG_L4','Skilled','Reach level 20','silver','progression',800,1600,74,4),
  ('ACH_PROG_L5','Expert','Reach level 30','gold','progression',1200,2500,75,5),
  ('ACH_PROG_L6','Advanced','Reach level 40','gold','progression',2000,4000,76,6),
  ('ACH_PROG_L7','Master','Reach level 50','platinum','progression',3000,6000,77,7),
  ('ACH_PROG_L8','Elite','Reach level 60','platinum','progression',5000,10000,78,8),
  ('ACH_PROG_L9','Grand Master','Reach level 75','diamond','progression',8000,15000,79,9),
  ('ACH_PROG_L10','Grandmaster','Reach level 100','diamond','progression',15000,30000,80,10),

  ('ACH_QUEST_L1','Quest Starter','Complete 1 quest','bronze','quest',50,100,81,1),
  ('ACH_QUEST_L2','Quest Seeker','Complete 5 quests','bronze','quest',100,200,82,2),
  ('ACH_QUEST_L3','Quest Regular','Complete 10 quests','silver','quest',200,400,83,3),
  ('ACH_QUEST_L4','Quest Addict','Complete 20 quests','silver','quest',400,800,84,4),
  ('ACH_QUEST_L5','Quest Veteran','Complete 30 quests','gold','quest',600,1500,85,5),
  ('ACH_QUEST_L6','Quest Master','Complete 50 quests','gold','quest',1000,2500,86,6),
  ('ACH_QUEST_L7','Quest Expert','Complete 75 quests','platinum','quest',1500,4000,87,7),
  ('ACH_QUEST_L8','Quest Champion','Complete 100 quests','platinum','quest',2500,6000,88,8),
  ('ACH_QUEST_L9','Quest Legend','Complete 150 quests','diamond','quest',4000,10000,89,9),
  ('ACH_QUEST_L10','Quest God','Complete 200 quests','diamond','quest',7000,20000,90,10),

  ('ACH_NIGHT_OWL','Night Owl','Play between 23:00 and 04:00','bronze','special',100,100,91,0),
  ('ACH_EARLY_BIRD','Early Bird','Play between 05:00 and 07:00','bronze','special',100,100,92,0),
  ('ACH_WEEKEND','Weekend Warrior','Play on both Saturday and Sunday','bronze','special',100,200,93,0),
  ('ACH_NAMED','Identified','Set a custom display name','bronze','special',50,100,94,0),
  ('ACH_AVATAR','Self-Portrait','Choose a custom avatar','bronze','special',50,100,95,0),
  ('ACH_GLOBETROTTER','Globetrotter','Set your country in profile','bronze','special',50,100,96,0),
  ('ACH_THEME_COLLECT','Theme Collector','Own 5 or more themes','silver','special',500,1000,97,0),
  ('ACH_RICH','Coin Hoarder','Hold 10,000 coins at once','gold','special',1000,2000,98,0),
  ('ACH_LOYAL_FAN','Loyal Fan','Play on 30 distinct calendar days','silver','special',300,600,99,0),
  ('ACH_SHOPAHOLIC','Shopaholic','Own 10 or more items in your inventory','silver','special',300,500,100,0);
