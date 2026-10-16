-- Keep the original theme available as a free, selectable fallback.
insert into public.shop_items (
  id, category, name, description, price_coin, rarity, unlock_type, available, sort_order
)
values (
  'theme_classic', 'theme', 'Classic', 'The original GridNova theme', 0, 'common', 'starter', true, 1
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_coin = 0,
  unlock_type = excluded.unlock_type,
  available = true,
  sort_order = excluded.sort_order;
