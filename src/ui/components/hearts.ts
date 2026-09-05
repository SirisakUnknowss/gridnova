// =====================================================================
// Hearts UI — the global energy pill + its buy / out-of-hearts modal.
// The pill lives in the home header; the modal opens on tap and also
// when a gated game start is blocked (out of hearts).
// =====================================================================
import { useStore } from '@state/store';
import { ic } from '@ui/icons';
import { formatNumber } from '@lib/format';
import {
  getHearts,
  buyInfiniteHearts,
  consumeHeart,
  refundHeart,
  readGuestHearts,
  consumeGuestHeart,
  refundGuestHeart,
  HEARTS_MAX,
  INFINITE_HEARTS_PRICES,
  msUntilNextRegen,
  msInfiniteLeft,
  formatDuration,
} from '@lib/hearts';

/** Guest = no auth session. The app never signs in anonymously at boot, so a
 *  null user means a local-only guest whose hearts live in localStorage. */
export function isGuestSession(): boolean {
  return !useStore.getState().user;
}

/** Fetch current hearts into the store — server for members, local for guests. */
export async function refreshHearts(): Promise<void> {
  if (isGuestSession()) {
    const g = readGuestHearts();
    useStore.getState().setHearts({
      hearts: g.hearts, max: HEARTS_MAX, regen_minutes: 0,
      last_regen_at: null, infinite: false, infinite_until: null,
    });
    return;
  }
  const s = await getHearts();
  if (s && s.ok) {
    useStore.getState().setHearts({
      hearts: s.hearts,
      max: s.max,
      regen_minutes: s.regen_minutes,
      last_regen_at: s.last_regen_at,
      infinite: s.infinite,
      infinite_until: s.infinite_until,
    });
  }
}

/** Start gate for a gated mode. Returns whether the start may proceed and
 *  whether a heart was actually spent (for refund on win). */
export async function consumeForStart(mode: string): Promise<{ allowed: boolean; consumed: boolean; blocked: boolean }> {
  if (isGuestSession()) {
    const r = consumeGuestHeart();
    await refreshHearts();
    if (!r.ok) return { allowed: false, consumed: false, blocked: true };
    return { allowed: true, consumed: r.consumed, blocked: false };
  }
  const res = await consumeHeart(mode);
  await refreshHearts();
  // RPC unreachable (offline) — never hard-block play.
  if (!res) return { allowed: true, consumed: false, blocked: false };
  if (!res.ok && res.reason === 'no_hearts') return { allowed: false, consumed: false, blocked: true };
  if (!res.ok) return { allowed: true, consumed: false, blocked: false }; // e.g. not_authenticated edge — fail open
  return { allowed: true, consumed: !!res.consumed, blocked: false };
}

/** Refund a consumed heart on a win — server for members, local for guests. */
export async function refundForWin(): Promise<void> {
  if (isGuestSession()) { refundGuestHeart(); await refreshHearts(); return; }
  await refundHeart();
  await refreshHearts();
}

/** The header pill: heart icon + count, or ∞ while a buff is active. */
export function heartsPillHTML(): string {
  const st = useStore.getState();
  const infinite = st.heartsInfinite && !!st.heartsInfiniteUntil
    && new Date(st.heartsInfiniteUntil).getTime() > Date.now();
  const label = infinite ? '∞' : String(st.hearts);
  return `<button class="stat-pill hearts-pill" id="hearts-pill" type="button"
            aria-label="Hearts">${ic.heart(13)} <span class="hearts-count">${label}</span></button>`;
}

/** Keep the pill's number/∞ in sync with the store + live buff expiry. */
export function wireHeartsPill(root: HTMLElement): () => void {
  const pill = root.querySelector<HTMLElement>('#hearts-pill');
  if (!pill) return () => {};

  pill.addEventListener('click', () => showHeartsModal());

  const paint = () => {
    const st = useStore.getState();
    const infinite = st.heartsInfinite && !!st.heartsInfiniteUntil
      && new Date(st.heartsInfiniteUntil).getTime() > Date.now();
    const countEl = pill.querySelector('.hearts-count');
    if (countEl) countEl.textContent = infinite ? '∞' : String(st.hearts);
  };

  paint();
  const unsub = useStore.subscribe(paint);
  const timer = window.setInterval(paint, 1000);
  return () => { unsub(); window.clearInterval(timer); };
}

interface HeartsModalOpts {
  /** true when opened because a gated start was blocked (no hearts). */
  blocked?: boolean;
  /** current user is a guest (anonymous) — show the sign-in nudge. */
  isGuest?: boolean;
  /** guest sign-in CTA (opens the auth modal). */
  onLogin?: () => void;
  /** dismissed without unblocking (× / backdrop). */
  onClose?: () => void;
  /** bought Infinite Hearts while blocked — caller should retry the start. */
  onPurchased?: () => void;
}

