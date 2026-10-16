import type { MonthlyCollection } from '@lib/monthly-catalog';
import { markMonthlyWelcomeSeen } from '@lib/monthly-discovery';
import { MONTHLY_ART, monthlyThemePreview } from '../components/monthly-art';

export function showMonthlyWelcome(collection: MonthlyCollection, account: string, onOpen: () => void, onClose: () => void = () => {}): () => void {
  const previous = document.activeElement as HTMLElement | null;
  const dialog = document.createElement('dialog');
  dialog.className = 'monthly-welcome';
  dialog.setAttribute('aria-labelledby', 'monthly-welcome-title');
  let rewards = false;
  const close = (seen: boolean) => {
    if (seen) markMonthlyWelcomeSeen(account, collection.month);
    dialog.close();
    dialog.remove();
    onClose();
    if (previous?.isConnected) previous.focus();
  };
  const render = () => {
    dialog.innerHTML = `<div class="monthly-welcome-content"><p class="monthly-welcome-kicker">${collection.label} · ${rewards ? '2 of 2' : '1 of 2'}</p><h2 id="monthly-welcome-title">${rewards ? 'Meet this month’s rewards' : 'This month’s challenge is here!'}</h2>${rewards ? `<p>Collect the ${collection.title} collection by completing puzzle dates this month.</p><div class="monthly-rewards monthly-welcome-rewards">${collection.rewards.map(reward => `<article class="monthly-reward monthly-surface"><strong class="monthly-milestone">${reward.days} DAYS</strong><div class="monthly-reward-preview">${reward.type === 'Theme' ? monthlyThemePreview(reward.id) : `<img src="${MONTHLY_ART[reward.art]}" alt="${reward.name}">`}</div><small>${reward.type.toUpperCase()}</small><h3>${reward.name}</h3></article>`).join('')}</div><p>Days don’t need to be consecutive. Claim rewards before this month ends. Earned cosmetics stay in My Collection.</p>` : `<img class="monthly-welcome-hero" src="${MONTHLY_ART[collection.hero]}" alt="${collection.heroAlt}"><h3>${collection.title}</h3><p>${collection.subtitle}</p><p>Find Monthly Challenge on Home. Discover a new collection of avatars, frames and themes every month.</p>`}</div><div class="monthly-welcome-actions"><button class="btn btn--primary" id="monthly-welcome-next">${rewards ? 'Open Monthly Challenge' : 'Discover rewards'}</button><button class="btn btn--secondary" id="monthly-welcome-later">Maybe later</button></div>`;
    dialog.querySelector<HTMLButtonElement>('#monthly-welcome-next')!.addEventListener('click', () => {
      if (!rewards) { rewards = true; render(); dialog.querySelector<HTMLElement>('.monthly-welcome-content')!.scrollTop = 0; dialog.querySelector<HTMLButtonElement>('#monthly-welcome-next')!.focus(); }
      else { close(true); onOpen(); }
    });
    dialog.querySelector('#monthly-welcome-later')!.addEventListener('click', () => close(true));
  };
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(true); });
  render();
  document.body.append(dialog);
  dialog.showModal();
  return () => close(false);
}
