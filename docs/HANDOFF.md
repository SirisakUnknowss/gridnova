# GridNova redesign handoff — 2026-10-05

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

## Important pending server work
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
5. Confirm staging deployment in GitHub Actions after push; production remains untouched.

## User preference reminders
English game UI; Thai chat. Light themed colors and white, no unrelated purple hover. Fantasy buttons balanced to text. No waving mascot. Exactly four bottom nav tabs. Generated art must match theme names. Keep GRIDNOVA_OVERVIEW.md (existing unrelated untracked user file) untouched.