export function showHeartsModal(opts: HeartsModalOpts = {}): void {
  document.getElementById('hearts-modal-root')?.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'hearts-modal-root';
  wrapper.className = 'modal-bg active';
  document.body.appendChild(wrapper);

  let busy = false;

  const close = () => {
    window.clearInterval(ticker);
    wrapper.remove();
    opts.onClose?.();
  };

  const render = () => {
    const st = useStore.getState();
    const coins = st.coins ?? 0;
    const infiniteLeft = msInfiniteLeft({ infinite: st.heartsInfinite, infinite_until: st.heartsInfiniteUntil });
    const infinite = infiniteLeft > 0;
    const regenMs = msUntilNextRegen({
      hearts: st.hearts, max: st.heartsMax,
      regen_minutes: st.heartsRegenMinutes, last_regen_at: st.heartsLastRegenAt,
    });

    // Status line
    let status: string;
    if (infinite) {
      status = `<p class="hearts-status">${ic.heart(18)} Infinite Hearts active — <b id="hearts-inf-left">${formatDuration(infiniteLeft)}</b> left</p>`;
    } else {
      const hearts = `<span class="hearts-row">${
        Array.from({ length: st.heartsMax }, (_, i) =>
          `<span class="hearts-dot${i < st.hearts ? ' full' : ' empty'}">${ic.heart(20)}</span>`,
        ).join('')
      }</span>`;
      let sub = '';
      if (st.hearts >= st.heartsMax) {
        sub = 'Hearts are full.';
      } else if (opts.isGuest) {
        sub = 'Guest hearts reset at midnight UTC. Sign in to refill over time.';
      } else if (regenMs !== null) {
        sub = `Next heart in <b id="hearts-regen-left">${formatDuration(regenMs)}</b>.`;
      }
      status = `${hearts}<p class="hearts-sub">${sub}</p>`;
    }

    const title = opts.blocked ? 'Out of hearts' : 'Hearts';

    let body: string;
    if (opts.isGuest) {
      // Guests have no server wallet — the way back is signing in, not buying.
      const blockedNote = opts.blocked
        ? `<p class="hearts-blocked">You’re out of hearts. Sign in to keep playing — you’ll refill over time and can go infinite.</p>`
        : '';
      body = `
        ${blockedNote}
        <div class="hearts-status-box">${status}</div>
        <button class="btn btn--full" id="hearts-login" type="button">${ic.member(16)} Sign in to keep playing</button>
      `;
    } else {
      const blockedNote = opts.blocked
        ? `<p class="hearts-blocked">You need a heart to start this game. Wait for it to refill, or go infinite:</p>`
        : '';
      const buyButtons = [1, 2, 3, 5].map((h) => {
        const price = INFINITE_HEARTS_PRICES[h];
        const afford = coins >= price;
        return `<button class="hearts-buy${afford ? '' : ' disabled'}" data-hours="${h}" ${afford ? '' : 'disabled'} type="button">
            <span class="hearts-buy-dur">∞ ${h}h</span>
            <span class="hearts-buy-price">${ic.coin(12)} ${formatNumber(price)}</span>
          </button>`;
      }).join('');
      body = `
        ${blockedNote}
        <div class="hearts-status-box">${status}</div>
        <p class="hearts-buy-label">Infinite Hearts — play any mode without spending hearts</p>
        <div class="hearts-buy-grid">${buyButtons}</div>
        <p class="hearts-balance">${ic.coin(12)} ${formatNumber(coins)} available</p>
        <p class="hearts-error" id="hearts-error" aria-live="polite"></p>
      `;
    }

    wrapper.innerHTML = `
      <div class="modal hearts-modal">
        <button class="modal-close" id="hearts-close" aria-label="Close">×</button>
        <h2>${title}</h2>
        ${body}
      </div>
    `;

    wrapper.querySelector('#hearts-close')?.addEventListener('click', close);
    wrapper.querySelector('#hearts-login')?.addEventListener('click', () => {
      close();
      opts.onLogin?.();
    });

    wrapper.querySelectorAll<HTMLButtonElement>('.hearts-buy').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (busy || btn.disabled) return;
        busy = true;
        const hours = Number(btn.dataset.hours);
        const errEl = wrapper.querySelector<HTMLElement>('#hearts-error');
        try {
          const res = await buyInfiniteHearts(hours);
          if (!res || !res.ok) {
            if (errEl) errEl.textContent = res?.reason === 'insufficient_coins'
              ? 'Not enough coins.' : 'Purchase failed. Try again.';
            busy = false;
            return;
          }
          if (typeof res.balance === 'number') useStore.setState({ coins: res.balance });
          await refreshHearts();
          busy = false;
          if (opts.blocked) {
            // Unblocked: don't fire onClose (that's the cancel path) — retry the start.
            window.clearInterval(ticker);
            wrapper.remove();
            opts.onPurchased?.();
            return;
          }
          render();
        } catch {
          if (errEl) errEl.textContent = 'Purchase failed. Try again.';
          busy = false;
        }
      });
    });
  };

  render();

  // Live countdowns inside the open modal.
  const ticker = window.setInterval(() => {
    const st = useStore.getState();
    const infLeft = msInfiniteLeft({ infinite: st.heartsInfinite, infinite_until: st.heartsInfiniteUntil });
    const infEl = wrapper.querySelector('#hearts-inf-left');
    if (infEl) {
      if (infLeft <= 0) { void refreshHearts().then(render); return; }
      infEl.textContent = formatDuration(infLeft);
    }
    const regenEl = wrapper.querySelector('#hearts-regen-left');
    if (regenEl) {
      const regenMs = msUntilNextRegen({
        hearts: st.hearts, max: st.heartsMax,
        regen_minutes: st.heartsRegenMinutes, last_regen_at: st.heartsLastRegenAt,
      });
      if (regenMs === null || regenMs <= 0) { void refreshHearts().then(render); return; }
      regenEl.textContent = formatDuration(regenMs);
    }
  }, 1000);
}
