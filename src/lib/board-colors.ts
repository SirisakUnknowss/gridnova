// =====================================================================
// Board Color Packs — applies CSS variables from equipped board_color item
// =====================================================================

export interface BoardColorVars {
  '--board-cell-bg': string;
  '--board-cell-given': string;
  '--board-highlight': string;
}

const DEFAULT_VARS: BoardColorVars = {
  '--board-cell-bg':    'rgba(108,92,231,0.06)',
  '--board-cell-given': 'rgba(108,92,231,0.18)',
  '--board-highlight':  'rgba(108,92,231,0.12)',
};

export function applyBoardColor(cssVars: Partial<BoardColorVars> | null): void {
  const vars = { ...DEFAULT_VARS, ...(cssVars ?? {}) };
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

export function resetBoardColor(): void {
  applyBoardColor(null);
}

/** Parse metadata.css_vars from a shop_item row and apply */
export function applyBoardColorFromItem(item: { metadata?: any } | null): void {
  applyBoardColor(item?.metadata?.css_vars ?? null);
}
