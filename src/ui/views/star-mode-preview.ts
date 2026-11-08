import { bottomNavHTML, wireBottomNav, type BottomNavCallbacks } from '../components/bottom-nav';
import { ic } from '@ui/icons';
import livingRoomArt from '../../images/star-mode-living-room.png';

interface StarModePreviewProps {
  onBack: () => void;
  nav: BottomNavCallbacks;
}

const tasks = [
  { name: 'Restore the wooden floor', cost: 2, detail: 'Place the first piece of your riverside home.' },
  { name: 'Open the old shutters', cost: 2, detail: 'Reveal a little more of the view.' },
  { name: 'Add a woven rug', cost: 3, detail: 'Bring warmth to the room.' },
  { name: 'Place a reading bench', cost: 3, detail: 'A quiet spot beside the canal.' },
  { name: 'Hang a lantern', cost: 3, detail: 'Light up the evening.' },
  { name: 'Restore the wooden cabinet', cost: 4, detail: 'Give treasured things a place.' },
  { name: 'Bring in greenery', cost: 3, detail: 'Let the garden into the room.' },
  { name: 'Frame the walls', cost: 3, detail: 'Add a finishing touch.' },
  { name: 'Dress the windows', cost: 3, detail: 'Complete the view.' },
  { name: 'Light the whole house', cost: 4, detail: 'See the complete picture.' },
];

function piecePath(row: number, col: number): string {
  const x = col * 100;
  const y = row * 100;
  const edge = (sx: number, sy: number, ex: number, ey: number, bulge: number, vertical: boolean): string => {
    const point = (t: number, offset: number) => {
      const px = sx + (ex - sx) * t + (vertical ? offset : 0);
      const py = sy + (ey - sy) * t + (vertical ? 0 : offset);
      return `${px} ${py}`;
    };
    if (bulge === 0) return `L ${ex} ${ey}`;
    return `L ${point(.35, 0)} C ${point(.35, -bulge * .25)} ${point(.43, -bulge * .25)} ${point(.42, bulge * .6)} C ${point(.39, bulge * 1.2)} ${point(.45, bulge * 1.5)} ${point(.5, bulge * 1.5)} C ${point(.55, bulge * 1.5)} ${point(.61, bulge * 1.2)} ${point(.58, bulge * .6)} C ${point(.57, -bulge * .25)} ${point(.65, -bulge * .25)} ${point(.65, 0)} L ${ex} ${ey}`;
  };
  const horizontalBulge = (boundary: number, segment: number) => (boundary + segment) % 2 === 0 ? 12 : -12;
  const verticalBulge = (segment: number, boundary: number) => (segment + boundary) % 2 === 0 ? 12 : -12;
  return `M ${x} ${y} ${edge(x, y, x + 100, y, row === 0 ? 0 : horizontalBulge(row, col), false)} ${edge(x + 100, y, x + 100, y + 100, col === 2 ? 0 : verticalBulge(row, col + 1), true)} ${edge(x + 100, y + 100, x, y + 100, row === 2 ? 0 : horizontalBulge(row + 1, col), false)} ${edge(x, y + 100, x, y, col === 0 ? 0 : verticalBulge(row, col), true)} Z`;
}

function puzzleArt(): string {
  return Array.from({ length: 9 }, (_, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return `<clipPath id="star-piece-clip-${index}"><path d="${piecePath(row, col)}" /></clipPath>`;
  }).join('');
}

function puzzlePieces(imageUrl: string): string {
  return Array.from({ length: 9 }, (_, index) => `
    <g class="star-puzzle-piece" data-piece="${index}" clip-path="url(#star-piece-clip-${index})">
      <image href="${imageUrl}" x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
    </g>
    <path class="star-puzzle-seam" data-seam="${index}" d="${piecePath(Math.floor(index / 3), index % 3)}" />
  `).join('');
}

