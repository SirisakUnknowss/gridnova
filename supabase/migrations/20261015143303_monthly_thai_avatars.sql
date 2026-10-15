-- Preserve reward IDs so existing claims and equipped avatars keep their ownership.
update public.shop_items set name='Lotus Girl'
where id='avatar_monthly_lotus_otter' and unlock_type='monthly';
update public.shop_items set name='Moonlit Boy'
where id='avatar_monthly_moon_rabbit' and unlock_type='monthly';
