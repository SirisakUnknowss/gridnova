# GridNova staging handoff — 2026-10-06

## Current staging status (supersedes older pending notes below)
- Avatar Frames (2026-10-07): four permanent coin items (Star Halo 800, Ocean Bubbles 1200, Sakura Bloom 1600, Royal Orbit 2000). Frames tab in Shop/My Collection, non-mutating preview, confirmation purchase, independent frame equip/remove, Home/Profile display and login persistence. New append-only migration adds frame_id plus ownership trigger and authenticated equip_avatar_frame RPC restricted to auth.uid(); purchase uses existing purchase-item. Staging migration applied through verified new-account connector only. QA bought Star Halo (1211→411), then received an explicitly logged 800 coin staging_frame_qa_credit to restore test balance. Ownership/duplicate rejection, preservation of avatar, removal and Collection verified. Security advisor flags the intentional authenticated SECURITY DEFINER RPC; unauthenticated execute is revoked, ownership is enforced by trigger, search_path is empty. Existing unrelated advisor findings remain; https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable . No production deployment.
- Quests now render opaque theme cards with gaps and theme-colored progress bars; claimed cards retain their surface. Premium modal uses the shared image icon library and theme card surfaces instead of emoji/legacy onboarding rows. With no packages it explicitly says membership is coming soon.
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

- Illustrated frames (2026-10-07): 20 generated transparent originals in assets/space/avatar-frames; optimized 384px WebP runtime art totals 931KB. Added as 20 independent permanent frame items, 1200–3000 coins, alongside four existing frames (24 total). Append-only illustrated_avatar_frames migration applied only to xrtgcxofjisqaigaaboy. Shared renderer displays art in Shop previews, Collection, Home and Profile. Existing equip ownership guard remains. QA bought and equipped Celestial Crown; a logged 1200-coin staging_illustrated_frame_qa_credit restored its test balance. 60 tests/typecheck/lint/build and staging API smoke passed. Staging web deployment pending verification.

- Win/share UI (2026-10-07): win stat surfaces and confetti use theme tokens; transparent trophy replaces rectangular celebration art. Result image now uses current theme colors/background with new trophy icon; Profile share reads theme colors and equipped avatar art, uses image stat icons. Share tabs/close use shared icon library. Removed 9x9 result grid from previews, copied text and shared text; summary/copy/save/share remain. Async tab rendering guards against stale completion. Ocean mobile and Forest previews checked; 60 tests/typecheck/lint/build passed. Only staging deployment authorized.
- Theme shop preview (2026-10-08): removed hover/touch theme switching. Every theme has an explicit Preview button opening a read-only Home popup; theme tokens apply only inside the popup and do not persist to cache or equipment. Home markup is shared with the real Home view, without starting its subscriptions/API actions. Forest and Premium Sakura previews checked while Ocean remained active; Close/Escape restore focus. Only staging deployment authorized.
- Staging login routing (2026-10-08): absent/invalid session now redirects directly to /login; login success uses 303 to return via GET. Login, redirects and authenticated staging HTML carry no-store/private and Vary: Cookie. Staging SW excludes HTML from precache so navigations reach the access gate; production SW precaching remains unchanged. Four regression cases cover unauthenticated redirect, login/no loop/wrong credentials, signed-cookie success and production pass-through. No credentials changed.

## Daily automation — 2026-10-15
- Staging only (`xrtgcxofjisqaigaaboy`): generator at 20:15 UTC (03:15 Thai), keeps a rolling 30-day buffer without overwriting existing dates. Custom scheduler token and separate P-256 VAPID key stored in staging Vault; service-role-only config RPC, no service key exported.
- Reminder batches at 22:00–23:50 UTC (05:00–06:50 Thai), max 20 per run, once per subscription/day after push service accepts it. Members with notifications_daily=true only; excludes today's Daily history/leaderboard, claims leases to avoid overlapping sends, retries failures, removes expired 404/410 endpoints. 2-hour TTL, English-only payload. Web Push RFC 8291 aes128gcm + ES256 VAPID, endpoint allowlist and no redirects.
- Settings writes server opt-in/off; off removes subscription, propagates database failures and does not hang waiting for a missing SW. Key rotation resubscribes when the browser has a different VAPID key.
- GitHub staging Environment variable STAGING_VAPID_PUBLIC_KEY and ignored .env.local set to staging public key. Production secrets unchanged. Backend workflow still skips staging; two functions deployed via account-scoped MCP.
- New staging-only migration requires Vault scheduler marker. Do NOT replay this staging scheduler migration in production; its guard intentionally blocks unprovisioned targets. Existing historical migrations untouched.
- Generator live pg_net call HTTP 200 added 8 dates through November 12, existing dates skipped. Reminder live call HTTP 200 with zero eligible subscriptions. Opt-in/off, claim deduplication and sent suppression verified in rolled-back database transaction; no synthetic user retained. Encryption independently decrypted with Node ECDH/HKDF/AES. 71 tests, typecheck, lint, build passed.
- Actual device notification receipt pending a browser push subscription: there are currently zero staging web subscriptions; browser automation runtime could not start. Do not claim end-to-end notification receipt until verified.
- Follow-up verification: played-Daily suppression tested in a rolled-back synthetic-user transaction. Sender batches run concurrently to stay within HTTP timeout; 74 tests now cover unauthorized/project rejection, empty eligibility and encrypted-binary delivery recording. Scheduled cron firing has not yet been observed; one-off pg_net invocation returned HTTP 200. Auto-review rejected temporary every-minute QA jobs because they lacked cleanup and could repeatedly notify; no QA jobs were installed.
- Security advisor: the new internal delivery table intentionally has RLS with no client policies and no anon/authenticated grants (0008 INFO); scheduler/config RPC EXECUTE is revoked from clients. Existing unrelated advisor findings remain, outside this task: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy .
- Final deployment verified: staging commit d09f74ac621e46cca61092bdaef9b775e578e6f9, Deploy Web run 38613016874 and CI run 38613016958 succeeded. Published JavaScript contains staging Supabase URL and staging VAPID public key, with no production Supabase URL. Latest sender one-off pg_net call returned HTTP 200 with zero recipients. Actual device receipt and the first scheduled cron firing remain unverified; user must enable Reminder before the device test. Production was not modified.
