# AGENTS.md — GridNova Project Reference

Read this before writing any code. It captures decisions, constraints, and context that
cannot be derived from the code alone.

---

## Project Overview

**GridNova** — engagement-focused 9×9 Sudoku PWA (Progressive Web App) built with
TypeScript + Vite. Target: mobile web-first, installable via PWA. Users are primarily
Thai-speaking.

**Live URLs**
- Production: `https://gridnova.pages.dev` (branch: `main`)
- Staging: `https://staging.gridnova.pages.dev` (branch: `staging`)
- Admin panel: `https://gridnova.pages.dev/admin/`

**Deploy**: Cloudflare Pages is a Direct Upload project (NOT Git-connected).
Deploys are automated by GitHub Actions `.github/workflows/deploy-web.yml`, which
triggers on push to `main` (→ production) and `staging` (→ staging). Pushing to any
other branch deploys nothing.

---

## 🚨 Deployment Policy (STRICT — read before every push)

1. **Default target is ALWAYS `staging`.** When work is done, push to the `staging`
   branch only. Never push to `main` and never merge `staging → main` on your own.
2. **Production (`main`) is OFF-LIMITS** until the user explicitly says to deploy to
   production. No exceptions, even for "small" or "urgent" fixes.
3. **When the user authorizes a production deploy, STOP and confirm first.** Reply with:
   - "กำลังจะอัปเดต production แล้วนะ" (explicit confirmation prompt)
   - **Changes** — bullet list of what changed since the last prod release
   - **Release notes** — user-facing summary (Thai)
   - **Version bump** — the new version number (bump `version` in `package.json`)
   Only proceed after the user confirms.
4. **Version number must be bumped on every production release** and is shown in-app
   (see `src/lib/version.ts` → `__APP_VERSION__` from `package.json`, rendered in the
   profile view and the in-game/home screen). Keep `CHANGELOG.md` updated per release.

---

## Environments & Databases

| Env | Branch | Web URL | Supabase project |
|---|---|---|---|
| Production | `main` | `gridnova.pages.dev` | `sudoku-daily` (`sqjllqilozhxbzvfjhra`) |
| Staging | `staging` | `staging.gridnova.pages.dev` | ⚠️ **shares prod DB** (`sudoku-daily`) — not yet separated |

⚠️ **Staging currently SHARES the production Supabase database.** A dedicated staging
project is wanted but blocked by the Supabase free-tier limit (2 active projects per org,
already full: `sudoku-daily` + `Vestly`). Separation is pending a Pro upgrade or freeing a
slot. **Until then, be careful: staging writes hit production data.** Avoid destructive or
seed operations from staging.

When separated, the per-environment Supabase URL/anon key will come from **GitHub
Environment secrets** (`staging` vs `production` environments), consumed by
`deploy-web.yml`. Repo-level secrets are the production fallback; staging-scoped secrets
override them for staging builds.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vanilla TypeScript + Vite (no React/Vue) |
| State | Zustand (`src/state/store.ts`) |
| Backend | Supabase (Auth, Postgres, Edge Functions) |
| PWA | vite-plugin-pwa + Workbox (skipWaiting enabled) |
| Hosting | Cloudflare Pages |
| Analytics | Home-grown (`/admin` funnel + retention, no third-party) |
| Error tracking | Sentry |
| Payments | RevenueCat (purchases-js) |

**No UI framework** — all DOM manipulation is vanilla TypeScript. Components return
`HTMLElement` or write `root.innerHTML`. Keep it that way; do not introduce React/Vue.

---

## File Structure

```
src/
  engine/          # Pure game logic (no DOM): generator, solver, scoring, quests
  lib/             # API calls, auth, themes, share cards, analytics, sound
  state/           # Zustand stores
  ui/
    views/         # Full-screen views (home, game, achievements, profile, …)
    components/    # Reusable pieces (board, numpad, bottom-nav)
    styles/        # main.css (single stylesheet)
    icons.ts       # SVG strings
  sw.ts            # Service Worker
  main.ts          # App entry point
supabase/
  functions/       # Edge Functions (Deno)
  migrations/      # SQL migrations (append-only, never edit existing)
```

