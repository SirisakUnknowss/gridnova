import { mountStaticContentView, type StaticContentProps } from './static-content';
import { ic } from '@ui/icons';

export function mountHowToPlayView(root: HTMLElement, props: Pick<StaticContentProps, 'onBack' | 'nav'>) {
  return mountStaticContentView(root, {
    title: 'How to Play',
    icon: ic.brain(22),
    onBack: props.onBack,
    nav: props.nav,
    sections: [
      {
        heading: 'The Rules',
        body: `<p>Fill the 9×9 grid so that every row, every column, and every 3×3 box
          contains the digits 1 through 9 exactly once. Every puzzle has one unique
          solution — no guessing required.</p>`,
      },
      {
        heading: 'Controls',
        body: `<ul>
          <li>Tap a cell, then tap a number to place it.</li>
          <li>Toggle <b>Notes</b> mode to pencil in candidate numbers.</li>
          <li>Use <b>Undo/Redo</b> to step back through your moves.</li>
          <li>Tap <b>Erase</b> to clear a cell.</li>
        </ul>`,
      },
      {
        heading: 'Game Modes',
        body: `<ul>
          <li><b>Daily Puzzle</b> — one puzzle a day, shared by everyone. Compete on
            the global leaderboard by score.</li>
          <li><b>Practice</b> — play any difficulty, any time, as many times as you like.</li>
          <li><b>Random</b> — one tap, random difficulty, builds a win streak.</li>
        </ul>`,
      },
      {
        heading: 'Hints & Mistakes',
        body: `<p>Everyone starts with 3 free hints per puzzle. In Practice/Random you can
          buy a few more with coins, and higher levels grant extra free hints — but
          Daily keeps hints equal for all players, since it has a shared leaderboard.
          Three mistakes ends the game, so place carefully.</p>`,
      },
      {
        heading: 'Coins, XP & Medals',
        body: `<p>Finishing puzzles earns coins and XP. Coins unlock themes, avatars, and
          board colors in the Shop. XP levels you up, and medals unlock as you hit
          play, streak, and skill milestones.</p>`,
      },
    ],
  });
}
