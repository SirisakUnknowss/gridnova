begin;
select set_config('qa.owner', (select id::text from auth.users where not is_anonymous order by created_at limit 1), true);
select set_config('qa.other', gen_random_uuid()::text, true);
do $$ begin
  if current_setting('qa.owner') = '' or current_setting('qa.other') = '' then raise exception 'A staging member account is required'; end if;
end $$;
insert into public.user_inventory(user_id,item_id,acquired_from)
values (current_setting('qa.owner')::uuid,'bg_solid_navy','shop') on conflict do nothing;
update public.shop_items set available=false where id='bg_solid_navy';
select public.equip_item(p_user_id=>current_setting('qa.owner')::uuid,p_background_id=>'bg_solid_navy',p_board_color_id=>null,p_avatar=>null);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('qa.owner'),'role','authenticated')::text,true);
set local role authenticated;
do $$ begin
  if (select count(*) from public.shop_items where id='bg_solid_navy') <> 1 then raise exception 'Owner cannot read retired purchase'; end if;
end $$;
reset role;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('qa.other'),'role','authenticated')::text,true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.shop_items where id='bg_solid_navy') then raise exception 'Other account can read retired item'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{}',true);
set local role anon;
do $$ begin
  if exists(select 1 from public.shop_items where id='bg_solid_navy') then raise exception 'Guest can read retired item'; end if;
end $$;
reset role;
select 'PASS: retired item owner read/equip, other account denied, guest denied; fixture rolled back' as result;
rollback;
