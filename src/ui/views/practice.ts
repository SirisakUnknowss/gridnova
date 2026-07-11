// =====================================================================
// Practice view — free play, choose your own difficulty (moved out of Home)
// =====================================================================
import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import { formatTime } from '@lib/format';
import { listGames, type GameInProgress } from '@lib/local-db';

export interface PracticeViewProps {
  onBack: () => void;
  onPlayPractice: (level: string) => void;
  onContinuePractice: (saved: GameInProgress) => void;
  nav: BottomNavCallbacks;
}

const PRACTICE_META: Record<string, { label: string; sub: string; color: string }> = {
  easy: { label: 'Easy', sub: 'Relaxed', color: '#10b981' },
  medium: { label: 'Medium', sub: 'Balanced', color: '#f59e0b' },
  hard: { label: 'Hard', sub: 'Tricky', color: '#ef4444' },
  expert: { label: 'Expert', sub: 'Brutal', color: '#6c5ce7' },
};

export function mountPracticeView(root: HTMLElement, props: PracticeViewProps): { unmount: () => void } {
  root.innerHTML = `
    <section class="view view--practice">
      <div class="ach-sticky">
        <div class="ach-topbar">
          <button class="ach-back" id="practice-back" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 class="ach-title">${ic.practice(20)} Practice</h1>
          <div style="width:40px;flex:none"></div>
        </div>
      </div>

      <div id="practice-continue-banner" style="display:none; width: 100%"></div>

      <p class="practice-sub">Choose your own difficulty — play as many times as you like.</p>

      <div class="practice-grid-v2">
        ${Object.entries(PRACTICE_META).map(([key, meta]) => `
          <button class="practice-card-v2" data-practice="${key}">
            <span class="practice-card-v2-icon" style="color:${meta.color}">
              ${key === 'easy' ? ic.easy(22) : key === 'medium' ? ic.medium(22) : key === 'hard' ? ic.hard(22) : ic.expert(22)}
            </span>
            <div class="practice-card-v2-labels">
              <span class="practice-card-v2-name">${meta.label}</span>
              <span class="practice-card-v2-sub">${meta.sub}</span>
            </div>
          </button>
        `).join('')}
      </div>
    </section>
    ${bottomNavHTML('home')}
  `;

  root.querySelector('#practice-back')?.addEventListener('click', props.onBack);
  root.querySelectorAll('[data-practice]').forEach((btn) => {
    btn.addEventListener('click', () => props.onPlayPractice((btn as HTMLElement).dataset.practice!));
  });
  wireBottomNav(root, props.nav, 'home');

  // Check for a resumable practice save (exclude Random Mode's saves)
  const continueBanner = root.querySelector<HTMLElement>('#practice-continue-banner')!;
  void listGames().then((games) => {
    const saved = games.find((g) => g.mode === 'practice' && !g.origin);
    if (!saved) return;
    continueBanner.style.display = 'block';
    continueBanner.innerHTML = `
      <div class="continue-banner">
        <div class="continue-banner-info">
          <span class="continue-banner-title">▶ Game in progress</span>
          <span class="continue-banner-sub">${saved.level ?? ''} · ${formatTime(saved.elapsed_seconds ?? 0)} elapsed</span>
        </div>
        <button class="btn btn--primary btn--small" id="practice-continue-btn">Continue</button>
      </div>
    `;
    continueBanner.querySelector('#practice-continue-btn')?.addEventListener('click', () => {
      props.onContinuePractice(saved);
    });
  });

  return { unmount() { } };
}
