# GridNova Light Space assets

134 final PNG images generated with built-in image_gen from the supplied ZIP and follow-up replacement prompts. Each member of each set is a separate file.

Open [gallery.html](gallery.html) for previews and [generation-manifest.json](generation-manifest.json) for the exact prompt set, paths and corrective edits. Original prompts are preserved in prompts/gridnova_space_assets_prompts.

| Category | Count | Folder |
| --- | ---: | --- |
| Backgrounds | 6 | generated/backgrounds |
| Navigation and gameplay icons | 23 | generated/icons |
| Achievement badges | 12 | generated/badges |
| Avatar frames | 8 | generated/frames |
| Theme thumbnails | 6 | generated/themes |
| Mascots, planets, card art, effects, scenes and app icon | 26 | generated/illustrations |
| UI material reference | 1 | references |
| Legacy icon replacements | 41 | generated/replacements |

## Use in redesign

Artwork is stored outside public to avoid precaching the full source library. Select and optimize images before exporting them into public. Backgrounds are approximately 940–941 x 1672; most square assets are 1254 x 1254; theme thumbnails are 1586 x 992. Generated dimensions differ from the suggested 1440 x 2560 source exports. Preserve alpha when creating smaller PNG or WebP variants.

All requested transparent assets have alpha channels and transparent corners. All eight avatar frames have transparent centers. Representative visual checks covered backgrounds, mascot, tool icon, badge, frame, thumbnail, cell effect, streak, app icon and material reference. Daily Streak was corrected to seven planets and baked checkerboard removed from the opaque app icon. Runtime integration is described below.

## Runtime integration

Selected artwork is exported to src/images/space as 92 WebP files by scripts/export-space-assets.py using Pillow. The app uses these for shared icons, navigation, Home mascot and Daily art, gameplay tools, Home/Game default backgrounds, loading and completion illustrations. Equipped custom backgrounds and non-classic themes retain their styling.

Local browser checks passed for Home and Practice at 390 x 844 and 320 x 568: all displayed images loaded, 81 square board cells, no horizontal overflow, Notes/Undo/Redo/Erase/Free Hint, pause/resume, leave and saved-game continue. Tests: 45 passed; TypeScript/Vite/PWA build passed using a temporary output directory because the existing dist/sw.js was locked.

Artwork size pass: mode images are 64–72 px, daily artwork 84 px, gameplay tools 44 px (36 px on short screens), nav artwork 34 px and page illustrations 144 px. Added page artwork to Practice/Book, Play Mode, Daily, Random, Time Attack, Medals, Profile, Shop, Settings, Quests, Stats, Global Stats and three leaderboard screens. Replaced achievement group icons with generated badges. Practice cards stack image above labels on narrow screens. Mobile checks at 320/390 px and TypeScript/Vite/PWA build passed. Vite ignores temporary preview build output to avoid watcher errors on Windows.

Time Attack stopwatch added with built-in image_gen; source PNG in generated/illustrations/35_time_attack_stopwatch.png, exact prompt in prompts/gridnova_space_assets_prompts/35_time_attack_stopwatch.txt. Optimized time-attack.webp (18 KiB) replaces chronometer.png in mode cards and is the Time Attack page hero. Total source images: 82.

## Legacy icon replacements

41 legacy icons and level medals were generated individually using built-in image_gen with transparent backgrounds. Originals: generated/replacements/. Runtime: src/images/space/replacements/. Exact prompts: prompts/replacements/. Source-to-runtime mapping: replacement-manifest.json. Time Attack uses the previously generated stopwatch. All matching TypeScript imports were replaced.

## Space controls
Close, Back and Volume knob generated individually with built-in image_gen. PNG originals: generated/controls; exact prompts: prompts/controls; WebP runtime: src/images/space/controls. Release-note emoji are rendered with the existing Space illustrations.
## New profile avatars

8 original character portraits generated individually using built-in image_gen. Transparent PNG: generated/avatars/. Exact prompts: prompts/avatars/. Runtime WebP: src/images/space/avatars/. Added to the profile picker alongside existing options.
