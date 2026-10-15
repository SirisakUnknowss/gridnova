do $$
declare
  v_user uuid := 'QA_MEMBER_UUID'::uuid;
  v_ticket jsonb; v_result jsonb; v_moves jsonb; v_date date; v_item text;
  v_initial integer; v_balance integer; v_count integer;
begin
  perform set_config('request.jwt.claim.sub',v_user::text,true);
  select coins into v_initial from public.user_wallet where user_id=v_user;
  if v_initial is null then raise exception 'Test wallet was not provisioned'; end if;
  update monthly_private.config set preview_today='2026-10-31';
  begin perform public.start_monthly_puzzle('2026-11-01'); raise exception 'FAILED: prelaunch accepted'; exception when raise_exception then if sqlerrm like 'FAILED:%' then raise; end if; end;
  update monthly_private.config set preview_today='2026-11-15';
  begin perform public.start_monthly_puzzle('2026-11-16'); raise exception 'FAILED: future accepted'; exception when raise_exception then if sqlerrm like 'FAILED:%' then raise; end if; end;
  begin perform public.claim_monthly_reward('avatar_monthly_lotus_otter'); raise exception 'FAILED: unearned claim'; exception when raise_exception then if sqlerrm like 'FAILED:%' then raise; end if; end;
  begin perform public.purchase_item(v_user,'avatar_monthly_lotus_otter'); raise exception 'FAILED: reward purchasable'; exception when raise_exception then if sqlerrm like 'FAILED:%' then raise; end if; end;
  select coins into v_balance from public.user_wallet where user_id=v_user;
  if v_balance<>v_initial then raise exception 'FAILED: rejected purchase charged wallet'; end if;
  v_ticket := public.start_monthly_puzzle('2026-11-01');
  if public.start_monthly_puzzle('2026-11-01')->>'ticket_id'<>v_ticket->>'ticket_id' then raise exception 'FAILED: ticket not resumable'; end if;
  begin perform public.complete_monthly_puzzle((v_ticket->>'ticket_id')::uuid,1,'[]'); raise exception 'FAILED: too fast'; exception when raise_exception then if sqlerrm like 'FAILED:%' then raise; end if; end;
  update monthly_private.tickets set issued_at=now()-interval '120 seconds' where id=(v_ticket->>'ticket_id')::uuid;
  begin perform public.complete_monthly_puzzle((v_ticket->>'ticket_id')::uuid,100,'[{"r":0,"c":0,"n":1}]'); raise exception 'FAILED: malformed move'; exception when raise_exception then if sqlerrm like 'FAILED:%' then raise; end if; end;
  begin perform public.complete_monthly_puzzle((v_ticket->>'ticket_id')::uuid,100,'[{"r":0,"c":0,"n":0,"t":0}]'); raise exception 'FAILED: unsolved accepted'; exception when raise_exception then if sqlerrm like 'FAILED:%' then raise; end if; end;
  perform set_config('request.jwt.claim.sub','',true);
  begin perform public.complete_monthly_puzzle((v_ticket->>'ticket_id')::uuid,100,'[]'); raise exception 'FAILED: guest ticket accepted'; exception when raise_exception then if sqlerrm like 'FAILED:%' then raise; end if; end;
  perform set_config('request.jwt.claim.sub',v_user::text,true);
  update monthly_private.config set preview_today='2026-11-30';
  for v_date in select date from monthly_private.puzzles where date between '2026-11-01' and '2026-11-30' order by date desc loop
    v_ticket := public.start_monthly_puzzle(v_date);
    update monthly_private.tickets set issued_at=now()-interval '120 seconds' where id=(v_ticket->>'ticket_id')::uuid;
    select jsonb_agg(jsonb_build_object('r',(i-1)/9,'c',(i-1)%9,'n',substr(solution,i,1)::integer,'t',i*1000) order by i)
      into v_moves from monthly_private.puzzles cross join generate_series(1,81) i where date=v_date and substr(puzzle,i,1)='0';
    v_result := public.complete_monthly_puzzle((v_ticket->>'ticket_id')::uuid,100,v_moves);
    if (v_result->>'coins')::integer<>100 then raise exception 'FAILED: reward amount'; end if;
    v_result := public.complete_monthly_puzzle((v_ticket->>'ticket_id')::uuid,100,v_moves);
    if (v_result->>'coins')::integer<>0 or not (v_result->>'duplicate')::boolean then raise exception 'FAILED: duplicate payout'; end if;
  end loop;
  select coins into v_balance from public.user_wallet where user_id=v_user;
  if v_balance-v_initial<>3000 then raise exception 'FAILED: total payout'; end if;
  for v_item in select item_id from monthly_private.rewards where collection_id='2026-11' loop
    perform public.claim_monthly_reward(v_item);
    perform public.claim_monthly_reward(v_item);
  end loop;
  select count(*) into v_count from public.user_inventory where user_id=v_user and item_id in (select item_id from monthly_private.rewards where collection_id='2026-11');
  if v_count<>6 then raise exception 'FAILED: cosmetics count %',v_count; end if;
  perform public.equip_item(v_user,'theme_river_of_stars',null,null,'{"item_id":"avatar_monthly_lotus_otter"}'::jsonb);
  perform public.equip_avatar_frame('frame_monthly_full_moon_halo');
  if not exists(select 1 from public.user_equipped where user_id=v_user and theme_id='theme_river_of_stars' and avatar->>'item_id'='avatar_monthly_lotus_otter' and frame_id='frame_monthly_full_moon_halo') then raise exception 'FAILED: equipment'; end if;
  perform set_config('request.jwt.claim.sub','',true);
  if jsonb_array_length(public.get_monthly_challenge()->'completed')<>0 then raise exception 'FAILED: progress leaked'; end if;
  update monthly_private.config set preview_today='2026-12-01';
  begin perform public.start_monthly_puzzle('2026-11-01'); raise exception 'FAILED: expired collection accepted'; exception when raise_exception then if sqlerrm like 'FAILED:%' then raise; end if; end;
  perform set_config('request.jwt.claim.sub','',true);
  begin perform public.claim_monthly_reward('avatar_monthly_lotus_otter'); raise exception 'FAILED: guest claim'; exception when raise_exception then if sqlerrm like 'FAILED:%' then raise; end if; end;
  if has_function_privilege('anon','public.start_monthly_puzzle(date)','EXECUTE') or has_table_privilege('authenticated','monthly_private.puzzles','SELECT') or has_table_privilege('authenticated','public.monthly_completions','INSERT') then raise exception 'FAILED: client privileges'; end if;
  -- The intentional final exception rolls back all test wallet, equipment and cosmetic changes atomically.
  raise exception 'MONTHLY_QA_PASS: 30 solves, duplicate payout, 6 claims, equipment, date gates and isolation';
end;
$$;
