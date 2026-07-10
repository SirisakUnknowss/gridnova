// =====================================================================
// Random Mode leaderboard — ranked by longest win streak
// =====================================================================
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { escapeHtml } from '@lib/format';
import { supabase } from '@lib/supabase';

export interface RandomLeaderboardProps {
  onBack: () => void;
  nav: BottomNavCallbacks;
}

export function mountRandomLeaderboardView(root: HTMLElement, props: RandomLeaderboardProps): { unmount: () => void } {
  root.innerHTML = `
    <section class="view view--play-mode">
      <div class="ach-sticky">
        <div class="ach-topbar">
          <button class="ach-back" id="rl-back" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 class="ach-title">${ic.dice(20)} Random Mode</h1>
          <div style="width:40px;flex:none"></div>
        </div>
      </div>
      <div id="rl-body"><div class="ach-loading">Loading…</div></div>
    </section>
    ${bottomNavHTML('home')}
  `;

  root.querySelector('#rl-back')?.addEventListener('click', props.onBack);
  wireBottomNav(root, props.nav, 'home');

  const body = root.querySelector<HTMLElement>('#rl-body')!;

  void (async () => {
    try {
      const { data, error } = await supabase.rpc('get_random_mode_leaderboard', { p_limit: 50 });
      if (error || !data || (data as unknown[]).length === 0) {
        body.innerHTML = `<div class="ach-empty">No streaks yet — be the first!</div>`;
        return;
      }
      body.innerHTML = `<div class="pm-list">${(data as any[]).map((row, i) => `
        <div class="pm-row" style="cursor:default">
          <span class="pm-row-rank">#${i + 1}</span>
          <div class="pm-row-body">
            <span class="pm-row-title">${escapeHtml(row.display_name || 'Player')}</span>
            <span class="pm-row-sub">Current streak: ${row.current_win_streak}</span>
          </div>
          <span class="pm-streak-badge">${ic.streak(13)} ${row.longest_win_streak}</span>
        </div>
      `).join('')}</div>`;
    } catch {
      body.innerHTML = `<div class="ach-empty">Could not load leaderboard.</div>`;
    }
  })();

  return { unmount() {} };
}
