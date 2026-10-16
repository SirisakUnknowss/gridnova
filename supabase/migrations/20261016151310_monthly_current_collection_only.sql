create or replace function public.get_monthly_collection(p_month text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare v_collection monthly_private.collections; v_today date := monthly_private.today();
begin
  select * into v_collection from monthly_private.collections
    where id=p_month and v_today between starts_on and ends_on;
  if not found then raise exception 'Collection is not active'; end if;
  return jsonb_build_object('today',v_today,'preview',exists(select 1 from monthly_private.config where preview_today is not null),
    'completed',coalesce((select jsonb_agg(date order by date) from public.monthly_completions where user_id=auth.uid() and date between v_collection.starts_on and v_collection.ends_on),'[]'::jsonb),
    'claimed',coalesce((select jsonb_agg(i.item_id) from public.user_inventory i join monthly_private.rewards r on r.item_id=i.item_id where i.user_id=auth.uid() and r.collection_id=p_month),'[]'::jsonb));
end;
$$;

create or replace function public.get_monthly_challenge() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare v_today date := monthly_private.today(); v_month text;
begin
  select id into v_month from monthly_private.collections where v_today between starts_on and ends_on;
  if v_month is null then
    return jsonb_build_object('today',v_today,'preview',exists(select 1 from monthly_private.config where preview_today is not null),'completed','[]'::jsonb,'claimed','[]'::jsonb);
  end if;
  return public.get_monthly_collection(v_month);
end;
$$;

create or replace function public.claim_monthly_reward(p_item text) returns void
language plpgsql security definer set search_path='' as $$
declare v_user uuid := monthly_private.member(); v_reward monthly_private.rewards; v_collection monthly_private.collections; v_count integer;
begin
  select * into strict v_reward from monthly_private.rewards where item_id=p_item;
  select * into strict v_collection from monthly_private.collections where id=v_reward.collection_id;
  if monthly_private.today() not between v_collection.starts_on and v_collection.ends_on then
    raise exception 'Collection is not active';
  end if;
  select count(*) into v_count from public.monthly_completions where user_id=v_user and date between v_collection.starts_on and v_collection.ends_on;
  if v_count<v_reward.days then raise exception 'Complete more puzzle dates to claim this reward'; end if;
  perform set_config('monthly.claiming',v_user::text,true);
  insert into public.user_inventory(user_id,item_id,acquired_from) values(v_user,p_item,'monthly_challenge') on conflict do nothing;
end;
$$;
revoke all on function public.get_monthly_collection(text), public.get_monthly_challenge(), public.claim_monthly_reward(text) from public;
grant execute on function public.get_monthly_collection(text), public.get_monthly_challenge() to anon,authenticated;
grant execute on function public.claim_monthly_reward(text) to authenticated;
