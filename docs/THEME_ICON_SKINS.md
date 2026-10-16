# Full-object theme icon sets — staging 2.0.0

The earlier small accessory overlays were rejected as too subtle at navigation size. This implementation replaces the whole illustrated object for every theme, rather than placing a motif over an existing icon.

## Nine full objects per theme

Each square transparent sheet uses three columns and three rows in this exact order:

| Row | Left | Center | Right |
|---|---|---|---|
| 1 | Home: house | Medals: trophy | Shop: market |
| 2 | Profile menu: astronaut helmet | Daily / Monthly: Sudoku calendar | Practice: Sudoku book |
| 3 | Play Mode: ringed planet | Quests: checked scroll | Time / Reset: observatory clock |

The larger Daily hero uses the same newly drawn calendar. Actual player avatars, cosmetic previews, coins, hearts, sound/back/close and Sudoku controls retain their identity. All 35 theme IDs have different image sheets and object designs, including distinct light/dark monthly rewards. The equipped theme controls the active art; the current month does not silently override it.

## Files and generation

- `src/images/space/theme-icons/full/skin-<theme_id>.webp`: selected complete icon sheets, encoded with alpha preserved; no recoloring or accessories composited onto old icons.
- `assets/space/theme-icons/full-icon-prompts.json`: per-theme art direction and complete built-in image_gen prompts. Christmas uses the separately recorded initial full-object prompt.
- `assets/space/theme-icons/full-icon-assets.json`: exact asset paths, dimensions, byte sizes, hashes and nonempty-cell checks.
- `scripts/prepare-theme-icon-packs.py`: validates square transparent sheets and encodes them as WebP without cropping or changing the artwork.
- `src/lib/theme-icons.ts`: complete ID-to-sheet registry, inherited independently inside Shop previews.
- `src/ui/components/theme-art.ts`: renders one full sprite per role, with no decorative overlay or visible old icon underneath. Navigation icons are 36px.

Generation used built-in image_gen, one separate generation call per theme, with a transparent background. Raw outputs remain in Codex generated_images; all selected runtime images are saved in the workspace paths above. No new npm dependencies, backend changes, item ID changes or ownership changes.

## Loading and offline behavior

The 35 packs are excluded from Workbox precaching. A user downloads the selected/viewed sheet, not every theme on first launch. The service worker caches viewed same-origin `/assets/skin-*.webp` images, cache-first, capped at 40 sheets. A cached sheet works offline; failed responses are not stored. Cache write failure does not suppress a successful network response.

## Verification

Unit tests cover all theme IDs and distinct image files, nine nonempty transparent cells, complete-object rendering without old overlays, unchanged currency/identity/control icons, isolated previews, Classic reset, and on-demand cache behavior. Local browser preview is `/assets/space/qa/theme-icons-preview.html` while Vite is running. It changes only a scene root and does not equip items or persist a theme.

### Verified result

- 35 selected WebP packs, 315 complete icons, total 18,789,258 bytes across all packs (only the viewed pack is fetched).
- Production build precache remains 169 entries, approximately 8.24 MB; no icon pack appears in the precache manifest.
- 111 unit tests pass; lint and build pass.
- Browser QA at 390px exercised all 35 theme IDs: 35 unique sheet URLs, no old overlay elements, no old images underneath sprites, four 36px navigation icons, readable Play text, no horizontal overflow.
