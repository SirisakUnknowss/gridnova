// =====================================================================
// Paywall modal — RevenueCat-backed purchase flow
// Falls back to "coming soon" UI when RC is not configured
// =====================================================================
import { track } from '@lib/analytics';
import { getOfferings, purchasePackage, restorePurchases } from '@lib/purchases';
import { setPremium } from '@lib/premium';

export interface PaywallProps {
  source?: string;
  onClose: () => void;
  onPurchased?: () => void;
}

const PERKS = [
  '🎨 All premium themes unlocked',
  '🎨 Exclusive board color packs',
  '📊 Full stats history',
  '🎁 Monthly coin bonus (+200 coins)',
  '⚡ Ad-free experience',
  '🏅 Premium badge on profile',
];

export function showPaywall(props: PaywallProps): void {
  const existing = document.getElementById('paywall-root');
  if (existing) existing.remove();

  track('paywall_shown', { source: props.source ?? 'unknown' });

  const wrapper = document.createElement('div');
  wrapper.id = 'paywall-root';
  wrapper.className = 'modal-bg active';
  wrapper.innerHTML = `
    <div class="modal paywall-modal">
      <button class="modal-close" id="pw-close" aria-label="Close">×</button>
      <div style="font-size:42px;margin-bottom:4px;">✨</div>
      <h2 style="margin-bottom:4px;">GridNova Premium</h2>
      <p class="auth-sub">Unlock everything. Cancel anytime.</p>

      <ul class="onb-list" style="text-align:left;margin:12px 0;">
        ${PERKS.map((p) => `<li style="margin-bottom:4px;">${p}</li>`).join('')}
      </ul>

      <div id="pw-plans" class="paywall-plans">
        <div class="pw-loading">Loading plans…</div>
      </div>

      <div id="pw-error" style="color:#f87171;font-size:12px;margin:8px 0;display:none;"></div>

      <button class="btn btn--secondary" id="pw-restore" style="width:100%;margin-top:10px;font-size:13px;">
        Restore Purchase
      </button>
      <p class="auth-note" id="pw-note" style="display:none;">
        Subscriptions not yet available — coming via App Store / Play Store.
      </p>
    </div>
  `;
  document.body.appendChild(wrapper);

  const plansEl  = wrapper.querySelector<HTMLElement>('#pw-plans')!;
  const errorEl  = wrapper.querySelector<HTMLElement>('#pw-error')!;
  const restoreBtn = wrapper.querySelector<HTMLButtonElement>('#pw-restore')!;
  const noteEl   = wrapper.querySelector<HTMLElement>('#pw-note')!;

  function showError(msg: string) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  async function loadPlans() {
    const packages = await getOfferings();
    if (packages.length === 0) {
      plansEl.innerHTML = '';
      noteEl.style.display = 'block';
      restoreBtn.style.display = 'none';
      return;
    }

    plansEl.innerHTML = packages.map((pkg) => `
      <button class="paywall-plan${pkg.identifier.includes('yearly') ? ' recommended' : ''}" data-pkg="${pkg.identifier}">
        <strong>${pkg.product.title}</strong>
        <span>${pkg.product.priceString}</span>
        ${pkg.identifier.includes('yearly') ? '<small>Best value</small>' : ''}
      </button>
    `).join('');

    plansEl.querySelectorAll<HTMLButtonElement>('[data-pkg]').forEach((btn) => {
      btn.addEventListener('click', () => handlePurchase(btn.dataset.pkg!, btn));
    });
  }

  async function handlePurchase(pkgId: string, btn: HTMLButtonElement) {
    errorEl.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Processing…';
    track('paywall_plan_clicked', { plan: pkgId });

    const result = await purchasePackage(pkgId);

    if (result.success) {
      setPremium(true);
      track('purchase_success', { plan: pkgId });
      wrapper.remove();
      props.onPurchased?.();
      props.onClose();
    } else if (result.cancelled) {
      btn.disabled = false;
      void loadPlans(); // re-render buttons
    } else {
      showError(result.error ?? 'Purchase failed. Please try again.');
      btn.disabled = false;
      void loadPlans();
    }
  }

  restoreBtn.addEventListener('click', async () => {
    restoreBtn.disabled = true;
    restoreBtn.textContent = 'Restoring…';
    const hasPremium = await restorePurchases();
    if (hasPremium) {
      setPremium(true);
      track('purchase_restored');
      wrapper.remove();
      props.onPurchased?.();
      props.onClose();
    } else {
      restoreBtn.disabled = false;
      restoreBtn.textContent = 'Restore Purchase';
      showError('No active subscription found.');
    }
  });

  wrapper.querySelector('#pw-close')?.addEventListener('click', () => {
    wrapper.remove();
    props.onClose();
  });

  void loadPlans();
}
