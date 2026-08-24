-- Time Attack: 3 tiers with locked difficulty, one leaderboard per tier.
--
-- The puzzle is issued by the server and its solution never reaches the client,
-- because this mode has a public leaderboard whose headline metric is "seconds
-- left" — a number the client would otherwise be free to invent. issued_at is
-- written by Postgres, so it is also the only trustworthy anchor for enforcing
-- the tier's time limit.

CREATE TABLE time_attack_tickets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier         TEXT NOT NULL CHECK (tier IN ('sprint', 'rush', 'marathon')),
  difficulty   difficulty_enum NOT NULL,
  puzzle       CHAR(81) NOT NULL,
  solution     CHAR(81) NOT NULL,
  issued_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  consumed_at  TIMESTAMPTZ
);

CREATE INDEX idx_ta_tickets_user ON time_attack_tickets(user_id, issued_at DESC);

CREATE TABLE time_attack_leaderboard (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticket_id     UUID NOT NULL UNIQUE REFERENCES time_attack_tickets(id) ON DELETE CASCADE,
  tier          TEXT NOT NULL CHECK (tier IN ('sprint', 'rush', 'marathon')),
  difficulty    difficulty_enum NOT NULL,
  score         INTEGER NOT NULL,
  time_seconds  INTEGER NOT NULL,
  seconds_left  INTEGER NOT NULL,
  mistakes      INTEGER NOT NULL DEFAULT 0,
  hints_used    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ta_lb_tier_score ON time_attack_leaderboard(tier, score DESC, seconds_left DESC);
CREATE INDEX idx_ta_lb_user ON time_attack_leaderboard(user_id, tier);

ALTER TABLE time_attack_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_attack_leaderboard ENABLE ROW LEVEL SECURITY;

-- No client-facing policy on tickets at all: the row holds the solution, and
-- only the edge functions (service role, which bypasses RLS) ever read it.

CREATE POLICY "Anyone can read the time attack leaderboard"
  ON time_attack_leaderboard FOR SELECT
  USING (true);

-- Deliberately no INSERT/UPDATE policy — rows are written by submit-time-attack-score
-- under the service role after replaying the moves. A client cannot post a score.

-- =====================================================================
-- Leaderboard: best run per player per tier
-- =====================================================================
CREATE OR REPLACE FUNCTION get_time_attack_leaderboard(p_tier text, p_limit int DEFAULT 50)
RETURNS TABLE (
  rank          integer,
  user_id       uuid,
  display_name  text,
  username      text,
  avatar_url    text,
  score         integer,
  time_seconds  integer,
  seconds_left  integer,
  created_at    timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH best AS (
    SELECT DISTINCT ON (l.user_id)
           l.user_id, l.score, l.time_seconds, l.seconds_left, l.created_at
    FROM time_attack_leaderboard l
    WHERE l.tier = p_tier
    ORDER BY l.user_id, l.score DESC, l.seconds_left DESC, l.created_at
  )
  SELECT (rank() OVER (ORDER BY b.score DESC, b.seconds_left DESC, b.created_at))::integer,
         b.user_id, p.display_name, p.username, p.avatar_url,
         b.score, b.time_seconds, b.seconds_left, b.created_at
  FROM best b
  JOIN profiles p ON p.id = b.user_id
  ORDER BY b.score DESC, b.seconds_left DESC, b.created_at
  LIMIT p_limit;
$$;

-- Personal best for the tier picker on the detail screen.
CREATE OR REPLACE FUNCTION get_my_time_attack_best(p_tier text)
RETURNS TABLE (score integer, time_seconds integer, seconds_left integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT l.score, l.time_seconds, l.seconds_left
  FROM time_attack_leaderboard l
  WHERE l.tier = p_tier AND l.user_id = auth.uid()
  ORDER BY l.score DESC, l.seconds_left DESC
  LIMIT 1;
$$;
