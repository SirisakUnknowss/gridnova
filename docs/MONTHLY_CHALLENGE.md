# Monthly Challenge — Moonlit Wishes

November 1–30, 2026 (UTC). Entry: Home → Monthly Challenge. Existing four navigation tabs stay unchanged.

- Thirty independent, deterministic Medium puzzles, separate from the ranked Daily Puzzle. Missed dates remain playable until the end of November; future dates stay locked.
- Members earn exactly 100 Coins per completed puzzle date, with atomic replay validation, completion and wallet credit. No Monthly XP or leaderboard is awarded.
- Daily game rules apply: three free hints, no coin hints, normal Daily continues. Starting spends one global heart, a win refunds it, and resuming the saved monthly game does not charge again.
- Claim cumulative cosmetics at 5/10/15/20/25/30 dates. Claims are idempotent and remain available after the event. Rewards can be equipped in Shop/My Collection. They cannot be purchased or equipped without ownership. The nonzero internal catalog price is an ownership safeguard, never a displayed purchase price; monthly items do not count as paid-purchase medals.
- Avatar rewards: Lotus Girl (girl in lavender Thai sabai) and Moonlit Boy (boy in a pearl-white Thai jacket), both holding lotus krathongs. Original reward IDs remain stable to preserve existing ownership. Frames: Lotus Orbit and Full Moon Halo, with transparent centers. Themes: Moonlit River and River of Stars, including a dark Sudoku board.

## Staging

Only `gridnova-staging` (`xrtgcxofjisqaigaaboy`) was changed. The append-only migration is `20261015114034_monthly_challenge.sql`; staging's existing consolidated migration history must not be replayed through CLI db push.

Staging's private config has `preview_today = '2026-12-15'` to allow testing before November. The screen visibly labels this as a staging preview. This override is provisioned separately and is not seeded by the migration. Clear it to use the real UTC clock:

```sql
update monthly_private.config set preview_today = null where id;
```

Production remains unchanged. A future production deployment needs the normal explicit release approval and this migration; its default config has no date override and starts November 1 UTC. The catalog now contains November and December collections, with independent completion counts and claims.

## Verification

- Vitest: 82 tests passed, including Monday-first October/November calendars, leap years, date states, milestone boundaries, server errors, exclusion from purchase medals, and unique solutions matching all 30 server puzzle seeds.
- TypeScript, ESLint and Vite/PWA build passed.
- Staging database: replayed all 30 puzzle solutions, verified 100-Coin payout and duplicate suppression, six idempotent cosmetic claims and Avatar/Frame/Theme equipment. Test writes were rolled back by intentional final exceptions (`QA_*_PASS_ROLLED_BACK`). No test reward or equipment was retained.
- Security: private puzzles/solutions/tickets are not exposed to client roles; completion reads are own-user RLS; member-only RPCs validate `auth.uid()`, puzzle dates, issued tickets, moves, givens, timing, hint count and final solution. Security advisors retain the expected warnings for intentional authenticated SECURITY DEFINER RPCs plus pre-existing unrelated findings.
- Mobile browser: 390×844 view, Home entry, November preview/calendar and rules dialog checked. Started November 15, left and resumed without a second heart charge, solved through the board/numpad controls, verified +100 Coins/+0 XP, and returned to a completed date with 1/30 progress. This one real QA completion and its audited 100-Coin payout remain on the staging test member; no cosmetics were retained from the rolled-back database tests.

`tests/lib/monthly-challenge.sql` is a database regression script. Replace `QA_MEMBER_UUID` with an existing staging QA member UUID that has no monthly completions before executing. Its final intentional `MONTHLY_QA_PASS` exception rolls back the test; any `FAILED` exception is a failed assertion. Never point it at production.

## Art assets

Built-in imagegen generated the art; no new npm dependencies were installed. Runtime WebP assets: `src/images/space/monthly/`. Original PNGs: `assets/space/monthly/moonlit-wishes/`. `scripts/prepare-monthly-art.py` slices the generated atlas and transparent frames and optimizes the runtime WebP images. The source atlas's scenery is used behind real, legible HTML Sudoku previews rather than generated board numbers.

Prompt set:

1. **Collectibles atlas:** Three columns × two rows, square panels without gutters/text. Glossy pearlescent pastel lavender-blue cosmic Loy Krathong art. Top: cream-brown otter holding lotus krathong; lotus orbital frame; light moonlit river scenery. Bottom: white rabbit astronaut holding lotus krathong; elaborate full-moon water-ripple frame; midnight indigo river-of-stars observatory scenery. Each panel independently framed with padding, no UI or numbers.
2. **Transparent frames:** Two square cells side by side, genuinely transparent backgrounds and open centers. Left: Lotus Orbit with pearl lavender rings, pink lotus petals and candle glows. Right: Full Moon Halo with silver-blue ripple rings, pearl moon ornament and purple filigree. Complete circles, no text or backdrop.
3. **Hero:** Wide 2:1 landscape, friendly pearl-white robot on the right floating a pink lotus krathong with candle on a lavender cosmic river; pearl full moon and delicate distant Thai temple silhouettes. Left side pale blue-lavender low-detail negative space for dark text. Gentle pearlescent 3D, no text or UI.

## Thai avatar update

The original animal portraits are superseded by `thai-lotus-girl.webp` and `thai-moonlit-boy.webp` in `src/images/space/monthly/`. New originals are preserved alongside the original atlas as `thai-lotus-girl.png` and `thai-moonlit-boy.png`. The built-in imagegen prompt set for these replacements:

- **Lotus Girl:** Square game avatar portrait, cute young Thai girl in a lavender and pearl-white traditional silk sabai and pink patterned sinh, black hair in a bun with a lotus flower, small gold jewelry, holding a pink lotus krathong with a glowing candle. Human childlike chibi proportions; prominent friendly face; pearlescent soft 3D; blue-lavender moonlit river and stars. No animal features, robot, spacesuit, text or watermark.
- **Moonlit Boy:** Square game avatar portrait, cute young Thai boy in a pearl-white raj pattern jacket with standing collar and gold buttons, lavender-blue chong kraben and gold sash, short black hair, holding a pink lotus krathong with a glowing candle. Human childlike chibi proportions; prominent friendly face; pearlescent soft 3D; midnight-blue lavender moonlit river and full moon. No animal features, robot, spacesuit, text or watermark.

The append-only `monthly_thai_avatars` migration updates catalog display names while preserving existing IDs, ownership and equipment. Completed calendar dates now have a 24px contrasting check badge overlapping the date circle, including the selected date.

### Close-up avatar portraits

The active Thai avatar WebPs now use a zoomed head-and-shoulders portrait for clarity in small Home/Profile icons. The full neck, shoulders and upper chest remain visible, naturally connected to the head. Names, reward IDs and ownership stay the same. The previous full portraits remain preserved; new imagegen originals are `thai-lotus-girl-portrait-v3.png` and `thai-moonlit-boy-portrait-v3.png`. Pass `close-up` as the last argument to `prepare-monthly-art.py` when exporting these replacements.

Imagegen edit prompt, applied separately to each original full portrait: zoom the camera to a close-up head-and-shoulders portrait while preserving the character identity, eyes, smile, hair and pearlescent 3D style. Show the complete hair, full neck, both shoulders and upper chest at the lower edge, with a naturally connected body extending beyond the canvas. The girl retains her bun, lotus accessory, Thai earrings and lavender sabai; the boy retains his pearl-white Thai standing-collar jacket. Face/hair occupy the upper 70%, neck/shoulders the lower 25–30%. Hands and krathong fall outside the camera crop. No floating or detached heads. Quiet lavender-blue moonlit bokeh background, no text or watermark.

Profile's Choose your avatar picker includes owned monthly avatars and equips them through the same server-validated item path as Shop avatars. Guests and members without ownership do not receive these reward options. Two regression tests cover picker visibility and item-ID resolution (84 total tests passed). The challenge header uses the shared information artwork; its native rules dialog has explicit centered positioning and bounded scrolling for desktop/mobile viewports.

## December 2026 — Christmas Day

Migration `20261015154840_december_christmas_collection.sql` adds 31 uniquely solvable Medium puzzles and a private collection/reward registry. `get_monthly_collection` scopes progress and claims by month; default status uses the server clock. The UI supports switching November/December. Playable dates must belong to the active month; past rewards remain claimable.

Rewards at 5/10/15/20/25/30 dates: Snowflake Girl (Avatar), Candy Cane Orbit (Frame), Winter Wonderland (Theme), Christmas Boy (Avatar), Starlight Wreath (Frame), Christmas Eve (Theme). Avatars show head and shoulders; frames have transparent open centers. Originals: `assets/space/monthly/christmas-day/`. Export: `scripts/prepare-december-art.py`.

Staging preview: December 15. November ownership and progress remain intact. No December rewards were retained from QA. All 31 server solutions, duplicate payouts, month isolation, six idempotent claims and equipment passed transactional tests rolled back through intentional PASS_ROLLED_BACK exceptions. Vitest: 90 tests passed; ESLint, TypeScript and Vite/PWA build passed. January–October 2027 are implemented by the later 2027 collections migration below.