---

## CSS Rules

- **Single stylesheet**: `src/ui/styles/main.css` — all styles live here.
- **CSS custom properties** for colors. Never hardcode brand colors inline:
  - `--brand-primary`, `--brand-secondary`, `--brand-gradient`
  - `--app-bg`, `--app-card`, `--app-text`
  - `--cell-bg`, `--cell-bg-given`, `--cell-bg-selected`, `--cell-bg-related`
  - `--cell-bg-same`, `--cell-bg-conflict`
  - `--cell-text`, `--cell-text-user`, `--cell-text-hint`, `--cell-text-conflict`
  - `--border-thick`, `--border-thin`
- **`.view` pattern** — every full-screen view wraps in `<section class="view">`.
  `.view` is `display:flex; flex-direction:column; align-items:center; width:100%;
  max-width:520px; margin:0 auto; padding:0 16px calc(88px + env(safe-area-inset-bottom))`.
- **Sticky headers inside `.view`** must use `align-self:stretch` to avoid centering
  conflict with the parent's `align-items:center`.
- **Board**: `grid-template-columns: repeat(9, 1fr); grid-template-rows: repeat(9, 1fr);
  aspect-ratio:1` — cells must be equal. `.cell` needs `min-width:0; min-height:0`.

---

## Theme System

Themes are shop items (`category = 'theme'`). Applying a theme sets CSS custom properties
on `<html>`. See `src/lib/themes.ts`.

Available themes (IDs):
`theme_classic` · `theme_paper` · `theme_dark` · `theme_pastel` · `theme_ocean`
`theme_forest` · `theme_sunset` · `theme_neon` · `theme_sakura` · `theme_thai` · `theme_mono`

Default / fallback: `theme_classic` (blue-purple gradient `#667eea → #764ba2`).

---

## Game Modes

### Currently Live
| Mode | Description |
|---|---|
| **Daily** | One puzzle per day (server-generated). Shared globally. Leaderboard ranks by score. No coin hints allowed. |
| **Practice** | Free play. Any difficulty. 3 free hints per game + up to 3 paid hints (50 / 75 / 100 coins). |
| **Random** | One tap, random difficulty. Tracks a win streak — losing one game resets it, which is the whole point of the mode. No coin continues. |
| **Time Attack** | Solve against a countdown. Three tiers, each a fixed time + difficulty. Own leaderboard per tier. |

### Time Attack tiers
Defined in `TIME_ATTACK_TIERS` (`src/engine/scoring.ts`) — the single source of truth:

| Tier | Time | Difficulty |
|---|---|---|
| `sprint` | 180s | easy |
| `rush` | 300s | medium |
| `marathon` | 600s | hard |

Scoring is inverted from the other modes: it rewards seconds **left** on the
clock rather than penalising time spent. Same measurement, but players are
racing a visible countdown so the number has to move with them.

A run needs a ticket: `start-time-attack` issues one, `submit-time-attack-score`
validates the run against it. Rank comes from `get_time_attack_leaderboard`,
which collapses multiple runs per player with `DISTINCT ON (user_id)` — so any
player count must be `COUNT(DISTINCT user_id)`, never a row count.

### Difficulty Levels (practice)
`easy` · `easy-medium` · `medium` · `medium-hard` · `hard` · `hard-expert` · `expert`

### Planned Modes (do not build yet — design TBD)
- **Challenge** — special curated puzzles with extra rules or constraints
- **Season** — seasonal event mode (bottom nav tab exists as "coming soon")

---

## Bottom Navigation

4 tabs in order — `NavTab` type: `home | achievements | season | profile`

| Tab | Key | Status |
|---|---|---|
| Home | `home` | Live |
| Medals (Achievements) | `achievements` | Live |
| Season | `season` | Coming soon (disabled, no tap action) |
| Profile | `profile` | Live |

**There is no Shop tab in the nav** — shop is accessible from other views.

---

## Scoring

