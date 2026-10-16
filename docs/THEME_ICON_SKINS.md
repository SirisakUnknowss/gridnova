# Theme icon skins — staging 2.0.0

All 35 theme IDs have distinct accessory tiles. The chosen/equipped theme controls the palette and accessories; the calendar month does not override a purchased or earned theme. Each monthly light/dark reward has a different tile.

## Runtime assets

- `src/images/space/theme-icons/accessories.webp`: 6 × 6 transparent atlas, 1254 × 1254, 623,262 bytes. Generated with built-in image_gen, then encoded as WebP with alpha preserved. Tile 35 is reserved; tiles 0–34 cover all current themes.
- `src/lib/theme-icons.ts`: complete ID-to-skin registry and inherited CSS properties.
- `src/ui/components/theme-art.ts`: presentational wrapper retaining each original functional silhouette.
- `src/ui/icons.ts`: opt-in icons only. Currency, hearts, actual user avatars, back/close, sound and Sudoku tools remain unchanged.
- The hero calendar shares the selected skin and material filter. No equipment IDs, ownership checks, purchase/grant APIs or game rules change.

The atlas is shared rather than generating 35 copies of every base icon. It adds one precache entry. CSS inheritance updates rendered icons immediately, and an isolated Shop preview inherits from its own scene instead of the document theme. Seasonal artwork never decorates owned cosmetic item previews or the actual profile portrait.

## Validation

- Unit tests cover every theme, unique tiles, fallback, preview isolation, switching back to Classic, and unchanged resource/control icons.
- Browser QA exercised all 35 themes at 390px: 35 unique positions, no horizontal overflow, four navigation tabs, no broken images, readable dark Play text. Also checked a 320px viewport.
- Local-only manual preview: run Vite, then open `/assets/space/qa/theme-icons-preview.html`. It calls `applyTheme` on a scene root, without equipping items or persisting a theme change.

## Image generation prompt

Built-in image_gen, transparent background, new asset generation:

Create a production GAME UI ACCESSORY SPRITE ATLAS on a truly transparent background. Exactly 6 columns by 6 rows, square canvas, equal perfectly aligned square grid cells. NO visible grid, NO text, NO labels, NO shadows outside each cell, NO background rectangle. Each cell contains ONE tiny polished glossy 3D decorative accessory cluster centered in its own cell, occupying at most 65% of cell width and 65% of cell height, with generous transparent padding and absolutely no overlap between cells. These are ornaments to place ON TOP OF existing 3D icons in GridNova pastel cosmic Sudoku game; NOT complete icons, no calendar, no houses, no avatars. Pixar-like pearlescent toy material, pearl white/lavender foundation with distinctive gentle theme accents, crisp thick silhouettes visible at 24 pixels. Maintain consistent scale, front-facing three-quarter 3D, soft luminous light upper left. Items indexed left to right, top to bottom.

ROW 1: 1 pearlescent lavender four-point star with tiny orbit sparkle; 2 cream paper folded origami star with tiny amber seal; 3 silver crescent moon with tiny blue star; 4 soft pink satin bow with tiny lavender pearl; 5 aqua seashell with little luminous bubble; 6 emerald leaf sprig with one dewdrop.
ROW 2: 7 peach sun disk with tiny rose cloud; 8 icy teal crystal spire with one small cloud; 9 light pink five-petal cherry blossom sprig; 10 gold Thai lotus flower and small red jewel; 11 polished black-and-silver geometric diamond cluster; 12 pastel pink lotus blossom with warm gold candle flame.
ROW 3: 13 violet lotus and luminous crescent moon; 14 icy pale blue SNOW CAP with tiny crystalline snowflake; 15 red SANTA HAT with pearl white fluffy trim and a tiny holly sprig, hat clearly recognizable; 16 soft gold celebratory star and curled lavender confetti ribbon; 17 midnight blue party hat and silver spark; 18 pale pink rose and satin heart-shaped petal.
ROW 4: 19 violet rose with small ruby jewel; 20 blush cherry blossom with mint leaf; 21 lavender cherry blossom with little silver moon; 22 clear aqua WATER SPLASH crown with little jasmine flower; 23 luminous indigo water splash and tiny violet jasmine; 24 mint garden sprig with pink flower bud and dewdrop.
ROW 5: 25 emerald magical mushroom with small moon; 26 pastel peach coral and pearl shell; 27 midnight blue coral with luminous aqua pearl; 28 small silver rocket-fin insignia and light blue astronaut wing; 29 indigo explorer compass insignia with little gold star; 30 lavender shooting star with pearl ribbon tail.
ROW 6: 31 deep violet comet with silver dust tail; 32 warm gold wheat sprig with tiny peach harvest moon; 33 midnight blue wheat with amber crescent moon; 34 cute soft pumpkin-orange jack-o-lantern and little lavender witch hat, gentle friendly face; 35 small pearl white smiling ghost and luminous purple crescent; 36 small neutral pearlescent silver sparkle.
Requirements: ALL 36 specified clusters visible, EXACTLY six equally sized columns and six equally sized rows. Keep clusters centered at exact grid cell centers so atlas can be used without cutting. No board, no app screenshot, no captions, no watermark.
