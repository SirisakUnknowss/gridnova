import infoIcon from '@images/information.png';
import { BASE_SCORE, TIME_ATTACK_TIERS } from '@engine/scoring';

export type ModeInfoKey = 'daily' | 'time-attack' | 'random' | 'book';

interface ModeInfo {
  title: string;
  howToPlay: string[];
  scoring: string[];
}

const fmt = (n: number) => n.toLocaleString('en-US');

const baseLine = `Base score by difficulty: Easy ${fmt(BASE_SCORE.easy)} · Medium ${fmt(BASE_SCORE.medium)} · Hard ${fmt(BASE_SCORE.hard)} · Expert ${fmt(BASE_SCORE.expert)}.`;

const tierLine = (Object.entries(TIME_ATTACK_TIERS) as [string, { seconds: number; difficulty: string }][])
  .map(([tier, t]) => `${tier[0].toUpperCase()}${tier.slice(1)}: ${t.seconds / 60} min, ${t.difficulty}`)
  .join(' · ');

const MODE_INFO: Record<ModeInfoKey, ModeInfo> = {
  daily: {
    title: 'Daily Puzzle',
    howToPlay: [
      'One puzzle a day — the same grid for every player worldwide.',
      'Difficulty changes with the day of the week.',
      'Starting costs 1 heart; winning gives it back.',
      '3 mistakes ends the game. You can buy a continue with coins, but hints can’t be bought.',
    ],
    scoring: [
      baseLine,
      '−2 points for every second on the clock.',
      '−100 per mistake, −300 per hint.',
      '+500 bonus for no mistakes, +300 bonus for no hints.',
      'Continues don’t erase mistakes. Your score ranks you on the daily leaderboard.',
    ],
  },
  'time-attack': {
    title: 'Time Attack',
    howToPlay: [
      'Solve the puzzle before the countdown hits zero.',
      `Pick a tier — ${tierLine}.`,
      'Starting costs 1 heart; winning gives it back.',
      'No coin hints and no continues — it’s a fair race.',
    ],
    scoring: [
      'Base score comes from the tier’s difficulty.',
      'Time bonus: base × (seconds left ÷ time limit). Finish fast to nearly double it.',
      '−100 per mistake, −250 per hint.',
      '+300 bonus for a flawless run (no mistakes, no hints).',
      'Each tier has its own leaderboard — your best run counts.',
    ],
  },
  random: {
    title: 'Random Mode',
    howToPlay: [
      'One tap starts a game at a random difficulty.',
      'Win games back to back to build your streak.',
      'Lose once and the streak resets to 0 — no continues.',
      'Starting costs 1 heart; winning gives it back.',
    ],
    scoring: [
      baseLine,
      '−2 points per second (capped at half the base score).',
      '−50 per mistake, −150 per hint.',
      'Your win streak is what counts — bonus coins every 5 wins in a row.',
    ],
  },
  book: {
    title: 'Book Mode',
    howToPlay: [
      'Solve like a paper puzzle book — no red cells, no mistake counter.',
      'Nothing tells you right or wrong until the grid is full.',
      'Fill every cell, then check your answer.',
      '3 free hints, no coin hints. Free to play — no hearts needed.',
    ],
    scoring: [
      baseLine,
      '−2 points per second (capped at half the base score).',
      'Fixing your own mistakes is free — only a full grid that checks wrong costs −50.',
      'Asking to reveal the wrong cells also costs −50, and each hint −150.',
    ],
  },
};

export function infoButtonHTML(key: ModeInfoKey): string {
  return `<button class="mode-info-btn" type="button" data-mode-info="${key}" aria-label="How to play">
    <img src="${infoIcon}" alt="" width="18" height="18">
  </button>`;
}

/** Wires every `[data-mode-info]` button under root. Stops propagation so the row's own tap doesn't fire. */
export function wireInfoButtons(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>('[data-mode-info]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showModeInfoModal(btn.dataset.modeInfo as ModeInfoKey);
    });
  });
}

export function showModeInfoModal(key: ModeInfoKey): void {
  document.getElementById('mode-info-root')?.remove();
  const info = MODE_INFO[key];
  const list = (items: string[]) => `<ul class="mode-info-list">${items.map((t) => `<li>${t}</li>`).join('')}</ul>`;

  const wrapper = document.createElement('div');
  wrapper.id = 'mode-info-root';
  wrapper.className = 'modal-bg active';
  wrapper.innerHTML = `
    <div class="modal mode-info-modal" role="dialog" aria-modal="true" aria-labelledby="mode-info-title">
      <button class="modal-close" id="mode-info-close" aria-label="Close">×</button>
      <img class="mode-info-hero" src="${infoIcon}" alt="" width="56" height="56">
      <h2 id="mode-info-title">${info.title}</h2>
      <h3 class="mode-info-heading">How to play</h3>
      ${list(info.howToPlay)}
      <h3 class="mode-info-heading">Scoring</h3>
      ${list(info.scoring)}
      <button class="btn btn--full" id="mode-info-ok" type="button">Got it</button>
    </div>
  `;
  document.body.appendChild(wrapper);

  const close = () => {
    document.removeEventListener('keydown', onKey);
    wrapper.remove();
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  wrapper.querySelector('#mode-info-close')?.addEventListener('click', close);
  wrapper.querySelector('#mode-info-ok')?.addEventListener('click', close);
  wrapper.addEventListener('click', (e) => { if (e.target === wrapper) close(); });
}
