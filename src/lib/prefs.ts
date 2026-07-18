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

// ── Vibration (haptic feedback on cell input) ────────────────────────

const VIBRATE_KEY = 'sudoku_vibrate_v1';

export function isVibrateEnabled(): boolean {
  try {
    const raw = localStorage.getItem(VIBRATE_KEY);
    return raw === null ? true : raw === '1';
  } catch {
    return true;
  }
}

export function setVibrateEnabled(on: boolean): void {
  try { localStorage.setItem(VIBRATE_KEY, on ? '1' : '0'); } catch { /* private mode */ }
}

/** Short haptic buzz on cell input — no-op if disabled or unsupported. */
export function vibrateTap(): void {
  if (!isVibrateEnabled()) return;
  try { navigator.vibrate?.(10); } catch { /* unsupported */ }
}

// ── Daily puzzle reminder (push) — tracks user intent locally; actual
// subscription state lives in the browser's Notification permission +
// the push_tokens table (see src/lib/push.ts). ──────────────────────

const PUSH_PREF_KEY = 'sudoku_push_enabled_v1';

export function getPushPref(): boolean {
  try { return localStorage.getItem(PUSH_PREF_KEY) === '1'; } catch { return false; }
}

export function setPushPref(on: boolean): void {
  try { localStorage.setItem(PUSH_PREF_KEY, on ? '1' : '0'); } catch { /* private mode */ }
}
