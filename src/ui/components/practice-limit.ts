// =====================================================================
// Practice play-limit UI — the per-difficulty daily counter and its
// out-of-plays / buy-more modal. Mirrors the Hearts component's shape.
// =====================================================================
import { useStore } from '@state/store';
import { ic } from '@ui/icons';
import { formatNumber } from '@lib/format';
import { isGuestSession } from './hearts';
import { formatDuration } from '@lib/hearts';
import {
  PRACTICE_DAILY_LIMIT,
  PRACTICE_EXTRA_PACK,
  PRACTICE_PACK_PRICES,
  PRACTICE_UNLOCK_AT,
  allowanceFor,
  buyPracticePlays,
  getPracticePlays,
  isLevelUnlocked,
  msUntilReset,
  readGuestPlays,
  recordGuestPlay,
  recordPracticePlay,
  remainingFor,
  unlockProgress,
} from '@lib/practice-limit';

/** False once a member's counter fetch has failed (offline, RPC missing).
 *  Everything below then reads as fully open: a player who cannot reach the
 *  server must never be locked out of a mode that is otherwise free. */
let serverReachable = true;
/** False until the first refresh lands. The cards paint no badge while it
 *  is false — an unloaded counter would otherwise flash the wrong state. */
let loaded = false;

/** Pull today's counters into the store — server for members, local for guests. */
export async function refreshPracticePlays(): Promise<void> {
  if (isGuestSession()) {
    serverReachable = true;
    const g = readGuestPlays();
    loaded = true;
    useStore.getState().setPracticeProgress({ levels: g.levels, totals: g.totals });
    return;
  }
  const s = await getPracticePlays();
  serverReachable = !!(s && s.ok);
  loaded = true;
  if (s && s.ok) {
    useStore.getState().setPracticeProgress({ levels: s.levels ?? {}, totals: s.totals ?? {} });
  }
}

export function practicePlaysLoaded(): boolean {
  return loaded;
}

export function practiceRemaining(level: string): number {
  if (!serverReachable) return PRACTICE_DAILY_LIMIT;
  return remainingFor(useStore.getState().practicePlays, level);
}

export function practiceAllowance(level: string): number {
  if (!serverReachable) return PRACTICE_DAILY_LIMIT;
  return allowanceFor(useStore.getState().practicePlays, level);
}

/** Count one finished practice game (win or game-over). Never blocks —
 *  the cap is enforced on the start path, so a game already underway is
 *  always allowed to finish. */
export async function recordPracticeFinish(level: string): Promise<void> {
  if (isGuestSession()) {
    const g = recordGuestPlay(level);
    useStore.getState().setPracticeProgress({ levels: { ...g.levels }, totals: { ...g.totals } });
    return;
  }
  const res = await recordPracticePlay(level);
  if (!res) return;
  const st = useStore.getState();
  st.setPracticeProgress({
    levels: { ...st.practicePlays, [level]: res.usage },
    totals: { ...st.practiceTotals, [level]: res.total },
  });
}

export function practiceUnlocked(level: string): boolean {
  if (!serverReachable) return true;
  return isLevelUnlocked(useStore.getState().practiceTotals, level);
}

export function practiceUnlockProgress(level: string) {
  if (!serverReachable) return null;
  return unlockProgress(useStore.getState().practiceTotals, level);
}

interface LimitModalOpts {
  level: string;
  levelLabel: string;
  /** guest sign-in CTA (opens the auth modal). */
  onLogin?: () => void;
  /** dismissed without unblocking (× / backdrop). */
  onClose?: () => void;
  /** bought more plays — caller should retry the start. */
  onPurchased?: () => void;
}

