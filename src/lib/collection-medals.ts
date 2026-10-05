export interface CollectionItem { id: string; category: string; rarity: string | null; price_coin: number; available: boolean }
export function collectionMedals(items: CollectionItem[], inventory: string[]) {
  const owned = new Set(inventory);
  const paid = items.filter(item => item.available && item.price_coin > 0);
  const themes = paid.filter(item => item.category === 'theme' && item.rarity === 'rare');
  const avatars = paid.filter(item => item.category === 'avatar' && item.rarity === 'rare');
  const count = (pool: CollectionItem[]) => pool.filter(item => owned.has(item.id)).length;
  return [
    { id: 'SHOP_FIRST_PURCHASE', name: 'First Treasure', description: 'Purchase your first Shop item.', current: Math.min(count(paid), 1), target: 1 },
    { id: 'SHOP_COLLECTOR', name: 'Treasure Collector', description: 'Own 5 paid themes or avatars.', current: Math.min(count(paid), 5), target: 5 },
    { id: 'SHOP_RARE_THEMES', name: 'Rare Theme Master', description: 'Collect every Rare theme.', current: count(themes), target: themes.length },
    { id: 'SHOP_RARE_AVATARS', name: 'Rare Avatar Master', description: 'Collect every Rare avatar.', current: count(avatars), target: avatars.length },
  ].map(medal => ({ ...medal, unlocked: medal.target > 0 && medal.current >= medal.target }));
}
