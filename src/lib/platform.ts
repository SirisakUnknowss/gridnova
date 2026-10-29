// CrazyGames' Basic Launch allows no external login, ads or purchases, and
// serves the game from their own iframe — so that build is guest-only.
export const IS_CRAZYGAMES = import.meta.env.MODE === 'crazygames';

export const ACCOUNTS_ENABLED = !IS_CRAZYGAMES;

interface CrazyGamesSDK {
  init(): Promise<void>;
  game: { gameplayStart(): void; gameplayStop(): void };
}

declare global {
  interface Window { CrazyGames?: { SDK: CrazyGamesSDK } }
}

let sdkReady: Promise<CrazyGamesSDK | null> | null = null;
let playing = false;

function crazyGamesSdk(): Promise<CrazyGamesSDK | null> {
  if (!IS_CRAZYGAMES) return Promise.resolve(null);
  sdkReady ??= (async () => {
    const sdk = window.CrazyGames?.SDK;
    if (!sdk) return null;
    try { await sdk.init(); return sdk; } catch { return null; }
  })();
  return sdkReady;
}

export function initCrazyGames(): void {
  void crazyGamesSdk();
}

// Without these events CrazyGames counts the whole upload as the initial
// download (limit 50 MB); with them it counts only what loads before play.
export function gameplayStart(): void {
  if (!IS_CRAZYGAMES || playing) return;
  playing = true;
  void crazyGamesSdk().then((sdk) => sdk?.game.gameplayStart());
}

export function gameplayStop(): void {
  if (!IS_CRAZYGAMES || !playing) return;
  playing = false;
  void crazyGamesSdk().then((sdk) => sdk?.game.gameplayStop());
}
