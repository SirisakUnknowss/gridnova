import { mountStaticContentView, type StaticContentProps } from './static-content';
import { ic } from '@ui/icons';

export function mountPrivacyPolicyView(root: HTMLElement, props: Pick<StaticContentProps, 'onBack' | 'nav'>) {
  return mountStaticContentView(root, {
    title: 'Privacy Policy',
    icon: ic.lock(22),
    onBack: props.onBack,
    nav: props.nav,
    sections: [
      { body: `<p style="color:var(--app-text-secondary);font-size:13px;">Last updated: July 18, 2026</p>` },
      {
        heading: 'What We Collect',
        body: `<ul>
          <li><b>Account info</b> — if you sign in, your email address and any display
            name, avatar, or country you set on your profile.</li>
          <li><b>Gameplay data</b> — puzzle results, scores, coins, XP, streaks, and
            medals, so your progress can sync across devices.</li>
          <li><b>Guest data</b> — if you play without an account, we store your progress
            against an anonymous device identifier, not tied to your identity.</li>
          <li><b>Basic usage data</b> — which screens you visit and roughly how long you
            play, collected by our own systems (no third-party analytics/ad trackers
            are used). Used only to understand which parts of the app work well.</li>
          <li><b>Crash reports</b> — if the app errors, technical details are sent to
            our error-tracking tool so we can fix bugs.</li>
        </ul>`,
      },
      {
        heading: 'How We Use It',
        body: `<p>Strictly to run the game: save your progress, show leaderboards, award
          coins/XP, send an optional daily-puzzle reminder if you enable it, and fix
          bugs. We do not sell your data, and we do not use third-party ad or
          tracking networks.</p>`,
      },
      {
        heading: 'Who We Share It With',
        body: `<p>We use Supabase to host our database and authentication, which
          processes data on our behalf under their own security practices. If we
          launch paid purchases, a payment processor will handle that transaction —
          we never see or store your card details ourselves.</p>`,
      },
      {
        heading: 'Your Choices',
        body: `<p>You can play entirely as a guest without creating an account. You can
          turn off push notifications and sound at any time in Settings. To delete
          your account and data, contact us via Support.</p>`,
      },
      {
        heading: 'Contact',
        body: `<p>Questions about this policy? Reach us via Contact Support in the
          Help & About section.</p>`,
      },
    ],
  });
}