export function showPracticeLimitModal(opts: LimitModalOpts): void {
  document.getElementById('practice-limit-root')?.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'practice-limit-root';
  wrapper.className = 'modal-bg active';
  document.body.appendChild(wrapper);

  let busy = false;
  const isGuest = isGuestSession();

  const close = () => {
    window.clearInterval(ticker);
    wrapper.remove();
    opts.onClose?.();
  };

  const render = () => {
    const coins = useStore.getState().coins ?? 0;
    const allowance = practiceAllowance(opts.level);
    const price = PRACTICE_PACK_PRICES[opts.level];

    const status = `
      <div class="plimit-status-box">
        <p class="plimit-count"><b>${allowance}/${allowance}</b> ${opts.levelLabel} games played today</p>
        <p class="plimit-sub">Resets in <b id="plimit-reset">${formatDuration(msUntilReset())}</b>.</p>
      </div>
    `;

    let body: string;
    if (isGuest) {
      // Guests have no server wallet — the way forward is signing in.
      body = `
        <p class="plimit-blocked">You’ve used all ${allowance} ${opts.levelLabel} games for today. Other difficulties are still open.</p>
        ${status}
        <button class="btn btn--full" id="plimit-login" type="button">${ic.member(16)} Sign in to keep your progress</button>
      `;
    } else if (price === undefined) {
      body = `
        <p class="plimit-blocked">You’ve used all ${allowance} ${opts.levelLabel} games for today. Other difficulties are still open.</p>
        ${status}
      `;
    } else {
      const afford = coins >= price;
      body = `
        <p class="plimit-blocked">You’ve used all ${allowance} ${opts.levelLabel} games for today. Come back tomorrow, or top up:</p>
        ${status}
        <button class="btn btn--full plimit-buy${afford ? '' : ' disabled'}" id="plimit-buy" ${afford ? '' : 'disabled'} type="button">
          ${ic.practice(15)} +${PRACTICE_EXTRA_PACK} games · ${ic.coin(13)} ${formatNumber(price)}
        </button>
        <p class="plimit-balance">${ic.coin(12)} ${formatNumber(coins)} available</p>
        <p class="plimit-error" id="plimit-error" aria-live="polite"></p>
      `;
    }

    wrapper.innerHTML = `
      <div class="modal plimit-modal">
        <button class="modal-close" id="plimit-close" aria-label="Close">×</button>
        <h2>Daily limit reached</h2>
        ${body}
      </div>
    `;

    wrapper.querySelector('#plimit-close')?.addEventListener('click', close);
    wrapper.querySelector('#plimit-login')?.addEventListener('click', () => {
      close();
      opts.onLogin?.();
    });

    const buyBtn = wrapper.querySelector<HTMLButtonElement>('#plimit-buy');
    buyBtn?.addEventListener('click', async () => {
      if (busy || buyBtn.disabled) return;
      busy = true;
      const errEl = wrapper.querySelector<HTMLElement>('#plimit-error');
      try {
        const res = await buyPracticePlays(opts.level);
        if (!res || !res.ok) {
          if (errEl) errEl.textContent = res?.reason === 'insufficient_coins'
            ? 'Not enough coins.' : 'Purchase failed. Try again.';
          busy = false;
          return;
        }
        if (typeof res.balance === 'number') useStore.setState({ coins: res.balance });
        await refreshPracticePlays();
        busy = false;
        window.clearInterval(ticker);
        wrapper.remove();
        opts.onPurchased?.();
      } catch {
        if (errEl) errEl.textContent = 'Purchase failed. Try again.';
        busy = false;
      }
    });
  };

  render();

  const ticker = window.setInterval(() => {
    const el = wrapper.querySelector('#plimit-reset');
    if (el) el.textContent = formatDuration(msUntilReset());
  }, 1000);
}

/** Shown when a still-locked difficulty is tapped. Nothing to buy here —
 *  the ladder is meant to be climbed, so this only explains the next step. */
export function showPracticeLockedModal(level: string, levelLabel: string, prevLabel: string): void {
  document.getElementById('practice-lock-root')?.remove();

  const prog = practiceUnlockProgress(level);
  if (!prog) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'practice-lock-root';
  wrapper.className = 'modal-bg active';
  document.body.appendChild(wrapper);

  const pct = Math.round((prog.have / prog.need) * 100);
  wrapper.innerHTML = `
    <div class="modal plimit-modal">
      <button class="modal-close" id="plock-close" aria-label="Close">×</button>
      <h2>${levelLabel} is locked</h2>
      <p class="plimit-blocked">Finish ${prog.need} ${prevLabel} games to unlock ${levelLabel}. Once unlocked, it stays unlocked.</p>
      <div class="plimit-status-box">
        <p class="plimit-count"><b>${prog.have}/${prog.need}</b> ${prevLabel} games finished</p>
        <div class="plock-bar"><span class="plock-bar-fill" style="width:${pct}%"></span></div>
      </div>
    </div>
  `;
  wrapper.querySelector('#plock-close')?.addEventListener('click', () => wrapper.remove());
}

/** Start gate for a practice game. Returns false (and opens the matching
 *  modal) when the difficulty is still locked, or out of plays for today. */
export function gatePracticeStart(
  level: string,
  levelLabel: string,
  prevLabel: string,
  onRetry: () => void,
  onLogin: () => void,
): boolean {
  if (!practiceUnlocked(level)) {
    showPracticeLockedModal(level, levelLabel, prevLabel);
    return false;
  }
  if (practiceRemaining(level) > 0) return true;
  showPracticeLimitModal({ level, levelLabel, onLogin, onPurchased: onRetry });
  return false;
}

/** Badge text for a difficulty card: unlock progress while locked,
 *  otherwise how many of today's games are left. */
export function remainingBadge(
  level: string,
): { text: string; label: string; empty: boolean; locked: boolean } {
  if (!loaded) return { text: '', label: '', empty: false, locked: false };
  const prog = practiceUnlockProgress(level);
  if (prog) {
    return {
      text: `${prog.have}/${prog.need}`,
      label: `Locked — ${prog.have} of ${prog.need} games finished on the difficulty below`,
      empty: true,
      locked: true,
    };
  }
  const left = practiceRemaining(level);
  const allowance = practiceAllowance(level);
  return {
    text: `${left}/${allowance}`,
    label: `${left} of ${allowance} games left today`,
    empty: left <= 0,
    locked: false,
  };
}

export { PRACTICE_DAILY_LIMIT, PRACTICE_UNLOCK_AT };
