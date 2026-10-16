# GridNova 2.0.0 production preparation

Status: production release authorized by the owner on 2026-10-16 after the required final confirmation. Version 2.0.0 is the prepared bump from production 1.12.2. Do not increment it again merely for staging builds.

## Player-facing release notes (Thai)

- หน้าเกมใหม่ในบรรยากาศ fantasy พร้อมภาพเมนูที่เปลี่ยนตามธีมและอ่านง่ายขึ้นบนมือถือ
- Monthly Challenge เริ่ม 1 พฤศจิกายน 2026 เวลา 00:00 UTC (07:00 น. ไทย) เล่นสะสมวันเพื่อรับ Avatar, Frame และ Theme โดยไม่ต้องเล่นติดกัน
- คอลเลกชันรายเดือนเตรียมไว้ถึงตุลาคม 2027 และเปลี่ยนตามเดือนจากเวลาของเซิร์ฟเวอร์
- รวมของที่เป็นเจ้าของไว้ใน My Collection รวมถึงของเดิมที่เคยซื้อ และแยกของรางวัลรายเดือนออกจาก Shop
- ปรับหน้า Daily Puzzle, ปฏิทิน Recap, ปุ่มและหน้าต่างข้อมูลให้ใช้งานบนมือถือสะดวกขึ้น

## Scope since production

The existing 2.0.0 candidate includes the fantasy UI refresh, illustrated frames, twelve Monthly Challenge collections, persistent account-scoped cosmetics and ownership enforcement, classic cosmetic continuity, and returning-player English release notes. The final art pass preserves 35 detailed original nine-image atlases and adds separate simplified fantasy controls, with 30px status, 36px navigation and 40px mode entries. No currency/resource icon or actual avatar identity is replaced by a theme pack.

## Read-only environment audit

Checked 2026-10-16 with account-scoped Supabase connectors:

- Production: `sqjllqilozhxbzvfjhra` in the Supabase account. Migration history ends at `20261006093112_staging_access_hardening`; `monthly_private.config` does not exist.
- Staging: `xrtgcxofjisqaigaaboy` in the Unknowss account. Monthly/ownership migrations are installed under consolidated history. `monthly_private.config.preview_today` is NULL (real date); earlier December QA override was removed.
- Production has not been mutated by this preparation.
- A read-only aggregate check found zero equipped theme/background/board-color slots missing their catalog entry, and zero paid slots missing an inventory ownership row. This check does not cover every avatar/frame or replace post-release verification.

## Backend promotion order after approval

Do not run a blind `supabase db push` or `supabase functions deploy` from this checkout. The prepared backend workflow requires manual dispatch from main and an explicit choice of `equip-item` or `purchase-item`, with an exact production project guard. It never pushes migrations or deploys all functions. Database promotion uses the reviewed list below, because the repository includes a staging-only scheduler migration and staging-specific function implementations.

Apply the following reviewed append-only files to the verified production project in order, recording their actual history versions:

1. `20261007000000_avatar_frames.sql`
2. `20261007112459_illustrated_avatar_frames.sql`
3. `20261015114034_monthly_challenge.sql`
4. `20261015143303_monthly_thai_avatars.sql`
5. `20261015154840_december_christmas_collection.sql`
6. `20261016033207_account_cosmetic_integrity.sql`
7. `20261016033721_monthly_collections_january_october_2027.sql`
8. `20261016034814_enforce_equipped_cosmetic_ownership.sql`
9. `20261016081559_owned_retired_collection_visibility.sql`
10. `20261016151310_monthly_current_collection_only.sql`

Explicitly exclude `20261014175634_staging_daily_automation.sql`. Never provision a staging scheduler marker in production to make that guard pass. Do not copy staging Vault values, accounts, inventory, wallets or preview overrides.

Also exclude `20261016160636_retire_staging_monthly_test_grants.sql`: it only retires six items explicitly labelled `staging_monthly_qa_grant` in isolated staging. A local rollback backup was saved outside Git, affected equipped slots were reset before retirement, and unrelated inventory/wallet data was preserved. Staging is now on the real server date (`preview_today IS NULL`), not the earlier December preview.

Verify default monthly config has `preview_today IS NULL`. Validate the available collections and puzzle counts without completing puzzles or issuing rewards to live players. Run ownership/reward SQL regression scripts on staging only, with rollback, before release. Production returning-player ownership must remain intact.

