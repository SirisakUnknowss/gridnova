export function isShopListing(item: { unlock_type: string }): boolean {
  return item.unlock_type !== 'monthly';
}
