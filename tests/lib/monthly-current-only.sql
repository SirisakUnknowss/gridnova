begin;
do $$
declare c record; u uuid; n bigint; blocked boolean; checks integer := 0;
begin
  select id into strict u from auth.users where not is_anonymous order by created_at limit 1;
  perform set_config('request.jwt.claim.sub',u::text,true);
  select count(*) into n from public.user_inventory;
  for c in select * from monthly_private.collections order by starts_on loop
    update monthly_private.config set preview_today=c.starts_on;
    perform public.get_monthly_collection(c.id);
    if (public.get_monthly_challenge()->>'today')::date<>c.starts_on then raise exception 'FAILED current clock'; end if;
    blocked:=false;
    begin perform public.get_monthly_collection(to_char(c.starts_on-1,'YYYY-MM')); exception when others then if sqlerrm='Collection is not active' then blocked:=true; else raise; end if; end;
    if not blocked then raise exception 'FAILED past read'; end if;
    blocked:=false;
    begin perform public.get_monthly_collection(to_char(c.ends_on+1,'YYYY-MM')); exception when others then if sqlerrm='Collection is not active' then blocked:=true; else raise; end if; end;
    if not blocked then raise exception 'FAILED future read'; end if;
    blocked:=false;
    begin perform public.start_monthly_puzzle(c.starts_on-1); exception when others then if sqlerrm='Puzzle date is not available' then blocked:=true; else raise; end if; end;
    if not blocked then raise exception 'FAILED past play'; end if;
    update monthly_private.config set preview_today=c.ends_on;
    perform public.get_monthly_collection(c.id);
    update monthly_private.config set preview_today=c.ends_on+1;
    blocked:=false;
    begin perform public.claim_monthly_reward((select item_id from monthly_private.rewards where collection_id=c.id order by days limit 1)); exception when others then if sqlerrm='Collection is not active' then blocked:=true; else raise; end if; end;
    if not blocked then raise exception 'FAILED expired claim'; end if;
    checks:=checks+1;
  end loop;
  update monthly_private.config set preview_today='2026-10-31';
  if public.get_monthly_challenge()->'completed'<>'[]'::jsonb then raise exception 'FAILED prelaunch'; end if;
  if (select count(*) from public.user_inventory)<>n then raise exception 'FAILED ownership changed'; end if;
  if has_function_privilege('anon','public.claim_monthly_reward(text)','execute') then raise exception 'FAILED anonymous claim'; end if;
  if checks<>12 then raise exception 'FAILED collection count'; end if;
end $$;
rollback;
select preview_today from monthly_private.config;
