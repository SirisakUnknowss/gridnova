import { describe, expect, it } from 'vitest';
import { RARE_AVATAR_CATALOG } from '../../src/lib/rare-avatar-catalog';

describe('Rare theme avatar catalog', () => {
  it('offers one paid Rare avatar for each of the eleven themes', () => {
    expect(RARE_AVATAR_CATALOG).toHaveLength(11);
    expect(new Set(RARE_AVATAR_CATALOG.map(item => item.id)).size).toBe(11);
    expect(new Set(RARE_AVATAR_CATALOG.map(item => item.metadata.theme_id)).size).toBe(11);
    for (const item of RARE_AVATAR_CATALOG) {
      expect(item.price_coin).toBe(3500);
      expect(item.rarity).toBe('rare');
      expect(item.unlock_type).toBe('shop');
    }
  });
});
