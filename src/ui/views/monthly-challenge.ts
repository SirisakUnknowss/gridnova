import { ic } from '@ui/icons';
import { useStore } from '@state/store';
import { todayUtc } from '@lib/format';
import { MONTHLY_REWARDS, monthCells, monthlyDayState, rewardState, getMonthlyStatus, claimMonthlyReward, type MonthlyStatus } from '@lib/monthly-challenge';
import { MONTHLY_ART, monthlyThemePreview } from '../components/monthly-art';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';

export function mountMonthlyChallengeView(root: HTMLElement, props: { onBack: () => void; onPlay: (date: string) => Promise<void>; onSignIn: () => void; onCollection: () => void; onToast: (message: string) => void; nav: BottomNavCallbacks }) {
  let alive = true;
  let loading = true;
  let failed = false;
  let busy = false;
  let initialized = false;
  let status: MonthlyStatus = { today: todayUtc(), preview: false, completed: [], claimed: [] };
  let selected = status.today.startsWith('2026-11') ? status.today : '2026-11-01';
  const member = !!useStore.getState().user && !useStore.getState().user?.is_anonymous;
  function render() {
    if (!alive) return;
    const count = status.completed.length;
    const before = status.today < '2026-11-01';
    const ended = status.today > '2026-11-30';
    const done = status.completed.includes(selected);
    root.innerHTML = `<section class="view view--monthly">
      <header class="monthly-topbar"><button class="icon-btn" id="monthly-back" aria-label="Back">${ic.back(26)}</button><h1>Monthly Challenge</h1><button class="icon-btn" id="monthly-help" aria-label="Challenge rules">?</button></header>
      <div class="monthly-hero"><img src="${MONTHLY_ART.hero}" alt="A friendly space robot floating a lotus krathong under the moon"><div class="monthly-hero-copy"><p>November 2026</p><h2>Moonlit Wishes</h2><span>Little lights. Cosmic wishes.</span></div></div>
      ${status.preview ? '<p class="monthly-notice">Staging preview · November 15</p>' : ''}
      <div class="monthly-surface monthly-progress"><strong>${count} / 30 days completed</strong><progress max="30" value="${count}" aria-label="Completed puzzle dates"></progress><p>Missed a day? Play it later.</p></div>
      ${failed ? '<p class="monthly-notice" role="alert">Could not load progress. <button class="btn btn--small" id="monthly-retry">Retry</button></p>' : ''}
      <div class="monthly-surface monthly-calendar" aria-label="November 2026"><div class="monthly-weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => `<span>${day}</span>`).join('')}</div><div class="monthly-dates">${monthCells(2026,11).map(date => date ? `<button class="monthly-day monthly-day--${monthlyDayState(date,status.today,status.completed)}${date === selected ? ' is-selected' : ''}" data-date="${date}" aria-label="November ${Number(date.slice(-2))}${status.completed.includes(date) ? ', completed' : ''}" aria-pressed="${date === selected}" ${date > status.today || before || loading || failed ? 'disabled' : ''}><span>${Number(date.slice(-2))}</span>${status.completed.includes(date) ? '<small aria-hidden="true">✓</small>' : ''}</button>` : '<span></span>').join('')}</div></div>
      <div class="monthly-surface monthly-selected"><div><h2>November ${Number(selected.slice(-2))}</h2><p>Medium · Daily puzzle</p></div><strong class="monthly-coins">${ic.coin(24)} +100 Coins</strong><button class="btn btn--primary" id="monthly-play" ${member && (loading || failed || busy || before || ended || done || selected > status.today) ? 'disabled' : ''}>${!member ? 'Sign in to play' : loading ? 'Loading…' : before ? 'Opens November 1' : ended ? 'Collection ended' : done ? '✓ Completed' : selected === status.today ? 'Play today’s puzzle' : 'Play this puzzle'}</button><small>100 Coins once per completed puzzle date.<br>1 heart · Refunded on win</small></div>
      <div class="monthly-rewards-heading"><h2>Monthly Rewards</h2><span>Moonlit Wishes Collection</span></div>
      <div class="monthly-rewards">${MONTHLY_REWARDS.map(reward => {
        const state = rewardState(reward.days,count,status.claimed.includes(reward.id));
        return `<article class="monthly-reward monthly-surface"><strong class="monthly-milestone">${reward.days} DAYS</strong><div class="monthly-reward-preview">${reward.type === 'Theme' ? monthlyThemePreview(reward.id) : `<img src="${MONTHLY_ART[reward.art]}" alt="${reward.name}" loading="lazy">`}</div><small>${reward.type.toUpperCase()}</small><h3>${reward.name}</h3>${state === 'locked' ? `<div class="monthly-reward-progress"><progress max="${reward.days}" value="${count}" aria-label="${reward.name} progress"></progress><span>${count} / ${reward.days}</span></div>` : `<button class="monthly-claim" data-claim="${reward.id}" ${state === 'claimed' || busy || loading || failed ? 'disabled' : ''}>${state === 'claimed' ? '✓ Claimed' : 'Claim'}</button>`}</article>`;
      }).join('')}</div><p class="monthly-footer">Days don’t need to be consecutive.</p><button class="btn btn--secondary" id="monthly-collection">My Collection</button><p class="monthly-footer">${before ? 'Starts November 1, 2026 · ' : ''}Puzzle dates reset at 00:00 UTC.</p>
    </section>${bottomNavHTML('home')}`;
    wireBottomNav(root,props.nav,'home');
    root.querySelector('#monthly-back')?.addEventListener('click',props.onBack);
    root.querySelector('#monthly-collection')?.addEventListener('click',props.onCollection);
    root.querySelector('#monthly-retry')?.addEventListener('click',() => void load());
    root.querySelector('#monthly-help')?.addEventListener('click',() => {
      const dialog = document.createElement('dialog');
      dialog.className = 'monthly-help';
      dialog.innerHTML = '<h2>Monthly Challenge</h2><p>Complete one puzzle for each date in November. Missed dates stay playable until November 30 (UTC). Future dates unlock at 00:00 UTC.</p><p>Earn 100 Coins once per date. Collect cosmetics at 5, 10, 15, 20, 25 and 30 completed dates. Days don’t need to be consecutive. Claim your cosmetics here and equip them in My Collection.</p><form method="dialog"><button class="btn btn--primary">Got it</button></form>';
      document.body.append(dialog); dialog.addEventListener('close',() => dialog.remove()); dialog.showModal();
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
        useStore.getState().addToInventory(button.dataset.claim!);
        props.onToast('Reward added to My Collection');
        await load();
      } catch { props.onToast('Could not claim reward. Please try again.'); }
      finally { busy = false; render(); }
    }));
  }
  async function load() {
    loading = true; failed = false; render();
    try {
      status = await getMonthlyStatus();
      if ((!initialized || selected > status.today) && status.today.startsWith('2026-11')) selected = status.today;
      initialized = true;
    }
    catch { failed = true; }
    finally { loading = false; render(); }
  }
  render(); void load();
  const refresh = window.setInterval(() => { if (!busy) void load(); },60000);
  return { unmount() { alive = false; clearInterval(refresh); document.querySelector('dialog.monthly-help')?.remove(); } };
}
