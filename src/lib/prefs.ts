// =====================================================================
// Board preferences — localStorage-backed, device-scoped (works for
// guests too, no account needed). Read by the game view on mount.
// =====================================================================

const KEY = 'sudoku_board_prefs_v1';

export interface BoardPrefs {
  highlightSame: boolean;
  showConflict: boolean;
  highlightRelated: boolean;
}

const DEFAULTS: BoardPrefs = {
  highlightSame: true,
  showConflict: true,
  highlightRelated: true,
};

export function getBoardPrefs(): BoardPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function setBoardPref<K extends keyof BoardPrefs>(key: K, value: BoardPrefs[K]): void {
  const prefs = getBoardPrefs();
  prefs[key] = value;
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch { /* private mode */ }
}