## Avatar identity and shape fix

Equipment reads now authenticate the current member and filter `user_equipped.user_id` explicitly. That table intentionally permits public profile reads, so an unfiltered `maybeSingle()` could previously return the sole staging test member's equipment to a guest/new account. Shop skips personal equipment reads for guests and discards results after unmount/account changes. Auth account changes reset previous cosmetics while same-account token refresh preserves them.

All equipped profile portraits use circular clipping. Missing/unknown frames use a neutral gray circular ring; catalog/picker artwork uses rounded square corners. The Snowflake Girl square source is `assets/space/monthly/christmas-day/snowflake-girl-square-v2.png`; the original circular source is preserved. Built-in imagegen edit prompt: preserve character identity, hat, scarf, neck and shoulders; remove the baked-in circular boundary and white corners by extending the snowy cosmic background and clothing into a complete square; no frame, border, mask, text or watermark.

Verification: 94 unit tests, including member-scoped equipment reads, no guest reads, account switching versus token refresh, and default frame rendering.

## Ownership audit follow-up

Inventory reads are explicitly member-scoped. Account revision guards discard delayed purchase, equip, collection load and monthly claim results after any account switch, including A to B to A. A token refresh within the same account remains valid. Shop inventory failures show an error instead of replacing ownership with an empty list. Free avatar selection now waits for server success and no longer reports an optimistic success after a failed write. The new append-only account_cosmetic_integrity migration explicitly supports the curated free symbol avatars while retaining paid avatar ownership checks and service-only equip RPC permissions.

Staging transactional checks passed: free avatar save, unowned December avatar rejection, service-only mutation RPC permissions, one purchase/one wallet debit, duplicate purchase rejection and wrong-account purchase rejection. All mutations rolled back through intentional PASS_ROLLED_BACK exceptions. 96 unit tests passed, including inventory scoping and delayed A-to-B-to-A response rejection. This audit does not constitute a guarantee that the entire application has no defects.

## January–October 2027 collections

Migration `20261016033721_monthly_collections_january_october_2027.sql` adds ten independent collections, 304 Medium puzzles and 60 cosmetic rewards. Titles: New Year Nova, Hearts in Orbit, Sakura Skies, Cosmic Songkran, Enchanted Garden, Ocean Odyssey, Stellar Explorers, Meteor Wishes, Harvest Moon, Friendly Frights. February milestones end at 28 completed dates; all other months end at 30. The month selector supports all twelve collections from November 2026 through October 2027. Rules display the selected collection's actual milestones and year. Future months can be previewed but dates remain gated by the server UTC clock.

Avatars use the SAME young Thai girl/boy identities as November: rounded child faces, large brown eyes, black hair, neck and shoulders, changing only themed outfits/accessories/scenery. December portraits were updated to these same identities. Final sources and the built-in imagegen prompts are preserved in `assets/space/monthly/2027/` (atlas, portrait pair and transparent frame pair per month). `scripts/prepare-2027-collections.py` exports 70 WebPs and a typed asset registry. Theme boards are real legible HTML grids, not generated numbers. Both frame centers are checked for alpha transparency during export.

Future-year images are excluded from SW precaching to avoid adding 70 initial-load requests. They load only when displayed. Existing cosmetics keep their original IDs and inventory. No cycle/repeat/resale policy was implemented; the last configured collection remains visible after expiry pending the cycle design discussion.

Verification: 98 unit tests; ESLint, TypeScript, Vite/PWA build. Transactional staging replay passed all 304 puzzle solutions, 100 Coins each, duplicate submissions paying zero, all 60 claims twice, and no progress bleeding between months. Intentional final exception rolled back every QA change; preview remains December 15. `tests/lib/monthly-2027.sql` reproduces the server regression using a staging QA member with no 2027 completions.

### Table-level equip enforcement

The append-only `20261016034814_enforce_equipped_cosmetic_ownership.sql` migration validates theme/background/board-color and avatar ownership in a BEFORE INSERT/UPDATE trigger on `user_equipped`, complementing the existing frame validation. Direct row writes cannot equip unowned paid/monthly cosmetics. Category mismatches and arbitrary avatar symbols are rejected. Public read access remains intentional for profile display, so every personal client read must still filter user_id. Staging rollback tests rejected direct unowned avatar/theme writes and accepted a free default symbol. Replayed all 304 puzzles and 60 claims again, equipping every new cosmetic through the server successfully; no QA changes persisted.
