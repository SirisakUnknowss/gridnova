alter table public.user_equipped add column frame_id text references public.shop_items(id);

insert into public.shop_items (id, category, name, description, price_coin, rarity, unlock_type, available, sort_order, metadata)
values
('frame_star_halo','avatar_frame','Star Halo','A sparkling halo for your avatar',800,'common','coin',true,400,'{}'),
('frame_ocean_bubbles','avatar_frame','Ocean Bubbles','A pearl ring with floating bubbles',1200,'rare','coin',true,401,'{}'),
('frame_sakura_bloom','avatar_frame','Sakura Bloom','A delicate ring of sakura petals',1600,'rare','coin',true,402,'{}'),
('frame_royal_orbit','avatar_frame','Royal Orbit','A double orbit crowned with a jewel',2000,'epic','coin',true,403,'{}');

create function public.validate_avatar_frame() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.frame_id is not null and not exists (
    select 1 from public.shop_items s join public.user_inventory i on i.item_id=s.id
    where s.id=new.frame_id and s.category='avatar_frame' and i.user_id=new.user_id
  ) then raise exception 'frame_not_owned'; end if;
  return new;
end;
$$;
revoke all on function public.validate_avatar_frame() from public, anon, authenticated;
create trigger validate_avatar_frame before insert or update of frame_id, user_id
on public.user_equipped for each row execute function public.validate_avatar_frame();

create function public.equip_avatar_frame(p_frame_id text) returns public.user_equipped
language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_equipped public.user_equipped;
begin
  if v_user is null or not exists(select 1 from auth.users where id=v_user and is_anonymous=false)
    then raise exception 'unauthorized'; end if;
  insert into public.user_equipped(user_id,frame_id) values(v_user,p_frame_id)
  on conflict(user_id) do update set frame_id=excluded.frame_id,updated_at=now()
  returning * into v_equipped;
  return v_equipped;
end;
$$;
revoke all on function public.equip_avatar_frame(text) from public, anon;
grant execute on function public.equip_avatar_frame(text) to authenticated;