Review changed Edge Functions individually before promotion; retain the live production scheduler/reminder behavior until its separate production rollout is prepared. A deploy-all command is not an acceptable promotion plan for staging-specific functions.

## Web promotion after backend verification

1. Confirm the final staging commit passed CI and Deploy Web, and verify mobile Home, monthly calendar, My Collection and original purchases.
2. Present changes, these Thai release notes and version 2.0.0 to the owner. Obtain the required explicit production confirmation.
3. Apply the reviewed backend plan first, then promote the exact tested web commit through the production branch. Production build must use production Environment secrets, no staging URL or preview date.
4. Verify version, live asset loading, existing-user inventory and pre-launch Monthly Challenge date gate. Preserve live balances and inventory during smoke checks.

## Rollback

Record the pre-release production deployment ID and commit before deployment. Roll the web back to that artifact if necessary. Do not reverse additive reward/ownership migrations by deleting player inventory or reward history. Investigate backend problems with forward fixes; preserve all wallet transactions and ownership records.

## Verification record

- All 35 readable atlases exported (315 images, 16,710,904 bytes), alongside all 35 unchanged detailed originals. Asset manifests verify unique file hashes, transparency and nine nonempty cells.
- 118 unit tests across 27 files pass; ESLint, TypeScript and Vite/PWA build pass. Icon atlases remain outside precache (169 entries, approximately 8.06 MiB) and load on demand.
- Mobile Home renderer checked all 35 theme choices: 35 distinct control atlases, no horizontal overflow, no SVG replacements, four navigation buttons, rendered image sizes 30/36/40px. Navigation touch targets are 65px tall. Light Crystal Lagoon, dark Midnight Observatory and Christmas Eve screenshots are in `assets/space/qa/`.
- Manual production workflow YAML parsed and checked for production project, explicit function allowlist, no push trigger and no automatic migration replay.
- Before promotion, confirm CI and Deploy Web success for the final staging commit; run links and the deployed screenshot are supplied with the delivery. Production backend promotion and production smoke checks happen only after final approval.

## Monthly discovery

Home starts with the Monthly entry hidden and reveals it only after a successful server-clock response at or after November 1, 2026 UTC (07:00 Thailand). No device-clock fallback can reveal it. Home checks again every minute and when returning to the app; late responses from a previous view/account are discarded. Opening the Monthly page has the same server-clock gate.

Only the active catalog month can be opened. There is no month selector or archive, no preview of future collections, and no post-month puzzle play or reward claiming. The server enforces collection read and claim windows; already-owned cosmetics remain usable. Apply migration 20261016151310_monthly_current_collection_only.sql before promoting this client.

The first Home visit for each catalog month offers a two-step introduction: current collection announcement, then six actual rewards with milestones and a button into Monthly Challenge. It does not teach Sudoku. Existing onboarding and What's New take priority. Acknowledgement is local, keyed by account and month, with a session fallback if browser storage is blocked. Another device/browser can show the introduction again; no server ownership or reward data is changed. Future collections beyond October 2027 need catalog entries before they can be announced.

Classic uses its original individual menu images and Daily calendar. Other themes retain their fantasy packs; generated Classic atlases remain archived.

## Production execution — 2026-10-16

Owner confirmed production deployment. Pre-release web commit: fa17d408e31205b4f3650050617b0d58dbab982e; GitHub deployment 6497464681. Tested staging commit: d66e64471f51597b480888f38033c4446f4db85f (118 tests, lint/build, CI and Deploy Web passed).

Applied the ten allowlisted backend migrations sequentially to sudoku-daily, excluding both staging-only migrations. Production now has 12 collections, 365 puzzles and 72 reward definitions. preview_today remains NULL; get_monthly_challenge returns the real 2026-10-16 clock and no active collection. Inventory rows (4), equipped rows (2) and wallet total (1,952,234) were unchanged across migration checks. Deployed only purchase-item (v20, JWT verification retained); equip-item source was unchanged, and scheduler/reminder functions were preserved.

Security advisor still reports existing public views/functions and Auth configuration findings. The monthly status/collection getters are intentionally public and date-gated; reward mutations require membership. No newly exposed monthly table lacks RLS. Existing findings are not a clean security audit and require separate review: https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view and https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable.
