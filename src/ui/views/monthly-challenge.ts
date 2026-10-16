import { ic } from '@ui/icons';
import infoIcon from '@images/space/replacements/information.webp';
import { useStore, accountScope } from '@state/store';
import { todayUtc } from '@lib/format';
import { monthCells, monthlyDayState, rewardState, getMonthlyStatus, claimMonthlyReward, type MonthlyStatus } from '@lib/monthly-challenge';
import { MONTHLY_COLLECTIONS, activeMonthlyCollection, monthlyCollection } from '@lib/monthly-catalog';
import { MONTHLY_ART, monthlyThemePreview } from '../components/monthly-art';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';

export function mountMonthlyChallengeView(root: HTMLElement, props: { onBack: () => void; onPlay: (date: string) => Promise<void>; onSignIn: () => void; onCollection: () => void; onToast: (message: string) => void; nav: BottomNavCallbacks }) {
  const currentAccount = accountScope();
  let alive = true;
  let loading = true;
  let failed = false;
  let busy = false;
  let initialized = false;
  let status: MonthlyStatus = { today: todayUtc(), preview: false, completed: [], claimed: [] };
  let collection = activeMonthlyCollection(status.today);
  let selected = status.today.startsWith(collection.month) ? status.today : collection.start;
  const member = !!useStore.getState().user && !useStore.getState().user?.is_anonymous;
  function render() {
    if (!alive || !currentAccount()) return;
    const count = status.completed.filter(date => date.startsWith(collection.month)).length;
    const before = status.today < collection.start;
    const ended = status.today > collection.end;
    const done = status.completed.includes(selected);
    root.innerHTML = `<section class="view view--monthly">
      <header class="monthly-topbar"><button class="icon-btn" id="monthly-back" aria-label="Back">${ic.back(26)}</button><h1>Monthly Challenge</h1><button class="icon-btn" id="monthly-help" aria-label="Challenge rules"><img src="${infoIcon}" width="22" height="22" alt=""></button></header>
      <nav class="monthly-month-nav" aria-label="Collection month"><label for="monthly-month">Collection</label><select id="monthly-month" aria-label="Collection month" ${busy || loading ? 'disabled' : ''}>${MONTHLY_COLLECTIONS.map(item => `<option value="${item.month}" ${item.month === collection.month ? 'selected' : ''}>${item.label} · ${item.title}</option>`).join('')}</select></nav>
      <div class="monthly-hero"><img src="${MONTHLY_ART[collection.hero]}" alt="${collection.heroAlt}"><div class="monthly-hero-copy"><p>${collection.label}</p><h2>${collection.title}</h2><span>${collection.subtitle}</span></div></div>
      ${status.preview ? `<p class="monthly-notice">Staging preview · ${status.today}</p>` : ''}
      <div class="monthly-surface monthly-progress"><strong>${count} / ${collection.days} days completed</strong><progress max="${collection.days}" value="${count}" aria-label="Completed puzzle dates"></progress><p>Missed a day? Play it later.</p></div>
      ${failed ? '<p class="monthly-notice" role="alert">Could not load progress. <button class="btn btn--small" id="monthly-retry">Retry</button></p>' : ''}
      <div class="monthly-surface monthly-calendar" aria-label="${collection.label}"><div class="monthly-weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => `<span>${day}</span>`).join('')}</div><div class="monthly-dates">${monthCells(Number(collection.month.slice(0,4)),Number(collection.month.slice(5))).map(date => date ? `<button class="monthly-day monthly-day--${monthlyDayState(date,status.today,status.completed)}${date === selected ? ' is-selected' : ''}" data-date="${date}" aria-label="${collection.monthName} ${Number(date.slice(-2))}${status.completed.includes(date) ? ', completed' : ''}" aria-pressed="${date === selected}" ${date > status.today || before || loading || failed ? 'disabled' : ''}><span>${Number(date.slice(-2))}</span>${status.completed.includes(date) ? '<small aria-hidden="true">✓</small>' : ''}</button>` : '<span></span>').join('')}</div></div>
      <div class="monthly-surface monthly-selected"><div><h2>${collection.monthName} ${Number(selected.slice(-2))}</h2><p>Medium · Daily puzzle</p></div><strong class="monthly-coins">${ic.coin(24)} +100 Coins</strong><button class="btn btn--primary" id="monthly-play" ${member && (loading || failed || busy || before || ended || done || selected > status.today) ? 'disabled' : ''}>${!member ? 'Sign in to play' : loading ? 'Loading…' : before ? `Opens ${collection.monthName} 1` : ended ? 'Collection ended' : done ? '✓ Completed' : selected === status.today ? 'Play today’s puzzle' : 'Play this puzzle'}</button><small>100 Coins once per completed puzzle date.<br>1 heart · Refunded on win</small></div>
      <div class="monthly-rewards-heading"><h2>Monthly Rewards</h2><span>${collection.title} Collection</span></div>
      <div class="monthly-rewards">${collection.rewards.map(reward => {
        const state = rewardState(reward.days,count,status.claimed.includes(reward.id));
        return `<article class="monthly-reward monthly-surface"><strong class="monthly-milestone">${reward.days} DAYS</strong><div class="monthly-reward-preview">${reward.type === 'Theme' ? monthlyThemePreview(reward.id) : `<img src="${MONTHLY_ART[reward.art]}" alt="${reward.name}" loading="lazy">`}</div><small>${reward.type.toUpperCase()}</small><h3>${reward.name}</h3>${state === 'locked' ? `<div class="monthly-reward-progress"><progress max="${reward.days}" value="${count}" aria-label="${reward.name} progress"></progress><span>${count} / ${reward.days}</span></div>` : `<button class="monthly-claim" data-claim="${reward.id}" ${state === 'claimed' || busy || loading || failed ? 'disabled' : ''}>${state === 'claimed' ? '✓ Claimed' : 'Claim'}</button>`}</article>`;
      }).join('')}</div><p class="monthly-footer">Days don’t need to be consecutive.</p><button class="btn btn--secondary" id="monthly-collection">My Collection</button><p class="monthly-footer">${before ? `Starts ${collection.monthName} 1, ${collection.month.slice(0,4)} · ` : ''}Puzzle dates reset at 00:00 UTC.</p>
    </section>${bottomNavHTML('home')}`;
    wireBottomNav(root,props.nav,'home');
    root.querySelector('#monthly-back')?.addEventListener('click',props.onBack);
    root.querySelector('#monthly-collection')?.addEventListener('click',props.onCollection);
    root.querySelector('#monthly-retry')?.addEventListener('click',() => void load());
    root.querySelector('#monthly-help')?.addEventListener('click',() => {
      const dialog = document.createElement('dialog');
      dialog.className = 'monthly-help';
      dialog.innerHTML = `<h2>Monthly Challenge</h2><p>Complete one puzzle for each date in ${collection.monthName}. Missed dates stay playable until ${collection.monthName} ${collection.days} (UTC). Future dates unlock at 00:00 UTC.</p><p>Earn 100 Coins once per date. Collect cosmetics at ${collection.rewards.map(reward => reward.days).join(", ")} completed dates. Days don’t need to be consecutive. Claim your cosmetics here and equip them in My Collection.</p><form method="dialog"><button class="btn btn--primary">Got it</button></form>`;
      document.body.append(dialog); dialog.addEventListener('close',() => dialog.remove()); dialog.showModal();
    });
    root.querySelector<HTMLSelectElement>('#monthly-month')?.addEventListener('change',event => {
      collection = monthlyCollection((event.target as HTMLSelectElement).value); selected = status.today.startsWith(collection.month) ? status.today : collection.start; status = { ...status, completed: [], claimed: [] }; void load(true);
    });
    root.querySelectorAll<HTMLButtonElement>('[data-date]').forEach(button => button.addEventListener('click',() => { selected = button.dataset.date!; render(); }));
    root.querySelector('#monthly-play')?.addEventListener('click',async () => {
      if (!member) { props.onSignIn(); return; }
      if (busy) return;
      busy = true; render();
      try { await props.onPlay(selected); } catch { props.onToast('Could not start puzzle. Please try again.'); }
      finally { busy = false; render(); }
    });
    root.querySelectorAll<HTMLButtonElement>('[data-claim]').forEach(button => button.addEventListener('click',async () => {
      if (busy) return;
      busy = true; render();
      try {
        await claimMonthlyReward(button.dataset.claim!);
        if (!currentAccount()) return;
        useStore.getState().addToInventory(button.dataset.claim!);
        props.onToast('Reward added to My Collection');
        await load();
      } catch { props.onToast('Could not claim reward. Please try again.'); }
      finally { busy = false; render(); }
    }));
  }
  async function load(keepMonth = false) {
    loading = true; failed = false; render();
    try {
      if (!initialized && !keepMonth) {
        const clock = await getMonthlyStatus();
        collection = activeMonthlyCollection(clock.today);
      }
      const next = await getMonthlyStatus(collection.month);
      if (!alive || !currentAccount()) return;
      status = next;
      if ((!initialized || selected > status.today) && status.today.startsWith(collection.month)) selected = status.today;
      initialized = true;
    }
    catch { failed = true; }
    finally { loading = false; render(); }
  }
  render(); void load();
  const refresh = window.setInterval(() => { if (!busy && !loading) void load(); },60000);
  return { unmount() { alive = false; clearInterval(refresh); document.querySelector('dialog.monthly-help')?.remove(); } };
}
