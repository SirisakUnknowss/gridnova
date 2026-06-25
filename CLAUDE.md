# CLAUDE.md — GridNova Project Reference

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
| Analytics | PostHog + Sentry |
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

### Difficulty Levels (practice)
`easy` · `easy-medium` · `medium` · `medium-hard` · `hard` · `hard-expert` · `expert`

### Planned Modes (do not build yet — design TBD)
- **Time Attack** — solve as many puzzles as possible before timer expires
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

- **Free hints**: 3 per game (practice only).
- **Paid hints**: up to 3 more, costs 50 / 75 / 100 coins each (popup confirmation before spend).
- **Daily mode**: hints are tracked but coin purchase is disabled.
- Hints are revealed via `applyHint()` in `src/ui/views/game.ts`.
- Coin spend calls `api.spendCoins()` → updates `useStore.setState({ coins: result.balance })`.

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

**Key RPCs (Postgres functions)**
- `spend_coins(p_user_id, p_amount, p_reason, p_metadata)` → returns `{ ok, balance, reason }`
- `seed_daily_quests(p_date)` — assigns daily quests to users
- `migrate_guest_scores(...)` — migrates guest submissions after login
- `get_visitor_stats()` — admin: visitor/online counts
- `get_or_create_streak(...)` — streak upsert

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

---

## Future Plans

- **Season system** — season pass, seasonal rewards, event puzzles. Season tab is
  already in bottom nav as placeholder.
- **Time Attack mode** — rapid puzzle solving against a countdown.
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
6. **Daily mode never gets coin hints** — this is an intentional design decision.
7. **Bottom nav has exactly 4 tabs** — do not add or remove tabs without explicit instruction.
8. **All user-facing text should support Thai** — avoid English-only error messages.
9. **Do not push to `main` directly** — use `develop` for staging first when in doubt.
10. **Do not add comments explaining WHAT code does** — only comment WHY when non-obvious.
