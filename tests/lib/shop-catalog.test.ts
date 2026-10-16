import { expect, it } from 'vitest';
import { isShopListing } from '../../src/lib/shop-catalog';
import { MONTHLY_COLLECTIONS } from '../../src/lib/monthly-catalog';

it('excludes all monthly cosmetics from Shop while keeping sale items', () => {
  const rewards = MONTHLY_COLLECTIONS.flatMap(c => c.rewards.map(r => ({ id:r.id, unlock_type:'monthly' })));
  const saleItems = [{ id:'theme_classic',unlock_type:'free' },{ id:'avatar_paid',unlock_type:'coin' }];
  expect(rewards).toHaveLength(72);
  expect([...rewards,...saleItems].filter(isShopListing)).toEqual(saleItems);
});
