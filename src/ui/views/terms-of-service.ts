import { mountStaticContentView, type StaticContentProps } from './static-content';
import { ic } from '@ui/icons';

export function mountTermsOfServiceView(root: HTMLElement, props: Pick<StaticContentProps, 'onBack' | 'nav'>) {
  return mountStaticContentView(root, {
    title: 'Terms of Service',
    icon: ic.puzzle(22),
    onBack: props.onBack,
    nav: props.nav,
    sections: [
      { body: `<p style="color:var(--app-text-secondary);font-size:13px;">Last updated: July 18, 2026</p>` },
      {
        heading: 'Using GridNova',
        body: `<p>GridNova is a free-to-play Sudoku game. By playing, you agree to these
          terms. You can play as a guest or create an account — either way, please
          keep your login details private and don't share your account.</p>`,
      },
      {
        heading: 'Fair Play',
        body: `<p>Daily Puzzle uses a shared leaderboard, so we ask that you play fair:
          no automated solvers, exploits, or multiple accounts to game the rankings.
          We may flag, adjust, or remove scores that look abnormal, and may suspend
          accounts that repeatedly break this rule.</p>`,
      },
      {
        heading: 'Coins & Virtual Items',
        body: `<p>Coins, themes, avatars, and other in-app items have no real-world
          monetary value and cannot be exchanged for cash. We may adjust the coin
          economy (rewards, prices) over time to keep the game balanced; we'll note
          meaningful changes in What's New.</p>`,
      },
      {
        heading: 'Events & Promotions',
        body: `<p>From time to time we may run special events, contests, or promotions.
          Any such event will have its own rules, published separately, which take
          priority for that event.</p>`,
      },
      {
        heading: 'Changes to the Game',
        body: `<p>We're actively building GridNova and may add, change, or remove
          features, rebalance rewards, or update these terms as the game evolves.
          We'll do our best to communicate meaningful changes via What's New.</p>`,
      },
      {
        heading: 'Disclaimer',
        body: `<p>GridNova is provided "as is," without warranties of any kind. We work
          to keep the game running smoothly but can't guarantee it will always be
          available or error-free.</p>`,
      },
      {
        heading: 'Contact',
        body: `<p>Questions about these terms? Reach us via Contact Support in the
          Help & About section.</p>`,
      },
    ],
  });
}
