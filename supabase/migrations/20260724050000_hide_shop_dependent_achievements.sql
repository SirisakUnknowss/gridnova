-- Theme Collector and Shopaholic require buying items in the shop, but the
-- shop view exists in the codebase and isn't linked from anywhere in the
-- app's navigation — nothing mounts it. Both achievements are currently
-- unreachable, same as Globetrotter was before it got a country picker.
-- Hide them (existing `hidden` column, now actually respected by
-- getAchievementDefinitions()) until the shop is wired up and launched.

UPDATE achievements_definitions SET hidden = true WHERE id IN ('ACH_THEME_COLLECT', 'ACH_SHOPAHOLIC');
