do $$
declare u uuid := 'QA_MEMBER_UUID'; c record; d date; t jsonb; moves jsonb; result jsonb; r record; initial_coins int; final_coins int;
begin
perform set_config('request.jwt.claim.sub',u::text,true);
select coins into initial_coins from public.user_wallet where user_id=u;
for c in select * from monthly_private.collections where id like '2027-%' order by id loop
update monthly_private.config set preview_today=c.ends_on;
select * into r from monthly_private.rewards where collection_id=c.id order by days limit 1;
begin perform public.claim_monthly_reward(r.item_id); raise exception 'FAILED month bleed'; exception when others then if sqlerrm='FAILED month bleed' then raise; end if; end;
for d in select date from monthly_private.puzzles where date between c.starts_on and c.ends_on order by date loop
t:=public.start_monthly_puzzle(d);
update monthly_private.tickets set issued_at=now()-interval '120 seconds' where id=(t->>'ticket_id')::uuid;
select jsonb_agg(jsonb_build_object('r',(i-1)/9,'c',(i-1)%9,'n',substr(solution,i,1)::int,'t',i*1000) order by i) into moves from monthly_private.puzzles cross join generate_series(1,81)i where date=d and substr(puzzle,i,1)='0';
result:=public.complete_monthly_puzzle((t->>'ticket_id')::uuid,100,moves);
if (result->>'coins')::int<>100 then raise exception 'FAILED payout'; end if;
result:=public.complete_monthly_puzzle((t->>'ticket_id')::uuid,100,moves);
if (result->>'coins')::int<>0 then raise exception 'FAILED duplicate'; end if;
end loop;
for r in select * from monthly_private.rewards where collection_id=c.id loop
perform public.claim_monthly_reward(r.item_id); perform public.claim_monthly_reward(r.item_id);
if r.item_id like 'avatar_%' then perform public.equip_item(u,null::text,null::text,null::text,jsonb_build_object('item_id',r.item_id));
elsif r.item_id like 'frame_%' then perform public.equip_avatar_frame(r.item_id);
else perform public.equip_item(u,r.item_id,null::text,null::text,null::jsonb); end if;
end loop;
if jsonb_array_length(public.get_monthly_collection(c.id)->'claimed')<>6 then raise exception 'FAILED claims'; end if;
end loop;
select coins into final_coins from public.user_wallet where user_id=u;
if final_coins-initial_coins<>30400 then raise exception 'FAILED total wallet'; end if;
raise exception 'YEAR_304_SOLVES_DUPLICATES_60_CLAIMS_ISOLATION_PASS_ROLLED_BACK';
end $$;