# GridNova staging handoff — 2026-10-06

## Current staging status (supersedes older pending notes below)
- UI alignment follow-up: desktop cards/settings/legal content share the available width, Daily stats use two equal columns, Play buttons no longer stretch vertically outside horizontal action rows. Reminder now opens sign-in for guests and reports missing setup accurately. Staging web builds deliberately omit the legacy production VAPID key until a separate sender/key/schedule is configured. Subscription database errors are checked, and absent service workers return without hanging. Push delivery remains unavailable on staging; this is not a completed notification setup.
- UI follow-up: desktop frame uses viewport height with width 520–760px instead of 430×900; shared action buttons/tabs and What's New use theme surfaces, borders and hover colors. Guest identity now rejects paid/Rare avatar values in stored or newly saved data; guest boot/signout clears member inventory/equipment. Regression suite: 56 tests passed, typecheck/lint passed. Local guest clicking Coral Keeper opens unlock dialog without equipping.
- Isolated project `xrtgcxofjisqaigaaboy` is ready. Localhost and deployed staging JavaScript were both checked and contain only its Supabase URL.
- Web deployment `37445684473` succeeded for `3e47e80`; https://staging.gridnova.pages.dev is updated. GitHub Environment staging frontend secrets use the new project. Production secrets and main branch were not edited.
- Schema/catalog, ten player/required Edge Functions, Auth redirects, 30 fresh Daily puzzles, signup/email confirmation/login, purchases/prerequisite rejection/duplicate rejection, equipment and Collection, Practice and Time Attack submissions verified on the new project. No production player data copied.
- 54 tests, typecheck, lint and build passed; CI run `37445157129` passed.
- Owner passed staging access gate. Live staging member login, 5,000-coin themes, 3,500-coin Rare avatars, prerequisite-disabled buttons, successful Origami Sage purchase (8,304 → 4,804 coins), and My Collection verified; purchase row confirmed in the new staging database. Found and fixed shop balance animation rendering icon HTML as text. Daily generation cron is not configured; seeded puzzles last through November 4. See STAGING_SETUP.md for bootstrap exclusions and telemetry limitations.
- INCIDENT: legacy backend workflow run `37445157144` targeted production via fallback secrets. Logs show only `20261006093112_staging_access_hardening.sql` applied in this run; Edge Function inspection shows generator changed, other functions already updated in the previous run. Rare catalog migration already existed. No rollback attempted; do not alter production without explicit owner direction. Backend workflow now skips staging entirely to prevent recurrence and unsafe CLI replay of consolidated migrations.
- Production impact: read-only cron inspection confirmed its active generator job supplies no Authorization header. The new generator therefore rejects scheduled calls. Owner authorization was requested to restore only the generator from `61dd5fa`; do not proceed until explicitly authorized. The applied migration restricts purchase/equip RPCs to service_role and fixes increment_view search_path; it does not delete player records.
- Current local branch stays `codex/redesign-game`; only staging was pushed. User's untracked GRIDNOVA_OVERVIEW.md remains untouched.

## Earlier redesign notes

## Working state
- Local branch: `codex/redesign-game`; backup/deployment target: `staging` per AGENTS.md. Do not push main.
- App version remains 1.12.2. No production release authorized.
- Local preview: http://127.0.0.1:5173/ . Start with `npm run dev -- --host 127.0.0.1 --port 5173` if needed.

## Completed
- Space/fantasy assets, generated theme backgrounds, avatars, and controls integrated. Originals/prompts/QA in assets/space; optimized runtime art in src/images/space.
- Theme tokens apply throughout UI; light base + white palettes; Neon Night renamed Sky Citadel (stable theme_neon ID).
- Desktop uses centered mobile portrait frame and centered navigation. Shared back buttons, themed headers/tabs, game controls, pause interaction blocking.
- Daily card uses centered calendar and simplified copy. Calendar is theme-tinted; full-width scene background now positioned at 28% vertically to reveal Classic characters.
- Guest names, rename, avatar picker. Available avatars sort first; locked avatars gray with tiny corner lock. Clicking opens unlock popup; Go to Shop selects Avatars and scrolls/highlights the exact item.
- Shop: paid themes shown at 5,000 coins in local dev preview; eleven new themed Rare avatars at 3,500 coins. Matching paid theme must be owned before avatar purchase; free themes satisfy prerequisite.
- Local test purchase controls REMOVED at user's request. No simulated ownership/coins enter account state.
- Profile → My Collection: free/owned Themes and Avatars, Equip and Equipped. Visit Shop uses theme-aware fantasy button.
- Medals Collection group: first paid purchase, five paid items, all Rare themes, all Rare avatars. Progress/unlocked computed from server inventory and available shop catalog; excludes free items and duplicates. No new coin/XP rewards or DB medal rows granted.

## Earlier pending server work (superseded above)
- NOT applied: supabase/migrations/20261005000000_theme_prices_rare_avatars.sql (paid theme prices, Sky Citadel name, Rare avatar catalog).
- NOT deployed: supabase/functions/purchase-item/index.ts prerequisite ownership check.
- Staging SHARES PRODUCTION DB. Previous question to authorize DB migration had no reply. Do not apply migration or deploy backend without resolving this scope.
- Local preview merges missing Rare items with catalogPending; actual member purchases are disabled until catalog updated, avoiding old-price buys. Production catalog remains server-driven.
- Collection medals are inventory-derived display achievements. If persisted achievement history / reward payouts / share-card inclusion is desired, add server definitions and idempotent granting via an append-only migration.

## Verification
- TypeScript and ESLint pass after latest edits.
- 54 tests pass across 8 files (includes collection-medal boundaries and Rare catalog).
- Production build passed using temporary `dist-space-preview` (removed afterward). Default dist may have Windows locked files.
- Browser checked Profile → My Collection (free guest catalog) and Medals → Collection.
- Screenshots: assets/space/qa/my-collection.jpg and collection-medals.jpg.
- Latest background-position and avatar sorting edits typechecked/linted; visually confirm on next run across all themes/mobile heights.

## Resume checklist
1. Check git status/branch; read AGENTS.md.
2. Confirm latest Classic calendar framing, small gray lock avatars, unlock-popup Shop scroll, Collection equip behavior for a member.
3. Review all theme backgrounds at calendar card crop; adjust theme-specific focal points if necessary.
4. Resolve shared-production DB approval before backend/catalog changes. Never test real coin purchases on shared DB casually.
5. Confirm staging deployment in GitHub Actions after push; refer to the incident above before making any claims about production.

## User preference reminders
English game UI; Thai chat. Light themed colors and white, no unrelated purple hover. Fantasy buttons balanced to text. No waving mascot. Exactly four bottom nav tabs. Generated art must match theme names. Keep GRIDNOVA_OVERVIEW.md (existing unrelated untracked user file) untouched.
