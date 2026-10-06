# Isolated staging — 2026-10-06

- Project: `gridnova-staging` (`xrtgcxofjisqaigaaboy`), organization `axwseulkkgnkgilijjlq`.
- Connector account: `Unknowss` / `link_6ac4a45fc4bc8191805d49118d608bc1` currently resolves to the new GridNova account. Verify by listing projects before every backend operation; connector labels alone are not reliable.
- Incident: staging push `4fbc537` triggered the legacy backend workflow, whose missing staging secrets fell back to repository production secrets. Run `37445157144` applied only `20261006093112_staging_access_hardening` to production and changed the generator function. The Rare catalog migration was already present before this run. No player data was exported or copied. No rollback was attempted; production changes require the owner's explicit direction.
- Backend automation now excludes staging; staging backend operations use the verified, account-scoped connector. Never enable CLI migration push against consolidated staging history without reconciling it first.
- Local `.env.local` overrides the old `.env`; it is ignored by Git. Staging GitHub Environment owns `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; repository and production secrets are unchanged.
- Deploy workflow verifies the staging project URL and anon-key project/role before building, preventing fallback to production.

## Database bootstrap

Reviewed the 75 historical migrations. Applied schema/catalog changes in ordered, consolidated MCP migrations, starting with the initial six schema migrations and only the shop portion of `seed.sql`. Subsequent migrations supply the current achievements catalog; the outdated achievements portion of `seed.sql` was not reapplied.

Excluded:

- `20260101000006_cron.sql`, `20260621062353_cron_push_reminders.sql`, `20260628094439_fix_cron_http_post.sql`: contain hardcoded URLs to other projects.
- `20260716025512_retroactive_economy_reset.sql`: historical player reset; unnecessary on an empty database.
- `20260610120000_fix_visitor_sessions_rls.sql`: unrestricted guest update policy.

Adapted the remote-schema bootstrap to omit anonymous/member DELETE, TRUNCATE, REFERENCES, TRIGGER, and UPDATE grants on guest/telemetry tables; omitted guest claim, public feedback read, unrestricted online-session mutation, and visitor-session read policies. Shop wallet mutation RPCs are service-role only. This means guest telemetry heartbeat/upsert updates and direct guest-score claiming still need a deliberately scoped follow-up design; do not restore broad historical grants to silence those errors.

Staging migration history uses consolidated names rather than the original timestamps. Do not run a blind `supabase db push` against it; reconcile history or build a fresh bootstrap plan first. Existing migration files were preserved unchanged.

Catalog: paid themes 5,000 coins; eleven Rare avatars 3,500 coins; stable `theme_neon` ID renamed Sky Citadel. Thirty newly generated Daily Puzzles cover October 6 through November 4, 2026. `node scripts/staging-puzzles.mjs YYYY-MM-DD` produces insert-only puzzle SQL using the repo's generator; it does not execute SQL.

## Auth and functions

Site URL: `https://staging.gridnova.pages.dev`. Allowed redirects: that origin plus `http://localhost:5173/**` and `http://127.0.0.1:5173/**`. Email signup and email confirmation enabled; anonymous auth and Google OAuth disabled. Guests remain client-side.

Deployed: claim-quest-reward, claim-weekly-quest-reward, claim-referral, purchase-item, equip-item, submit-daily-score, submit-practice-score, start-time-attack, submit-time-attack-score, generate-daily-puzzle. Member functions validate JWTs with `auth.getUser()` internally. Generator now requires the server's service-role bearer token.

No cross-project cron was installed. Daily-generation scheduling remains pending secure scheduler credential setup; automatic approval review blocked reading the service-role key. Push reminders and admin-actions are not required for player testing and were not deployed. No production push credentials were copied.

## Verification

Local Vite-served client contains only the new Supabase URL. Email signup, actual confirmation-email link/localhost redirect, API login, UI login, catalog reads, Daily start, Rare prerequisites, paid-theme purchase, Rare purchase, duplicate rejection, free-theme Rare purchase, equip RPC, and My Collection were exercised using one newly created staging account. QA credit of 20,000 coins was explicitly logged as `staging_qa_credit`; credentials live only in ignored `.env.local`.

`scripts/staging-smoke.mjs` requires the exact staging URL and local test credentials. `signup` sends a confirmation email; `shop` spends only test coins and is intentionally a first-run scenario, not safe to rerun against already-owned items. `game` creates test Practice/Time Attack results. Never point it at production.

54 tests, TypeScript, ESLint, and production build passed. Deployment and final remote URL verification are recorded in HANDOFF.md after completion.
