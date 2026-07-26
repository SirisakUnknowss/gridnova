// =====================================================================
// Numpad component — 3×3 grid, shows remaining count
//
// Built once and updated in place, for the same reason as the board:
// rebuilding the buttons on every keystroke made taps resolve against
// elements that no longer existed, so a press could register on the
// neighbouring digit.
// =====================================================================
import type { Board } from '@engine/types';

export interface NumpadOptions {
  userBoard: Board;
  solution: Board;
  onNumber: (n: number) => void;
}

/** One-shot animation class owned by game.ts — don't clobber it on update. */
const ANIM_CLASSES = ['numpad-done-pop'];

const numberHandlers = new WeakMap<HTMLElement, (n: number) => void>();

function countCorrectPlaced(userBoard: Board, solution: Board, n: number): number {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (userBoard[r][c] === n && solution[r][c] === n) count++;
    }
  }
  return count;
}

function buildPad(container: HTMLElement): void {
  container.replaceChildren();
  const frag = document.createDocumentFragment();
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement('button');
    btn.dataset.num = String(n);

    const numSpan = document.createElement('span');
    numSpan.className = 'numpad-num';
    numSpan.textContent = String(n);

    const countSpan = document.createElement('span');
    countSpan.className = 'numpad-count';

    btn.appendChild(numSpan);
    btn.appendChild(countSpan);
    frag.appendChild(btn);
  }
  container.appendChild(frag);

  container.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement | null)?.closest('button');
    if (!btn || btn.parentElement !== container) return;
    if (btn.classList.contains('done')) return;
    const n = Number(btn.dataset.num);
    if (n >= 1 && n <= 9) numberHandlers.get(container)?.(n);
  });
}

export function renderNumpad(container: HTMLElement, opts: NumpadOptions): void {
  if (container.children.length !== 9) {
    container.className = 'numpad';
    buildPad(container);
  }
  numberHandlers.set(container, opts.onNumber);

  for (let n = 1; n <= 9; n++) {
    const btn = container.children[n - 1] as HTMLElement;
    const remaining = 9 - countCorrectPlaced(opts.userBoard, opts.solution, n);

    const classes: string[] = [];
    if (remaining === 0) classes.push('done');
    for (const a of ANIM_CLASSES) {
      if (btn.classList.contains(a)) classes.push(a);
    }
    const next = classes.join(' ');
    if (btn.className !== next) btn.className = next;

    const countSpan = btn.querySelector('.numpad-count');
    const label = remaining > 0 ? String(remaining) : '';
    if (countSpan && countSpan.textContent !== label) countSpan.textContent = label;
  }
}
