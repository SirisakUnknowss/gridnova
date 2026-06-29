// =====================================================================
// Game view — plays a single Sudoku puzzle (daily or practice)
// =====================================================================
import type { Board, Difficulty, Move } from '@engine/types';
import { cloneBoard, boardsEqual } from '@engine/validator';
import { computeDailyScore, computePracticeScore } from '@engine/scoring';
import { renderBoard } from '@ui/components/board';
import { renderNumpad } from '@ui/components/numpad';
import { formatTime } from '@lib/format';
import { sfxPlace, sfxSelect, sfxError, sfxErase, sfxHint, sfxWin, sfxDailyWin } from '@lib/sound';
import { showShareModal } from './share-modal';
import { useStore } from '@state/store';
import * as api from '@lib/api';
import { saveGame, deleteGame, type GameInProgress } from '@lib/local-db';

export interface GameViewProps {
  mode: 'daily' | 'practice';
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  date?: string;
  stage?: number;
  resume?: GameInProgress;
  onWin: (result: GameResult) => void;
  onExit: () => void;
  onNewGame?: () => void;
}

export interface GameResult {
  mode: 'daily' | 'practice';
  difficulty: Difficulty;
  timeSeconds: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
  moves: Move[];
  startedAt: string;
  completedAt: string;
}

interface HistoryEntry {
  r: number; c: number;
  prevDigit: number; nextDigit: number;
  prevNotes: number[]; nextNotes: number[];
  mistakesDelta: number;
}

const DIFF_COLOR: Record<string, string> = {
  easy: '#10b981',
  medium: '#6c5ce7',
  'medium-hard': '#f59e0b',
  hard: '#f87171',
  expert: '#a78bfa',
};