Score = base − time penalty − mistake penalty − hint penalty + no-mistake bonus + no-hint bonus.
See `src/engine/scoring.ts` for exact formula.

XP and coins are awarded after each completed game. Level is derived from cumulative XP
(`src/lib/level.ts`).

---

## Hint System

- **Free hints**: 3 per game, all modes. Practice/Random get more as the player
  levels up (`freeHintsForLevel()` in `src/lib/level.ts`, up to +3) — Daily stays
  fixed at 3 since it has a global leaderboard and must stay equal for everyone.
- **Paid hints**: up to 3 more (Practice/Random only), costs 50 / 75 / 100 coins
  each (popup confirmation before spend).
- **Daily mode**: hints are tracked but coin purchase is disabled — this reveals
  answers, so it stays off the table for the competitive leaderboard mode.
- Hints are revealed via `applyHint()` in `src/ui/views/game.ts`.
- Coin spend calls `api.spendCoins()` → updates `useStore.setState({ coins: result.balance })`.

## Continue System (buy back in after 3 mistakes)

- Unlike hints, a continue doesn't reveal any answers — it just resets the
  hearts (mistake count for game-over purposes) to 0 so the player can keep
  playing. **Allowed in Daily** (not a hint, so the no-coin-hints rule doesn't
  apply) and Practice — **not allowed in Random Mode**, since "lose 1 game =
  streak resets" is that mode's entire design.
- Up to 3 continues per game. Daily costs 2,500 / 4,000 / 10,000 coins.
  Practice costs scale with difficulty (`PRACTICE_CONTINUE_BASE` in
  `src/ui/views/game.ts`) at the same 1x / 1.6x / 4x ratio as Daily.
- **Scoring integrity**: the mistake count used for scoring (`mistakes`) is
  cumulative and never resets on a continue — only the hearts-display/
  game-over counter (`livesLost`) resets. A continue lets you finish the
  puzzle; it does not erase mistakes from your score or from what's sent to
  the server, so it can't be used to buy a better Daily leaderboard rank.

---

## Hearts System (global energy — NOT the in-game mistake counter)

⚠️ **Naming collision:** the Continue System above calls the in-game 3-mistake
counter "hearts" (`livesLost`). This section is a **different, account-wide**
resource. In code the in-game one is `livesLost`/`mistakes` (game.ts); the
global one lives in `src/lib/hearts.ts` + `user_hearts`. Don't conflate them.

- **What it is**: a global energy pool (0–5) per account. Starting a **gated**
  game costs 1 heart; **winning refunds it**, so only a loss / game-over / quit
  actually spends one. Out of hearts → gated starts are blocked.
- **Gated modes = every mode EXCEPT Practice**: Daily, Random, Time Attack cost
  a heart on start. Practice and Book never do. The gate sits in the start
  functions in `main.ts` (`playDaily`/`playRandom`/`playTimeAttack`) via
  `consumeForStart`; **Daily *resume* does not re-charge** (only fresh starts).
- **Regen differs by account type** (server reads `auth.users.is_anonymous`):
  members +1 per 30 min capped at 5; guests get no time regen but reset to full
  at **UTC midnight**.
- **Guests have no auth session** (the app deliberately never `signInAnonymously`
  at boot — it strips the Bearer token). So guest hearts live **client-side in
  `localStorage`** (`gn_guest_hearts_v1`), not the DB. Members use the server.
  Running out as a guest → prompt to sign in (the growth hook); signing up calls
  `refill_hearts_full` to unblock immediately.
- **Infinite Hearts buff**: bought with coins by the hour — 1/2/3/5h =
  800/1,400/1,900/2,800. While active, starts don't spend a heart. Stacks
  additively. Members only (guests have no server wallet). Buy by tapping the
  hearts pill in the home header.
- **Server-authoritative**: all mutation via SECURITY DEFINER RPCs; the client
  never computes a balance. Prices live in the `buy_infinite_hearts` price map
  (server) mirrored in `INFINITE_HEARTS_PRICES` for display only.

---

## Zustand Store (`src/state/store.ts`)

