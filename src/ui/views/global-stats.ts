// =====================================================================
// Global Stats page — all-time records and community averages
// =====================================================================
import * as api from '@lib/api';
import { formatTime, formatNumber, escapeHtml } from '@lib/format';
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';

export interface GlobalStatsProps {
  onBack: () => void;
  nav: BottomNavCallbacks;
}

export function mountGlobalStatsView(root: HTMLElement, props: GlobalStatsProps): { unmount: () => void } {
  root.innerHTML = `
    <section class="view">
      <div class="top-bar">
        <button class="icon-btn" id="gs-back" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 style="margin:0;font-size:16px;color:var(--app-text);">${ic.globe(16)} Global Stats</h2>
        <span style="width:38px;"></span>
      </div>
      <div id="gs-body" class="stats-body"><div class="shop-loading">Loading…</div></div>
    </section>
    ${bottomNavHTML('home')}
  `;
  wireBottomNav(root, props.nav, 'home');

  const body = root.querySelector<HTMLElement>('#gs-body')!;

  async function load() {
    try {
      const [summary, records] = await Promise.all([
        api.getGlobalSummary(),
        api.getGlobalTopRecords(),
      ]);

      const avgTime = summary?.avg_time_seconds ?? 0;
      const avgMistakes = Number(summary?.avg_mistakes ?? 0).toFixed(1);
      const avgScore = summary?.avg_score ?? 0;

      function playerName(row: any): string {
        const p = row.profiles;
        return escapeHtml(p?.display_name || p?.username || 'Anonymous');
      }

      body.innerHTML = `
        <div class="card" style="margin-bottom:14px;">
          <h3 style="margin-bottom:12px;">${ic.chart(15)} Community (last 30 days)</h3>
          <div class="profile-stats">
            <div class="stat-tile">
              <div class="stat-label">Games</div>
              <div class="stat-value">${formatNumber(summary?.total_games ?? 0)}</div>
            </div>
            <div class="stat-tile">
              <div class="stat-label">Players</div>
              <div class="stat-value">${formatNumber(summary?.total_players ?? 0)}</div>
            </div>
            <div class="stat-tile">
              <div class="stat-label">Avg Score</div>
              <div class="stat-value">${formatNumber(avgScore)}</div>
            </div>
          </div>
          <div class="profile-stats" style="margin-top:10px;">
            <div class="stat-tile">
              <div class="stat-label">Avg Time</div>
              <div class="stat-value">${avgTime ? formatTime(avgTime) : '—'}</div>
            </div>
            <div class="stat-tile">
              <div class="stat-label">Avg Mistakes</div>
              <div class="stat-value">${avgMistakes}</div>
            </div>
            <div class="stat-tile">
              <div class="stat-label">Avg Hints</div>
              <div class="stat-value">${Number(summary?.avg_hints ?? 0).toFixed(1)}</div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:14px;">
          <h3 style="margin-bottom:12px;">${ic.zap(15)} Fastest Daily Solves (All-time)</h3>
          ${records.fastest.length === 0
            ? '<p style="opacity:0.6;font-size:13px;">No records yet.</p>'
            : records.fastest.map((r: any, i: number) => `
              <div class="quest-row">
                <div class="quest-icon" style="font-size:18px;">${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</div>
                <div class="quest-body">
                  <div class="quest-title">${playerName(r)}</div>
                  <div class="quest-meta"><span>${formatTime(r.time_seconds)}</span><span style="opacity:0.6;">${escapeHtml(r.level ?? '')}</span></div>
                </div>
              </div>
            `).join('')}
        </div>

        <div class="card">
          <h3 style="margin-bottom:12px;">${ic.trophy(15)} Highest Scores (All-time)</h3>
          ${records.highest.length === 0
            ? '<p style="opacity:0.6;font-size:13px;">No records yet.</p>'
            : records.highest.map((r: any, i: number) => `
              <div class="quest-row">
                <div class="quest-icon" style="font-size:18px;">${['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</div>
                <div class="quest-body">
                  <div class="quest-title">${playerName(r)}</div>
                  <div class="quest-meta"><span>${formatNumber(r.score)} pts</span><span style="opacity:0.6;">${escapeHtml(r.level ?? '')}</span></div>
                </div>
              </div>
            `).join('')}
        </div>
      `;
    } catch (err) {
      body.innerHTML = `<div class="lb-empty"><p>${ic.warning(16)} ${escapeHtml((err as Error).message)}</p></div>`;
    }
  }

  root.querySelector('#gs-back')?.addEventListener('click', props.onBack);
  void load();

  return { unmount() {} };
}
