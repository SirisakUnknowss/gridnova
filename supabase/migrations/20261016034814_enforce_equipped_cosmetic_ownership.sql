create or replace function public.validate_equipped_cosmetic_ownership()
returns trigger language plpgsql security definer set search_path='' as $$
declare slot record; avatar_id text;
begin
  for slot in select * from (values
    (new.theme_id,'theme'),(new.background_id,'background'),(new.board_color_id,'board_color')
  ) as slots(item_id,category) loop
    if slot.item_id is not null and not exists (
      select 1 from public.shop_items s where s.id=slot.item_id and s.category=slot.category
      and ((s.price_coin=0 and s.unlock_type<>'monthly') or exists (
        select 1 from public.user_inventory i where i.user_id=new.user_id and i.item_id=s.id
      ))
    ) then raise exception 'cosmetic_not_owned: %',slot.item_id; end if;
  end loop;
  if new.avatar is not null and new.avatar<>'{}'::jsonb then
    if jsonb_typeof(new.avatar)<>'object' or (select count(*) from jsonb_object_keys(new.avatar))<>1 then
      raise exception 'invalid_avatar';
    end if;
    if new.avatar ? 'item_id' then
      avatar_id:=new.avatar->>'item_id';
      if not exists(select 1 from public.shop_items s where s.id=avatar_id and s.category='avatar'
        and ((s.price_coin=0 and s.unlock_type<>'monthly') or exists (
          select 1 from public.user_inventory i where i.user_id=new.user_id and i.item_id=s.id
        ))) then raise exception 'avatar_item_not_owned'; end if;
    elsif new.avatar ? 'emoji' then
      if not coalesce(new.avatar->>'emoji'=any(array['👤','🤖','🦸','🧙','🥷','🐱','🦊','🐼','🐯','🦁','🐸','🐧','🦉','🐙','👻','🧑','space_orbit-bunny']),false) then
        raise exception 'avatar_item_not_owned';
      end if;
    else raise exception 'invalid_avatar'; end if;
  end if;
  return new;
end $$;
revoke all on function public.validate_equipped_cosmetic_ownership() from public,anon,authenticated;
create trigger validate_equipped_cosmetic_ownership before insert or update on public.user_equipped
for each row execute function public.validate_equipped_cosmetic_ownership();