Key state fields:
```ts
user: User | null          // Supabase auth user
profile: { username, display_name, avatar_url, country, bio } | null
coins: number
xp: number
level: number
currentStreak: number
longestStreak: number
equipped: { theme_id, background_id, board_color_id, avatar }
inventory: string[]        // owned item IDs
currentView: View
```

`View` type: `'loading' | 'login' | 'home' | 'game' | 'leaderboard' | 'shop' |
'profile' | 'settings' | 'stages'`

---

## Database Tables (Supabase / Postgres)

| Table | Purpose |
|---|---|
| `profiles` | User display info (username, display_name, avatar_url, country, bio, referral_code) |
| `user_wallet` | Coin balance per user |
| `coin_transactions` | Full coin history (reason, metadata) |
| `user_progression` | XP, level, streak data |
| `user_settings` | Per-user preferences |
| `daily_puzzles` | One row per date — server-generated puzzle |
| `daily_leaderboard` | Score submissions for daily mode |
| `user_daily_quests` | Daily quest assignments + progress |
| `user_quest_bonus` | Claimed quest rewards |
| `practice_progress` | In-progress practice game state (auto-save) |
| `user_game_history` | Completed game records (mode, difficulty, time, mistakes, hints) |
| `shop_items` | Purchasable items (themes, backgrounds, board colors, avatars) |
| `user_inventory` | Items owned by user |
| `user_equipped` | Currently equipped item per slot |
| `achievements_definitions` | Achievement catalog |
| `user_achievements` | Unlocked achievements per user |
| `push_tokens` | FCM push notification tokens |
| `flagged_submissions` | Anti-cheat flagged scores |
| `time_attack_tickets` | Issued run tickets — a Time Attack score is only accepted against one |
| `time_attack_leaderboard` | Every Time Attack run (not one row per player — see the mode notes) |
| `random_mode_stats` | Random Mode win streaks |
| `user_hearts` | Global hearts (energy) per account + infinite-buff expiry — see Hearts System. Members only; guest hearts are client-side |
| `guest_game_history` | Games finished before signup, claimed on account creation |
| `visitor_sessions` | One row per session per day + where it came from (referrer/UTM/click-id/in-app browser) |
| `session_views` | Which views a session visited — powers the admin funnel |
| `feedbacks` | In-app rating + comment |

**Key RPCs (Postgres functions)**
- `spend_coins(p_user_id, p_amount, p_reason, p_metadata)` → returns `{ ok, balance, reason }`
- `seed_daily_quests(p_date)` — assigns daily quests to users
- `migrate_guest_scores(...)` — migrates guest submissions after login
- `get_visitor_stats()` — admin: visitor/online counts
- `get_or_create_streak(...)` — streak upsert
- `get_hearts()` / `consume_heart(p_mode)` / `refund_heart()` — hearts read / spend-on-start / refund-on-win
- `buy_infinite_hearts(p_hours)` — coin-paid infinite-hearts buff (1/2/3/5h); server owns the price map
- `refill_hearts_full()` — fill to 5 + restart clock (called after a guest upgrades to an account)
- `get_time_attack_leaderboard(p_tier, p_limit)` — best run per player, ranked
- `get_time_attack_player_count(p_tier)` — `COUNT(DISTINCT user_id)` for a tier
- `record_visit_attribution(...)` — first-write-wins; a session keeps the origin it arrived with
- `visitor_source(utm_source, click_id_kind, referrer_host, app_hint)` — one definition of "source" shared by the admin panel and ad-hoc queries

**Edge Functions** (`supabase/functions/`)
- `submit-daily-score` — validates + saves daily puzzle result
- `submit-practice-score` — saves practice result + triggers achievement checks
- `claim-quest-reward` — marks quest done, awards coins/XP
- `claim-referral` — processes referral code
- `purchase-item` — shop purchase via coins
- `equip-item` — equips a shop item
- `generate-daily-puzzle` — cron: generates tomorrow's puzzle
- `send-push-reminders` — cron: sends daily push notifications
- `admin-actions` — admin-only operations
- `start-time-attack` — issues a run ticket
- `submit-time-attack-score` — validates a run against its ticket, awards coins/XP, returns rank
- `claim-weekly-quest-reward` — weekly quest payout

