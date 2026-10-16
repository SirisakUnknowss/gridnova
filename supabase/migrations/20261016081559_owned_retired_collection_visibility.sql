-- Owners must retain access to retired cosmetics without publishing them in the shop.
create policy "Owners read retired cosmetics"
on public.shop_items
for select
to authenticated
using (
  exists (
    select 1 from public.user_inventory inventory
    where inventory.user_id = (select auth.uid())
      and inventory.item_id = shop_items.id
  )
);
