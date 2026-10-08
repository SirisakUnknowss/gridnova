# Player icon audit — 2026-10-08

## Scope and findings

Reviewed all 90 TypeScript source files, player UI templates, icon imports,
CSS generated content, inline SVG and Canvas/share renderers.
Also reviewed the staging access page and static admin HTML/JavaScript.
Removed their decorative emoji; admin error/mistake/banned states retain
explicit text labels. Authentication and admin actions are unchanged.

Replaced remaining visible legacy pictographs in paid hints, default/member
leaderboard avatars, premium badges, streak/error messages, recap text and
Canvas, invite difficulty labels, shop fallbacks and achievement fallbacks.
Replaced old action SVGs in game/profile/calendar with shared artwork.
Release notes use semantic icon keys rather than emoji. Removed the unused
legacy win/share renderer and unused emoji theme/background preview helpers.

## Verification

- 61 tests pass, including an AST audit of every TypeScript string literal,
  UI template and direct Canvas text literal; typecheck, lint and build pass.
- Local browser: Home, Profile, Settings and all nine expanded What's New
  releases checked; no pictographic emoji in rendered UI text. All 40 release
  artwork images loaded. Profile share preview rendered successfully.
- The audit test permits only exact legacy avatar compatibility identifiers
  in named files. These identifiers map to current artwork before rendering;
  they are retained so existing saved accounts remain readable.

## Deliberate exceptions and limits

- Google sign-in retains the official Google logo. Shared chevrons, medal
  completion checkmarks/progress rings and typographic status/rarity symbols
  remain functional UI, rather than old pictographic artwork.
- Uploaded profile photos and user-authored names/content are user data;
  they can contain arbitrary imagery or emoji.
- Source coverage is exhaustive for the audited files; browser checks cover
  the states listed above, not every possible account/network/game state.
  This report does not claim a universal 100% runtime guarantee.
- Original assets and historical database migrations are preserved; unused
  source assets do not imply they are displayed in the player build.
