insert into public.shop_items (
  id, category, name, description, price_coin, rarity, unlock_type, available, sort_order
)
values (
  'theme_classic_v1', 'theme', 'GridNova V1', 'The original pre-2.0 interface', 0, 'common', 'starter', true, 2
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_coin = excluded.price_coin,
  unlock_type = excluded.unlock_type,
  available = excluded.available,
  sort_order = excluded.sort_order;
