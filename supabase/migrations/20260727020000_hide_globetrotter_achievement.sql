-- The country picker added in 1.7.0 existed only to make Globetrotter
-- reachable — nothing else in the app reads profiles.country, so setting
-- it bought the player a medal and nothing more. Picker removed, so the
-- medal goes with it rather than sitting permanently unearnable again.
-- The profiles.country column is left in place; it holds real data for
-- anyone who already set one and dropping it would be irreversible.

UPDATE achievements_definitions SET hidden = true WHERE id = 'ACH_GLOBETROTTER';