export function mountGameView(root: HTMLElement, props: GameViewProps): { unmount: () => void } {
  const { puzzle, solution, mode, difficulty } = props;

  // State
  const userBoard: Board = cloneBoard(puzzle);
  const givenMask: boolean[][] = puzzle.map(row => row.map(v => v !== 0));
  const hintMask: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));
  const noteMask: Set<number>[][] = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set<number>()));

  const PAID_HINT_COSTS = [50, 75, 100];
  let selected: { r: number; c: number } | null = null;
  let mistakes = 0;
  let hintsLeft = 3;
  let paidHintsUsed = 0;
  let noteMode = false;
  const moves: Move[] = [];
  const history: HistoryEntry[] = [];
  const future: HistoryEntry[] = [];
  // pausedMs accumulates total paused duration so elapsedSeconds() stays frozen while paused
  let pausedMs = 0;
  let pauseStart: number | null = null;
  const startTime = Date.now();
  let timerHandle: number | null = null;
  let autosaveHandle: number | null = null;
  let gameWon = false;

  // Unique key for this game session (used for save/load)
  const gameId = mode === 'daily'
    ? `daily-${props.date ?? new Date().toISOString().slice(0, 10)}`
    : `practice-${difficulty}`;

  // Restore saved state if resuming
  if (props.resume) {
    const r = props.resume;
    try {
      // Restore board
      r.user_board.forEach((v, i) => {
        const row = Math.floor(i / 9), col = i % 9;
        if (!givenMask[row][col]) userBoard[row][col] = v;
      });
      // Restore hint cells
      r.hint_cells.forEach(i => { hintMask[Math.floor(i / 9)][i % 9] = true; });
      // Restore notes
      (r as GameInProgress & { notes?: number[][] }).notes?.forEach((bits, i) => {
        bits.forEach(n => noteMask[Math.floor(i / 9)][i % 9].add(n));
      });
      mistakes = Math.max(0, Math.min(r.mistakes ?? 0, 2));
      hintsLeft = Math.max(0, Math.min(r.hints_left ?? 3, 3));
      moves.push(...(r.moves as Move[]));
      const savedElapsed = r.elapsed_seconds ?? 0;
      // Set pausedMs so elapsedSeconds() returns savedElapsed immediately on resume
      pausedMs = Date.now() - startTime - savedElapsed * 1000;
    } catch {
      // Corrupted save — start fresh (board/masks already initialized as-new)
      mistakes = 0; hintsLeft = 3;
    }
  }

  const settings = { highlightSame: true, showConflict: true, highlightRelated: true };
  const dotColor = DIFF_COLOR[difficulty] ?? '#6c5ce7';
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).replace('-', '-');

  // DOM
  root.innerHTML = `
    <section class="view view--game">
      <div class="game-card">
        <div class="game-topbar">
          ${mode === 'daily'
            ? `<div style="display:flex;align-items:center;gap:8px;">
                <div class="mode-pill no-click">
                  <span class="mode-dot" style="background:${dotColor}"></span>
                  <span>Daily Puzzle</span>
                </div>
                <button class="topbar-icon-btn" id="game-share-btn" title="Invite friends" style="color:var(--brand-primary);">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
               </div>`
            : `<button class="mode-pill" id="mode-pill-btn">
                <span class="mode-dot" style="background:${dotColor}"></span>
                <span id="mode-pill-label">${diffLabel}</span>
               </button>`
          }
          <div class="topbar-right">
            <div class="game-stats-row">
              <div class="stat-block">
                <span class="stat-label">MISTAKES</span>
                <span class="stat-value" id="hearts-display">
                  <span class="heart">♥</span><span class="heart">♥</span><span class="heart">♥</span>
                </span>
              </div>
              <div class="stat-block">
                <span class="stat-label">TIME</span>
                <span class="stat-value" id="timer">00:00</span>
              </div>
            </div>
            <button class="topbar-icon-btn" id="menu-btn" title="Menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div class="board-wrap">
          <div id="board" class="board"></div>
          <div class="board-overlay" id="board-overlay">
            <div class="board-menu">
              <button class="board-menu-btn board-menu-btn--resume" id="overlay-resume">Resume</button>
              ${mode !== 'daily' ? `<button class="board-menu-btn board-menu-btn--new" id="overlay-new">New Game</button>` : ''}
              <button class="board-menu-btn board-menu-btn--leave" id="overlay-leave">Leave Game</button>
            </div>
          </div>
          <div class="board-overlay board-gameover" id="gameover-overlay">
            <div class="board-menu">
              <div class="gameover-title">Game Over</div>
              <div class="gameover-sub">3 mistakes — better luck next time!</div>
              <button class="board-menu-btn board-menu-btn--new" id="gameover-new">New Game</button>
              <button class="board-menu-btn board-menu-btn--leave" id="gameover-leave">Leave Game</button>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <button class="action-btn" id="undo-btn" title="Undo (Ctrl/⌘+Z)" disabled>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7v6h6"/><path d="M3 13C5 8.3 9.1 5 14 5a9 9 0 0 1 0 18c-3.5 0-6.6-2-8.3-5"/>
            </svg>
            <span>Undo</span>
          </button>
          <button class="action-btn" id="redo-btn" title="Redo (Ctrl/⌘+Y)" disabled>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 7v6h-6"/><path d="M21 13C19 8.3 14.9 5 10 5a9 9 0 0 0 0 18c3.5 0 6.6-2 8.3-5"/>
            </svg>
            <span>Redo</span>
          </button>
          <button class="action-btn action-btn--erase" id="erase-btn" title="Erase (Backspace)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 20H7L3 16l13-13 5 5-2.5 2.5M6.5 17.5l5-5"/>
            </svg>
            <span>Erase</span>
          </button>
          <button class="action-btn" id="notes-btn" title="Notes (N)">
            <div class="notes-btn-inner">
              <span class="notes-badge" id="notes-badge">OFF</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
              </svg>
            </div>
            <span>Notes</span>
          </button>
          <button class="action-btn" id="hint-btn" title="Hint (H)">
            <div class="hint-btn-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              <span class="hint-count-badge" id="hint-count">3</span>
            </div>
            <span>Hint</span>
          </button>
        </div>

        <div id="numpad" class="numpad"></div>
      </div>
      <a href="https://www.facebook.com/10Hands" target="_blank" rel="noopener noreferrer" class="game-footer">Developed by Unknowss</a>

      <div class="coin-hint-overlay" id="coin-hint-overlay" style="display:none;">
        <div class="coin-hint-dialog">
          <div class="coin-hint-title">Buy a Hint?</div>
          <div class="coin-hint-body" id="coin-hint-body"></div>
          <div class="coin-hint-actions">
            <button class="coin-hint-btn coin-hint-btn--cancel" id="coin-hint-cancel">Cancel</button>
            <button class="coin-hint-btn coin-hint-btn--confirm" id="coin-hint-confirm">Buy</button>
          </div>
        </div>
      </div>
    </section>
  `;

  const boardEl    = root.querySelector('#board') as HTMLElement;
  const numpadEl   = root.querySelector('#numpad') as HTMLElement;
  const timerEl    = root.querySelector('#timer') as HTMLElement;
  const heartsEl   = root.querySelector('#hearts-display') as HTMLElement;

  function renderHearts(count: number) {
    heartsEl.innerHTML = [0, 1, 2]
      .map(i => `<span class="heart${i < count ? ' heart--lost' : ''}">♥</span>`)
      .join('');
  }
  const hintCountEl = root.querySelector('#hint-count') as HTMLElement;
  const hintBtn    = root.querySelector('#hint-btn') as HTMLButtonElement;
  const undoBtn    = root.querySelector('#undo-btn') as HTMLButtonElement;
  const redoBtn    = root.querySelector('#redo-btn') as HTMLButtonElement;
  const eraseBtn   = root.querySelector('#erase-btn') as HTMLButtonElement;
  const notesBtn   = root.querySelector('#notes-btn') as HTMLButtonElement;
  const notesBadge = root.querySelector('#notes-badge') as HTMLElement;

  function elapsedMs(): number {
    return Date.now() - startTime - pausedMs;
  }

  function elapsedSeconds(): number {
    return Math.floor(elapsedMs() / 1000);
  }

  function saveProgress() {
    if (gameWon) return;
    const notes: number[][] = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        notes.push(Array.from(noteMask[r][c]));
    const hint_cells: number[] = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (hintMask[r][c]) hint_cells.push(r * 9 + c);
    void saveGame({
      game_id: gameId,
      mode,
      date: props.date,
      level: difficulty,
      stage: props.stage,
      puzzle: puzzle.flat().join(''),
      user_board: userBoard.flat(),
      hint_cells,
      notes,
      moves: moves as Array<{ r: number; c: number; n: number; t: number }>,
      started_at: new Date(startTime).getTime(),
      elapsed_seconds: elapsedSeconds(),
      mistakes,
      hints_left: hintsLeft,
    } as GameInProgress & { notes: number[][] });
  }

  function syncUndoRedo() {
    undoBtn.disabled = history.length === 0;
    redoBtn.disabled = future.length === 0;
  }

  function rerender() {
    renderBoard(boardEl, { userBoard, solution, givenMask, hintMask, noteMask, selected, settings, onCellClick });
    renderNumpad(numpadEl, { userBoard, solution, onNumber: handleNumber });
  }

  function onCellClick(r: number, c: number) {
    selected = { r, c };
    sfxSelect();
    rerender();
  }

  function notesSnapshot(r: number, c: number): number[] {
    return Array.from(noteMask[r][c]);
  }

  function handleNumber(n: number) {
    if (gameWon || !selected) return;
    const { r, c } = selected;
    if (givenMask[r][c] || hintMask[r][c]) return;

    if (noteMode) {
      const prevNotes = notesSnapshot(r, c);
      const set = noteMask[r][c];
      if (set.has(n)) set.delete(n); else set.add(n);
      const nextNotes = notesSnapshot(r, c);
      history.push({ r, c, prevDigit: userBoard[r][c], nextDigit: userBoard[r][c], prevNotes, nextNotes, mistakesDelta: 0 });
      future.length = 0;
      syncUndoRedo();
      rerender();
      return;
    }

    const prevDigit = userBoard[r][c];
    const prevNotes = notesSnapshot(r, c);
    let mistakesDelta = 0;

    userBoard[r][c] = n;
    noteMask[r][c].clear();

    if (n !== solution[r][c]) {
      mistakes++;
      renderHearts(mistakes);
      mistakesDelta = 1;
      sfxError();
      if (mistakes >= 3) {
        history.push({ r, c, prevDigit, nextDigit: n, prevNotes, nextNotes: [], mistakesDelta });
        future.length = 0;
        syncUndoRedo();
        moves.push({ r, c, n, t: elapsedMs() });
        rerender();
        triggerGameOver();
        return;
      }
    } else {
      sfxPlace();
      // Clear same number from related cells' notes
      for (let i = 0; i < 9; i++) {
        noteMask[r][i].delete(n);
        noteMask[i][c].delete(n);
      }
      const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
      for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) noteMask[br+dr][bc+dc].delete(n);
    }

    history.push({ r, c, prevDigit, nextDigit: n, prevNotes, nextNotes: [], mistakesDelta });
    future.length = 0;
    syncUndoRedo();
    moves.push({ r, c, n, t: elapsedMs() });
    rerender();
    checkWin();
  }

  function eraseCell() {
    if (gameWon || !selected) return;
    const { r, c } = selected;
    if (givenMask[r][c] || hintMask[r][c]) return;
    const prevDigit = userBoard[r][c];
    const prevNotes = notesSnapshot(r, c);
    if (prevDigit === 0 && noteMask[r][c].size === 0) return;
    userBoard[r][c] = 0;
    noteMask[r][c].clear();
    history.push({ r, c, prevDigit, nextDigit: 0, prevNotes, nextNotes: [], mistakesDelta: 0 });
    future.length = 0;
    syncUndoRedo();
    sfxErase();
    rerender();
  }

  function undoMove() {
    if (history.length === 0) return;
    const entry = history.pop()!;
    future.push(entry);
    userBoard[entry.r][entry.c] = entry.prevDigit;
    noteMask[entry.r][entry.c] = new Set(entry.prevNotes);
    // Mistakes are permanent — undo restores the board but never refunds a lost
    // heart, otherwise undo would create a no-lose exploit.
    syncUndoRedo();
    rerender();
  }

  function redoMove() {
    if (future.length === 0) return;
    const entry = future.pop()!;
    history.push(entry);
    userBoard[entry.r][entry.c] = entry.nextDigit;
    noteMask[entry.r][entry.c] = new Set(entry.nextNotes);
    syncUndoRedo();
    rerender();
  }

  function applyHint() {
    const candidates: { r: number; c: number }[] = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!givenMask[r][c] && userBoard[r][c] !== solution[r][c]) candidates.push({ r, c });
    if (candidates.length === 0) return;

    let target = candidates[0];
    if (selected) {
      candidates.sort((a, b) =>
        (Math.abs(a.r - selected!.r) + Math.abs(a.c - selected!.c)) -
        (Math.abs(b.r - selected!.r) + Math.abs(b.c - selected!.c)));
      target = candidates[0];
    }

    userBoard[target.r][target.c] = solution[target.r][target.c];
    noteMask[target.r][target.c].clear();
    hintMask[target.r][target.c] = true;
    sfxHint();
    selected = target;
    moves.push({ r: target.r, c: target.c, n: solution[target.r][target.c], t: elapsedMs(), isHint: true });
    history.length = 0;
    future.length = 0;
    syncUndoRedo();
    rerender();
    checkWin();
  }

  function updateHintButton() {
    if (hintsLeft > 0) {
      hintCountEl.textContent = String(hintsLeft);
      hintBtn.disabled = false;
      hintBtn.title = '';
    } else if (mode !== 'daily' && paidHintsUsed < 3) {
      const cost = PAID_HINT_COSTS[paidHintsUsed];
      const coins = useStore.getState().coins ?? 0;
      hintCountEl.textContent = `🪙${cost}`;
      hintBtn.disabled = coins < cost;
      hintBtn.title = coins < cost ? 'Not enough coins' : `Buy hint for ${cost} coins`;
    } else {
      hintCountEl.textContent = '0';
      hintBtn.disabled = true;
    }
  }

  function useHint() {
    if (gameWon) return;

    if (hintsLeft > 0) {
      hintsLeft--;
      applyHint();
      updateHintButton();
      return;
    }

    // Daily mode — no coin hints
    if (mode === 'daily') return;
    // All paid hints used
    if (paidHintsUsed >= 3) return;

    const cost = PAID_HINT_COSTS[paidHintsUsed];
    const coins = useStore.getState().coins ?? 0;
    if (coins < cost) return;

    // Show confirmation popup
    const overlay = root.querySelector('#coin-hint-overlay') as HTMLElement;
    const body = root.querySelector('#coin-hint-body') as HTMLElement;
    body.textContent = `Use ${cost} coins for a hint? (You have ${coins} coins)`;
    overlay.style.display = 'flex';

    const onConfirm = async () => {
      overlay.style.display = 'none';
      try {
        const result = await api.spendCoins(cost, 'hint_purchase', { mode, difficulty, hint_index: paidHintsUsed });
        if (!result.ok) {
          // Insufficient coins or other failure — just update button state
          updateHintButton();
          return;
        }
        // Update store coins
        if (result.balance !== undefined) {
          useStore.setState({ coins: result.balance });
        }
        paidHintsUsed++;
        applyHint();
        updateHintButton();
      } catch {
        // Network failure — silently ignore, don't give hint
      }
    };

    const cancelBtn = root.querySelector('#coin-hint-cancel') as HTMLButtonElement;
    const confirmBtn = root.querySelector('#coin-hint-confirm') as HTMLButtonElement;

    const cleanup = () => {
      cancelBtn.removeEventListener('click', onCancel);
      confirmBtn.removeEventListener('click', handleConfirm);
    };
    const onCancel = () => { overlay.style.display = 'none'; cleanup(); };
    const handleConfirm = () => { cleanup(); void onConfirm(); };

    cancelBtn.addEventListener('click', onCancel);
    confirmBtn.addEventListener('click', handleConfirm);
  }

  function checkWin() {
    if (!boardsEqual(userBoard, solution)) return;
    gameWon = true;
    if (timerHandle) clearInterval(timerHandle);
    if (autosaveHandle) { clearInterval(autosaveHandle); autosaveHandle = null; }
    void deleteGame(gameId);

    const timeSeconds = elapsedSeconds();
    const hintsUsed = 3 - hintsLeft;
    const scoreInput = { difficulty, timeSeconds, mistakes, hintsUsed };
    const score = mode === 'daily'
      ? computeDailyScore(scoreInput).score
      : computePracticeScore(scoreInput);

    if (mode === 'daily') sfxDailyWin(); else sfxWin();

    // Report started_at as an EFFECTIVE start (completedAt − actual play time) so the
    // server's wall-clock check matches time_seconds. The raw mount-time start drifts
    // from play time whenever the game was paused or resumed from a save, which used to
    // trip the server TIME_MISMATCH guard and silently 403 every daily submission.
    const completedAtMs = Date.now();
    const effectiveStartedAt = new Date(completedAtMs - timeSeconds * 1000).toISOString();
    props.onWin({ mode, difficulty, timeSeconds, mistakes, hintsUsed, score, moves, startedAt: effectiveStartedAt, completedAt: new Date(completedAtMs).toISOString() });
  }

  function triggerGameOver() {
    gameWon = true;
    if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
    if (autosaveHandle) { clearInterval(autosaveHandle); autosaveHandle = null; }
    void deleteGame(gameId);
    const overlay = root.querySelector('#gameover-overlay') as HTMLElement;
    overlay.classList.add('open');
  }

  // Hamburger menu overlay
  const boardOverlay = root.querySelector('#board-overlay') as HTMLElement;

  function openMenu() {
    if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
    pauseStart = Date.now();
    saveProgress();
    boardOverlay.classList.add('open');
  }

  function closeMenu() {
    if (pauseStart !== null) { pausedMs += Date.now() - pauseStart; pauseStart = null; }
    boardOverlay.classList.remove('open');
    if (!gameWon) timerHandle = window.setInterval(() => { timerEl.textContent = formatTime(elapsedSeconds()); }, 500);
  }

  root.querySelector('#game-share-btn')?.addEventListener('click', async () => {
    const state = useStore.getState();
    const uid = state.user?.id;
    let referralCode = '';
    try { if (uid) referralCode = await api.getReferralCode(uid); } catch { /* ignore */ }
    const profile = state.profile;
    const displayName = profile?.display_name || profile?.username || undefined;

    showShareModal({
      invite: {
        date: props.date ?? new Date().toISOString().slice(0, 10),
        difficulty,
        referralCode: referralCode || undefined,
        displayName,
      },
      profile: uid && profile ? {
        displayName: displayName ?? 'Player',
        avatarUrl: profile.avatar_url,
        avatarEmoji: (state.equipped.avatar?.emoji as string) || '👤',
        level: state.level,
        bestStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        coins: state.coins,
        referralCode: referralCode || 'GRIDNOVA',
      } : undefined,
    });
  });

  root.querySelector('#menu-btn')?.addEventListener('click', openMenu);
  root.querySelector('#overlay-resume')?.addEventListener('click', closeMenu);
  root.querySelector('#overlay-new')?.addEventListener('click', () => {
    if (timerHandle) clearInterval(timerHandle);
    if (props.onNewGame) props.onNewGame(); else props.onExit();
  });
  root.querySelector('#overlay-leave')?.addEventListener('click', () => {
    if (timerHandle) clearInterval(timerHandle);
    if (autosaveHandle) { clearInterval(autosaveHandle); autosaveHandle = null; }
    saveProgress();
    props.onExit();
  });
  root.querySelector('#gameover-new')?.addEventListener('click', () => {
    if (props.onNewGame) props.onNewGame(); else props.onExit();
  });
  root.querySelector('#gameover-leave')?.addEventListener('click', () => props.onExit());

  hintBtn.addEventListener('click', useHint);
  undoBtn.addEventListener('click', undoMove);
  redoBtn.addEventListener('click', redoMove);
  eraseBtn.addEventListener('click', eraseCell);

  notesBtn.addEventListener('click', () => {
    noteMode = !noteMode;
    notesBtn.classList.toggle('action-btn--notes-on', noteMode);
    notesBadge.textContent = noteMode ? 'ON' : 'OFF';
    notesBadge.classList.toggle('on', noteMode);
  });

  const onKey = (e: KeyboardEvent) => {
    if (gameWon) return;
    if (e.key >= '1' && e.key <= '9') handleNumber(parseInt(e.key, 10));
    else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') eraseCell();
    else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undoMove(); }
    else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); redoMove(); }
    else if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); notesBtn.click(); }
    else if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); hintBtn.click(); }
    else if (selected) {
      const { r, c } = selected;
      if      (e.key === 'ArrowUp')    { selected = { r: Math.max(0, r - 1), c }; rerender(); }
      else if (e.key === 'ArrowDown')  { selected = { r: Math.min(8, r + 1), c }; rerender(); }
      else if (e.key === 'ArrowLeft')  { selected = { r, c: Math.max(0, c - 1) }; rerender(); }
      else if (e.key === 'ArrowRight') { selected = { r, c: Math.min(8, c + 1) }; rerender(); }
    }
  };
  document.addEventListener('keydown', onKey);

  timerHandle = window.setInterval(() => {
    timerEl.textContent = formatTime(elapsedSeconds());
  }, 500);

  // Autosave every 30s so users can return and continue
  autosaveHandle = window.setInterval(saveProgress, 30_000);

  // Pause the timer when the app/tab is hidden (minimised, backgrounded, switched
  // away) and resume on return — otherwise the clock keeps running off-screen.
  function onVisibilityChange() {
    if (gameWon) return;
    if (document.hidden) {
      // Pause unless something else already paused us (e.g. the menu overlay).
      if (pauseStart === null) {
        if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
        pauseStart = Date.now();
        saveProgress();
      }
    } else if (pauseStart !== null && !boardOverlay.classList.contains('open')) {
      // Resume only when the pause came from being hidden, not from an open menu.
      pausedMs += Date.now() - pauseStart;
      pauseStart = null;
      timerHandle = window.setInterval(() => { timerEl.textContent = formatTime(elapsedSeconds()); }, 500);
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Sync UI state that depends on restored values
  renderHearts(mistakes);
  updateHintButton();

  rerender();
  syncUndoRedo();

  return {
    unmount() {
      if (timerHandle) clearInterval(timerHandle);
      if (autosaveHandle) clearInterval(autosaveHandle);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    },
  };
}
