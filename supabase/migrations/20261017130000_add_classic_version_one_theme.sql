insert into public.shop_items (
  id, category, name, description, price_coin, rarity, unlock_type, available, sort_order
)
values (
  'theme_classic_v1', 'theme', 'Classic Version 1', 'The original Classic look without a background image', 0, 'common', 'starter', true, 2
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_coin = 0,
  unlock_type = excluded.unlock_type,
  available = true,
  sort_order = excluded.sort_order;
