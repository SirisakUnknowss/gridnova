import timeAttack from '@images/space/time-attack.webp';
import mascot from '@images/space/mascot.webp';
import daily from '@images/space/dailyIcon.webp';
import random from '@images/space/diceIcon.webp';
import book from '@images/space/bookModeIcon.webp';
import trophy from '@images/space/trophyIcon.webp';
import medals from '@images/space/page-medals.webp';
import quests from '@images/space/page-quests.webp';
import stats from '@images/space/page-stats.webp';
import settings from '@images/space/page-settings.webp';
import shop from '@images/space/shop-capsule.webp';

const pageArt = { timeAttack, mascot, daily, random, book, trophy, medals, quests, stats, settings, shop };

export function pageArtHTML(kind: keyof typeof pageArt): string {
  return `<div class="space-page-art" aria-hidden="true"><img src="${pageArt[kind]}" width="144" height="144" alt="" decoding="async"></div>`;
}
