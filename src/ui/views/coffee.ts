import coffeeQr from '@images/coffee-promptpay.jpg';
import { ic } from '@ui/icons';

export function showCoffeeModal(): void {
  document.getElementById('coffee-root')?.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'coffee-root';
  wrapper.className = 'modal-bg active';
  wrapper.innerHTML = `
    <div class="modal coffee-modal" role="dialog" aria-modal="true" aria-labelledby="coffee-heading">
      <button class="modal-close" id="coffee-close" aria-label="Close">${ic.close(24)}</button>
      <h2 id="coffee-heading">Buy Me a Coffee</h2>
      <p class="coffee-sub">GridNova is an indie project. If you enjoy it, a coffee keeps new puzzles coming. Thank you!</p>
      <img class="coffee-qr" src="${coffeeQr}" width="800" height="1000" alt="PromptPay QR code">
      <p class="coffee-hint">Scan with any Thai banking app. On this phone? Save the image, then pick it from your gallery in the app's scan screen.</p>
      <div class="modal-buttons">
        <a class="btn btn--primary" id="coffee-save" href="${coffeeQr}" download="gridnova-coffee-qr.jpg">Save QR Image</a>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const close = () => {
    wrapper.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  wrapper.querySelector('#coffee-close')?.addEventListener('click', close);
  wrapper.addEventListener('click', (e) => { if (e.target === wrapper) close(); });
}
