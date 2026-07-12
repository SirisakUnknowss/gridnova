// =====================================================================
// Daily Recap — calendar of Daily Puzzle history (streak, month grid,
// tap a day to review the solved board or play a missed puzzle)
// =====================================================================
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { formatTime, todayUtc } from '@lib/format';
import { getMyDailyCalendar, type DailyCalendarEntry } from '@lib/api';
import { useStore } from '@state/store';
import { generateDailyPuzzle, difficultyForDayOfWeek } from '@engine/generator';
import { renderBoard } from '@ui/components/board';
import type { Board } from '@engine/types';

export interface CalendarProps {
  onBack: () => void;
  nav: BottomNavCallbacks;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function dayStatus(entry: DailyCalendarEntry | undefined, isFuture: boolean): 'solved' | 'mistakes' | 'missed' | 'upcoming' {
  if (isFuture) return 'upcoming';
  if (!entry) return 'missed';
  return entry.mistakes > 0 ? 'mistakes' : 'solved';
}

export function mountCalendarView(root: HTMLElement, props: CalendarProps): { unmount: () => void } {
  const state = useStore.getState();
  const userId = state.user?.id ?? null;
  const today = todayUtc();
  const now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth() + 1; // 1-12
  let entries: Record<string, DailyCalendarEntry> = {};

  root.innerHTML = `
    <section class="view view--play-mode">
      <div class="ach-sticky">
        <div class="ach-topbar">
          <button class="ach-back" id="cal-back" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 class="ach-title">${ic.daily(20)} Daily Recap</h1>
          <div style="width:40px;flex:none"></div>
        </div>
      </div>

      <div class="cal-streak-banner">
        <div class="cal-streak-left">
          <span class="cal-streak-icon">${ic.streak(20)}</span>
          <div>
            <div class="cal-streak-num">${state.currentStreak}</div>
            <div class="cal-streak-label">Current streak</div>
          </div>
        </div>
        <div class="cal-streak-best">
          <div class="cal-streak-best-num">${state.longestStreak}</div>
          <div class="cal-streak-label">Best</div>
        </div>
      </div>

      <div class="cal-nav">
        <button class="cal-nav-btn" id="cal-prev" aria-label="Previous month"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
        <span class="cal-nav-label" id="cal-nav-label"></span>
        <button class="cal-nav-btn" id="cal-next" aria-label="Next month"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
      </div>

      <div class="cal-summary" id="cal-summary"></div>

      <div class="cal-weekdays">
        ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<span>${d}</span>`).join('')}
      </div>
      <div class="cal-grid" id="cal-grid"><div class="ach-loading">Loading…</div></div>

      <div class="cal-legend">
        <span><i class="cal-dot cal-dot--solved"></i>Solved</span>
        <span><i class="cal-dot cal-dot--mistakes"></i>With mistakes</span>
        <span><i class="cal-dot cal-dot--missed"></i>Missed</span>
        <span><i class="cal-dot cal-dot--upcoming"></i>Upcoming</span>
      </div>
    </section>
    ${bottomNavHTML('home')}
  `;

  root.querySelector('#cal-back')?.addEventListener('click', props.onBack);
  wireBottomNav(root, props.nav, 'home');

  const navLabel = root.querySelector<HTMLElement>('#cal-nav-label')!;
  const grid = root.querySelector<HTMLElement>('#cal-grid')!;
  const summary = root.querySelector<HTMLElement>('#cal-summary')!;
  const nextBtn = root.querySelector<HTMLButtonElement>('#cal-next')!;

  function renderSummary(daysInMonth: number) {
    let solved = 0, mistakes = 0, missed = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (dateStr > today) continue;
      const status = dayStatus(entries[dateStr], false);
      if (status === 'solved') solved++;
      else if (status === 'mistakes') mistakes++;
      else missed++;
    }
    summary.innerHTML = `
      <div class="cal-stat cal-stat--solved"><div class="cal-stat-num">${solved}</div><div class="cal-stat-label">Solved</div></div>
      <div class="cal-stat cal-stat--mistakes"><div class="cal-stat-num">${mistakes}</div><div class="cal-stat-label">With mistakes</div></div>
      <div class="cal-stat cal-stat--missed"><div class="cal-stat-num">${missed}</div><div class="cal-stat-label">Missed</div></div>
    `;
  }

  function renderGrid() {
    navLabel.textContent = `${MONTH_NAMES[viewMonth - 1]} ${viewYear}`;
    nextBtn.disabled = viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1;

    const firstDow = new Date(Date.UTC(viewYear, viewMonth - 1, 1)).getUTCDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: string[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(`<span class="cal-cell cal-cell--empty"></span>`);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isFuture = dateStr > today;
      const isToday = dateStr === today;
      const status = dayStatus(entries[dateStr], isFuture);

      let cls = `cal-cell cal-cell--${status}`;
      if (isToday) cls += ' cal-cell--today';

      const icon = status === 'solved' ? '✓' : status === 'mistakes' ? '★' : '';

      cells.push(`
        <button class="${cls}" data-date="${dateStr}" ${isFuture ? 'disabled' : ''}>
          <span class="cal-cell-day">${d}</span>
          ${icon ? `<span class="cal-cell-icon">${icon}</span>` : ''}
        </button>
      `);
    }

    grid.innerHTML = cells.join('');
    grid.querySelectorAll<HTMLButtonElement>('[data-date]').forEach((btn) => {
      btn.addEventListener('click', () => showDaySheet(btn.dataset.date!));
    });

    renderSummary(daysInMonth);
  }

  function showDaySheet(dateStr: string) {
    const existing = document.getElementById('cal-day-sheet-root');
    if (existing) existing.remove();

    const entry = entries[dateStr];
    const status = dayStatus(entry, false);
    const difficulty = difficultyForDayOfWeek(new Date(dateStr + 'T00:00:00Z').getUTCDay());

    const overlay = document.createElement('div');
    overlay.id = 'cal-day-sheet-root';
    overlay.className = 'modal-bg active';
    overlay.style.cssText = 'align-items:flex-end;padding:0;';
    overlay.innerHTML = `
      <div class="share-sheet cal-sheet">
        <div class="share-sheet-handle"></div>
        <div class="share-sheet-header">
          <span class="share-sheet-title">${dateStr}</span>
          <button class="icon-btn" id="cal-sheet-close" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="cal-sheet-body">
          ${status === 'missed' ? `
            <div class="cal-sheet-warning">
              ${ic.warning(16)} This puzzle is over — Daily Puzzles can't be played after the day has passed.
            </div>
          ` : `
            <div class="profile-stats">
              <div class="stat-tile"><div class="stat-label">Difficulty</div><div class="stat-value" style="text-transform:capitalize">${difficulty}</div></div>
              <div class="stat-tile"><div class="stat-label">Time</div><div class="stat-value">${formatTime(entry!.time_seconds)}</div></div>
              <div class="stat-tile"><div class="stat-label">Mistakes</div><div class="stat-value">${entry!.mistakes}</div></div>
            </div>
            <button class="btn btn--secondary" id="cal-sheet-review" style="width:100%;margin-top:12px">${ic.stats(15)} Review Solved Board</button>
            <div id="cal-sheet-board" style="display:none;margin-top:14px"></div>
          `}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('#cal-sheet-close')?.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('#cal-sheet-review')?.addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      const boardWrap = overlay.querySelector<HTMLElement>('#cal-sheet-board')!;
      if (boardWrap.style.display !== 'none') { boardWrap.style.display = 'none'; return; }
      if (!boardWrap.dataset.rendered) {
        const puzzleData = generateDailyPuzzle(dateStr);
        const givenMask = puzzleData.puzzle.map((row) => row.map((v) => v !== 0));
        boardWrap.innerHTML = `<div class="board cal-review-board"></div>`;
        renderBoard(boardWrap.querySelector('.board')!, {
          userBoard: puzzleData.solution as Board,
          solution: puzzleData.solution as Board,
          givenMask,
          hintMask: Array.from({ length: 9 }, () => Array(9).fill(false)),
          noteMask: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>())),
          selected: null,
          settings: { highlightSame: false, showConflict: false, highlightRelated: false },
          onCellClick: () => {},
        });
        boardWrap.dataset.rendered = '1';
      }
      boardWrap.style.display = 'block';
      void btn;
    });
  }

  async function load() {
    navLabel.textContent = `${MONTH_NAMES[viewMonth - 1]} ${viewYear}`;
    nextBtn.disabled = viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1;
    if (!userId) {
      grid.innerHTML = `<div class="ach-empty">Sign in to track your Daily Puzzle history.</div>`;
      summary.innerHTML = '';
      return;
    }
    grid.innerHTML = `<div class="ach-loading">Loading…</div>`;
    try {
      const rows = await getMyDailyCalendar(userId, viewYear, viewMonth);
      entries = Object.fromEntries(rows.map((r) => [r.date, r]));
      renderGrid();
    } catch {
      grid.innerHTML = `<div class="ach-empty">Could not load calendar.</div>`;
    }
  }

  root.querySelector('#cal-prev')?.addEventListener('click', () => {
    viewMonth -= 1;
    if (viewMonth < 1) { viewMonth = 12; viewYear -= 1; }
    void load();
  });
  root.querySelector('#cal-next')?.addEventListener('click', () => {
    if (nextBtn.disabled) return;
    viewMonth += 1;
    if (viewMonth > 12) { viewMonth = 1; viewYear += 1; }
    void load();
  });

  void load();

  return { unmount() { document.getElementById('cal-day-sheet-root')?.remove(); } };
}