export function mountStarModePreview(root: HTMLElement, props: StarModePreviewProps): { unmount: () => void } {
  let stars = 6;
  let completed = 0;
  let style = 0;
  const styles = ['Warm teak', 'Light bamboo', 'Deep walnut'];

  root.innerHTML = `
    <section class="view view--star-preview">
      <div class="ach-sticky"><div class="ach-topbar">
        <button class="icon-btn" id="star-back" aria-label="Back">${ic.back(26)}</button>
        <h1 class="ach-title">Star Mode</h1>
        <span class="star-preview-balance" id="star-balance">★ 6</span>
      </div></div>
      <div class="star-preview-intro">
        <span class="star-preview-eyebrow">UI PREVIEW · LIVING ROOM</span>
        <h2>Make this place yours</h2>
        <p>Win Sudoku puzzles to earn stars. Use them to bring this riverside home back to life.</p>
      </div>
      <div class="star-preview-scene" id="star-scene" role="img" aria-label="Illustration of a traditional Thai riverside living room">
        <img class="star-scene-underlay" src="${livingRoomArt}" alt="" />
        <svg class="star-puzzle-board" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>${puzzleArt()}</defs>
          ${puzzlePieces(livingRoomArt)}
        </svg>
        <div class="star-scene-shade"></div>
        <div class="star-scene-sparkles" aria-hidden="true">✦ <span>✧</span> ✦</div>
        <span class="star-scene-caption">✦ Riverside House <small>CHAPTER 01</small></span>
      </div>
      <div class="star-preview-progress"><span id="star-progress-label">0 of 10 restorations</span><span id="star-progress-percent">0%</span></div>
      <div class="star-preview-track"><span id="star-progress-fill"></span></div>
      <div class="star-preview-task" id="star-task"></div>
      <button class="star-preview-play" id="star-play">Preview a win <span>+3 ★</span></button>
      <p class="star-preview-note">Preview only · progress and stars reset when you leave.</p>
    </section>
    ${bottomNavHTML('home')}
  `;

  const scene = root.querySelector<HTMLElement>('#star-scene')!;
  const task = root.querySelector<HTMLElement>('#star-task')!;

  function render() {
    root.querySelector('#star-balance')!.textContent = `★ ${stars}`;
    root.querySelector('#star-progress-label')!.textContent = `${completed} of 10 restorations`;
    root.querySelector('#star-progress-percent')!.textContent = `${completed * 10}%`;
    (root.querySelector<HTMLElement>('#star-progress-fill')!).style.width = `${completed * 10}%`;
    scene.dataset.stage = String(completed);
    scene.dataset.style = String(style);
    scene.querySelectorAll<SVGElement>('.star-puzzle-piece').forEach((piece, index) => piece.classList.toggle('is-placed', index < completed));
    scene.querySelectorAll<SVGElement>('.star-puzzle-seam').forEach((seam, index) => seam.classList.toggle('is-placed', index < completed));
    const next = tasks[completed];
    task.innerHTML = next ? `
      <div class="star-task-heading"><span class="star-task-kicker">NEXT RESTORATION</span><span class="star-task-count">${completed + 1} / 10</span></div>
      <h3>${next.name}</h3><p>${next.detail}</p>
      <button class="star-task-action" id="star-restore" ${stars < next.cost ? 'disabled' : ''}>Place next piece <span>★ ${next.cost}</span></button>
      ${completed > 0 ? `<button class="star-style-action" id="star-style">Style: ${styles[style]} ↻</button>` : ''}
    ` : `
      <div class="star-task-heading"><span class="star-task-kicker">PREVIEW COMPLETE</span></div>
      <h3>Picture complete</h3><p>Your riverside home is ready. This is a visual preview of Star Mode.</p>
      <button class="star-style-action" id="star-style">Style: ${styles[style]} ↻</button>
    `;
    task.querySelector('#star-restore')?.addEventListener('click', () => {
      if (!next || stars < next.cost) return;
      stars -= next.cost;
      completed += 1;
      render();
    });
    task.querySelector('#star-style')?.addEventListener('click', () => {
      style = (style + 1) % styles.length;
      render();
    });
  }

  root.querySelector('#star-back')?.addEventListener('click', props.onBack);
  root.querySelector('#star-play')?.addEventListener('click', () => { stars += 3; render(); });
  wireBottomNav(root, props.nav, 'home');
  render();
  return { unmount() {} };
}
