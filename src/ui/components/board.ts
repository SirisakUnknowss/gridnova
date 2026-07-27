// =====================================================================
// Board component — renders 9×9 Sudoku grid
//
// The grid is built once and then updated in place. It used to be torn
// down and rebuilt (81 elements + 81 listeners) on every call — including
// a plain cell tap — which made taps land on the wrong cell on mobile:
// the element under the finger at touchstart no longer existed by the
// time the click resolved.
// =====================================================================
import type { Board } from '@engine/types';
import { hasConflict } from '@engine/validator';

export interface BoardRenderOptions {
  userBoard: Board;
  solution: Board;
  givenMask: boolean[][];
  hintMask: boolean[][];
  noteMask: Set<number>[][];
  selected: { r: number; c: number } | null;
  settings: {
    highlightSame: boolean;
    showConflict: boolean;
    highlightRelated: boolean;
  };
  onCellClick: (r: number, c: number) => void;
}

/** One-shot animation classes owned by game.ts — never clobber them on update. */
const ANIM_CLASSES = ['cell-pop', 'cell-shake', 'cell-ripple', 'cell-num-done'];

// Latest click handler per board, so the single delegated listener always
// calls through to the current closure without being re-attached.
const clickHandlers = new WeakMap<HTMLElement, (r: number, c: number) => void>();

function buildGrid(container: HTMLElement): void {
  container.replaceChildren();
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 81; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    frag.appendChild(cell);
  }
  container.appendChild(frag);

  container.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement | null)?.closest('.cell');
    if (!target || target.parentElement !== container) return;
    const i = Array.prototype.indexOf.call(container.children, target);
    if (i < 0) return;
    clickHandlers.get(container)?.(Math.floor(i / 9), i % 9);
  });
}

function paintNotes(cell: HTMLElement, notes: Set<number>): void {
  // Rebuilding the 9 note spans on every keystroke is wasted work, so only
  // redo it when the note set actually changed.
  const sig = Array.from(notes).sort((a, b) => a - b).join('');
  if (cell.dataset.notes === sig) return;
  cell.dataset.notes = sig;

  const grid = document.createElement('div');
  grid.className = 'cell-notes';
  for (let n = 1; n <= 9; n++) {
    const span = document.createElement('span');
    if (notes.has(n)) span.textContent = String(n);
    grid.appendChild(span);
  }
  cell.replaceChildren(grid);
}

export function renderBoard(container: HTMLElement, opts: BoardRenderOptions): void {
  const { userBoard, solution, givenMask, hintMask, noteMask, selected, settings, onCellClick } = opts;

  if (container.children.length !== 81) {
    container.className = 'board';
    buildGrid(container);
  }
  clickHandlers.set(container, onCellClick);

  const selVal = selected ? userBoard[selected.r][selected.c] : 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = container.children[r * 9 + c] as HTMLElement;
      const v = userBoard[r][c];
      const notes = noteMask[r][c];

      // --- content
      // The digit lives in its own span so animations can transform it
      // without moving the cell: a transform on the cell itself changes its
      // hit box, which is how the celebration animations used to swallow or
      // steal taps from neighbouring cells.
      if (v !== 0) {
        if (cell.dataset.notes) delete cell.dataset.notes;
        let inner = cell.firstElementChild as HTMLElement | null;
        if (!inner || !inner.classList.contains('cell-inner')) {
          inner = document.createElement('span');
          inner.className = 'cell-inner';
          cell.replaceChildren(inner);
        }
        const text = String(v);
        if (inner.textContent !== text) inner.textContent = text;
      } else if (notes.size > 0) {
        paintNotes(cell, notes);
      } else {
        if (cell.dataset.notes) delete cell.dataset.notes;
        if (cell.childNodes.length) cell.replaceChildren();
      }

      // --- state classes
      const classes = ['cell'];
      if (v !== 0) {
        if (givenMask[r][c]) classes.push('given');
        else if (hintMask[r][c]) classes.push('hint');
        else classes.push('user');
      } else if (notes.size > 0) {
        classes.push('has-notes');
      }

      if (selected) {
        if (selected.r === r && selected.c === c) {
          classes.push('selected');
        } else if (
          settings.highlightRelated && (
            selected.r === r ||
            selected.c === c ||
            (Math.floor(selected.r / 3) === Math.floor(r / 3) &&
             Math.floor(selected.c / 3) === Math.floor(c / 3))
          )
        ) {
          classes.push('related');
        }

        if (
          settings.highlightSame &&
          selVal !== 0 && v === selVal &&
          !(selected.r === r && selected.c === c)
        ) classes.push('same-num');
      }

      if (
        settings.showConflict &&
        v !== 0 && !givenMask[r][c] && !hintMask[r][c] &&
        (v !== solution[r][c] || hasConflict(userBoard, r, c))
      ) classes.push('conflict');

      // Keep any in-flight animation class alive across the update.
      for (const a of ANIM_CLASSES) {
        if (cell.classList.contains(a)) classes.push(a);
      }

      const next = classes.join(' ');
      if (cell.className !== next) cell.className = next;
    }
  }
}