**Migration rules**: migrations are append-only. Never edit existing `.sql` files.
New changes → new file with timestamp prefix `YYYYMMDDHHMMSS_description.sql`.

---

## Quest System

Daily quests: 3 per day (tier 1 + tier 2 + tier 3), seeded by user ID + date.

Quest triggers: `play_any` · `play_daily` · `play_level` · `win_no_hint` ·
`win_no_mistake` · `win_fast` · `leaderboard_rank` · `login`

See `src/engine/quests.ts` for the full pool.

---

## Achievement System

Achievements are in `achievements_definitions` table. Categories:
`play_volume` · `daily` · `skill` · `leaderboard` · `progression` · `special`

Tiers: `bronze` · `silver` · `gold` · `platinum` · `diamond`

View: `src/ui/views/achievements.ts` — grouped by category, sticky topbar + summary ring
+ filter chips, row-style cards.

---

## Share Cards

Canvas-based share images generated client-side. See `src/lib/share/`:
- `card-win.ts` — post-game win card
- `card-profile.ts` — profile summary
- `card-recap.ts` — monthly recap
- `card-invite.ts` — referral invite

---

## PWA / Service Worker

- `src/sw.ts` — custom SW with `skipWaiting()` on install + `clients.claim()` on activate.
- Version is in `package.json` → bump to force cache invalidation.
- Built via `vite-plugin-pwa`. Workbox handles precaching.
- **Every precached entry costs a request on each new visitor's first load, and
  each one invokes the Pages Function** (see below). Keep `globIgnores` in
  `vite.config.ts` tight — `admin/**` is excluded because players were
  downloading the admin panel and its chart library for a page they never open.

## Cloudflare Pages Functions

`functions/_middleware.js` gates staging behind a login. It runs on **every
request Cloudflare routes to the Function, production included** — the
`if (!isStaging) return next()` early-exit happens after the invocation is
already billed. `public/_routes.json` excludes static assets so only HTML
navigations reach it. Without that file the free tier's 100k requests/day was
exhausted in a single day (2026-08-23). If you add a route that must stay
public or cheap, add it to the `exclude` list — and match the path browsers
actually request (the Search Console file is fetched without its `.html`).

---

## Future Plans

- **Season system** — season pass, seasonal rewards, event puzzles. Season tab is
  already in bottom nav as placeholder.
- **Challenge mode** — curated special puzzles.
- **Social features** — friend list, challenge friends, compare streaks.
- **Premium subscription** — via RevenueCat (code exists in `src/lib/purchases.ts` and
  `src/lib/premium.ts` — not fully launched yet).
- **More shop items** — additional themes, backgrounds, board colors, avatar frames.
- **iOS / Android apps** — Capacitor wrappers exist (`@capacitor/*` deps). Not released.

---

## Hard Rules (Do Not Violate)

1. **No new npm dependencies** without asking first — bundle size matters for PWA.
2. **No hardcoded colors** — always use CSS custom properties.
3. **No editing existing SQL migrations** — append only.
4. **No `console.log` left in production code** — use Sentry for error tracking.
5. **No `any` types unless unavoidable** — prefer proper typing.
6. **Daily mode never gets coin hints** — intentional, since hints reveal answers on
   the competitive leaderboard mode. Coin *continues* (buy back in after 3 mistakes)
   are a separate mechanic and are allowed in Daily — see Continue System above.
7. **Bottom nav has exactly 4 tabs** — do not add or remove tabs without explicit instruction.
8. **The game is English-only.** All in-app text (UI copy, error messages, What's New /
   release notes shown in-app) must be in English — no Thai. This does not apply to
   dev-facing docs (CHANGELOG.md, this file), the admin panel, or how you talk to the
   user in chat.
9. **Do not push to `main` directly** — use `develop` for staging first when in doubt.
10. **Do not add comments explaining WHAT code does** — only comment WHY when non-obvious.
