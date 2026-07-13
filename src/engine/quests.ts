// =====================================================================
// Daily quests are defined and seeded SERVER-SIDE.
//
// The canonical quest catalog (ids, targets, rewards, trigger types) and
// the deterministic per-(user, date) sampling live in the Postgres
// function `seed_daily_quests`, and progress is computed by
// `recompute_daily_quests` — see
// supabase/migrations/*_dynamic_daily_quests.sql.
//
// The client just reads/renders rows from `user_daily_quests`
// (src/ui/views/quests.ts) and never generates quests itself, so there is
// a single source of truth. This module is intentionally empty.
// =====================================================================
export {};
