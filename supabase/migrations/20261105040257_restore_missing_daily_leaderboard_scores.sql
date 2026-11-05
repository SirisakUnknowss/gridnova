-- Restore only completed Daily games with a matching stored puzzle and score.
DO $guard$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'gridnova_production_scheduler') THEN
    RAISE EXCEPTION 'Daily leaderboard recovery is production only';
  END IF;
END $guard$;

INSERT INTO public.daily_leaderboard
  (date, user_id, score, time_seconds, mistakes, hints_used, submitted_at)
SELECT DISTINCT ON (h.daily_date, h.user_id)
  h.daily_date, h.user_id, h.score, h.time_seconds, h.mistakes,
  h.hints_used, h.completed_at
FROM public.user_game_history h
JOIN public.daily_puzzles p ON p.date = h.daily_date AND p.difficulty = h.level
WHERE h.mode = 'daily'
  AND h.daily_date BETWEEN DATE '2026-10-20' AND DATE '2026-11-05'
  AND h.score = GREATEST(100,
    (CASE p.difficulty::text
      WHEN 'easy' THEN 1000 WHEN 'easy-medium' THEN 1500
      WHEN 'medium' THEN 2000 WHEN 'medium-hard' THEN 2800
      WHEN 'hard' THEN 3500 WHEN 'hard-expert' THEN 4200
      WHEN 'expert' THEN 5000 END)
    - h.time_seconds * 2 - h.mistakes * 100 - h.hints_used * 300
    + CASE WHEN h.mistakes = 0 THEN 500 ELSE 0 END
    + CASE WHEN h.hints_used = 0 THEN 300 ELSE 0 END)
  AND h.time_seconds > 0
  AND h.mistakes >= 0
  AND h.hints_used BETWEEN 0 AND 3
ORDER BY h.daily_date, h.user_id, h.completed_at
ON CONFLICT (date, user_id) DO NOTHING;
