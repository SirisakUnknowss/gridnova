# Functional small icons — staging 2.0.0

The detailed 35-theme art collection is preserved unchanged. Small controls now use simple, familiar vector silhouettes rather than shrinking ornate miniatures. Detail is reserved for the large Home illustration.

| Function | Small symbol |
|---|---|
| Home | House with roof and doorway |
| Medals / Rank | Two-handled trophy |
| Shop | Shopping bag with handle |
| Profile navigation | Person, head and shoulders |
| Daily / Monthly | Calendar with binding and four date marks |
| Practice | Sudoku grid and pencil |
| Play Mode | Game controller with D-pad and buttons |
| Quests | Clipboard and large check |
| Time / Reset | Clock face and hands |

All symbols use a 24-unit viewBox and 2-unit strokes, no textures, decorative badges, particles or raster detail. The shape for a function stays consistent across all 35 themes. Theme-derived ink, surface and accent colors supply the palette. Navigation renders at 30px, Home statistics at 22px, mode entries at 40px; button targets and labels remain in place. Actual player avatars, coins/hearts, collectible item previews and Sudoku tools are unchanged.

## New source

- `src/ui/components/functional-icon.ts`: nine functional vector symbols.
- `src/ui/components/theme-art.ts`: small vector controls; detailed artwork only for the `hero` role.
- `src/lib/themes.ts`: contrasting icon color tokens for light/dark themes.
- `src/ui/styles/main.css`: all presentation rules.

## Preserved detailed artwork

- `src/images/space/theme-icons/full/skin-<theme_id>.webp`: all 35 original nine-icon sheets, unchanged (315 full illustrations).
- `assets/space/theme-icons/full-icon-assets.json`: original file hashes, sizes and cell validation.
- `assets/space/theme-icons/full-icon-prompts.json`: original built-in image_gen prompts; initial Christmas prompt in `christmas-full-source-prompt.txt`.
- `scripts/prepare-theme-icon-packs.py`: original encoding/validation helper.

The large Home hero can still show the detailed themed calendar. Pack loading remains on demand and service-worker caching remains bounded. No new npm dependencies or ownership/purchase changes.

## Verification

Unit tests retain checks for all original artwork hashes and cover functional-vector rendering, preserved resource/control icons, and keeping detailed images out of 22/30/40px controls. Browser QA uses the actual Home and navigation layout, including light and dark themes and all 35 theme variants. Local manual preview remains `/assets/space/qa/theme-icons-preview.html` while Vite is running. Visual inspection is not a substitute for testing with unfamiliar players; the intent is to make every function identifiable from its conventional silhouette before decorative styling.

Verified in the browser across all 35 themes: the same nine semantic symbols, no raster art in small controls, one preserved large hero illustration, 30px navigation, no horizontal overflow at 390px. Measured outline-to-symbol-surface contrast is at least 6.43:1. Manual light/dark screenshots also cover the 22px statistics and 40px mode entries. Tests: 113 passing; lint and build pass. The preserved original image hashes continue to pass unchanged.
