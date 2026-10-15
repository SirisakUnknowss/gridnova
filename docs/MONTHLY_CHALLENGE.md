# Monthly Challenge — Moonlit Wishes

November 1–30, 2026 (UTC). Entry: Home → Monthly Challenge. Existing four navigation tabs stay unchanged.

- Thirty independent, deterministic Medium puzzles, separate from the ranked Daily Puzzle. Missed dates remain playable until the end of November; future dates stay locked.
- Members earn exactly 100 Coins per completed puzzle date, with atomic replay validation, completion and wallet credit. No Monthly XP or leaderboard is awarded.
- Daily game rules apply: three free hints, no coin hints, normal Daily continues. Starting spends one global heart, a win refunds it, and resuming the saved monthly game does not charge again.
- Claim cumulative cosmetics at 5/10/15/20/25/30 dates. Claims are idempotent and remain available after the event. Rewards can be equipped in Shop/My Collection. They cannot be purchased or equipped without ownership. The nonzero internal catalog price is an ownership safeguard, never a displayed purchase price; monthly items do not count as paid-purchase medals.
- Avatar rewards: Lotus Otter and Moon Rabbit. Frames: Lotus Orbit and Full Moon Halo, with transparent centers. Themes: Moonlit River and River of Stars, including a dark Sudoku board.

## Staging

Only `gridnova-staging` (`xrtgcxofjisqaigaaboy`) was changed. The append-only migration is `20261015114034_monthly_challenge.sql`; staging's existing consolidated migration history must not be replayed through CLI db push.

Staging's private config has `preview_today = '2026-11-15'` to allow testing before November. The screen visibly labels this as a staging preview. This override is provisioned separately and is not seeded by the migration. Clear it to use the real UTC clock:

```sql
update monthly_private.config set preview_today = null where id;
```

Production remains unchanged. A future production deployment needs the normal explicit release approval and this migration; its default config has no date override and starts November 1 UTC. This release contains only the November collection, with no automatic December collection.

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
