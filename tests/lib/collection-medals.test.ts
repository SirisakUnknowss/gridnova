import { describe, it, expect } from 'vitest';
import { collectionMedals, type CollectionItem } from '../../src/lib/collection-medals';
const items: CollectionItem[] = [
  { id: 'theme_free', category: 'theme', price_coin: 0, rarity: 'rare', available: true },
  { id: 'theme_a', category: 'theme', price_coin: 5000, rarity: 'rare', available: true },
  { id: 'theme_b', category: 'theme', price_coin: 5000, rarity: 'rare', available: true },
  { id: 'avatar_a', category: 'avatar', price_coin: 3500, rarity: 'rare', available: true },
];
describe('collection medals', () => {
  it('does not count free items or duplicate inventory toward purchases', () => {
    const medals = collectionMedals(items, ['theme_free', 'theme_a', 'theme_a']);
    expect(medals[1].current).toBe(1);
    expect(medals[2]).toMatchObject({ current: 1, target: 2, unlocked: false });
  });
  it('unlocks the complete Rare set independently for each category', () => {
    const medals = collectionMedals(items, ['theme_a', 'theme_b']);
    expect(medals[2].unlocked).toBe(true);
    expect(medals[3].unlocked).toBe(false);
  });
  it('does not award an empty catalog collection', () => {
    expect(collectionMedals([], [])[2].unlocked).toBe(false);
  });
});
