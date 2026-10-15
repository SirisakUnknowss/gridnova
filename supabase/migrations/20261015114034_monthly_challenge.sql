create schema if not exists monthly_private;
revoke all on schema monthly_private from public, anon, authenticated;

create table if not exists monthly_private.config (
  id boolean primary key default true check(id),
  preview_today date
);
insert into monthly_private.config(id) values(true) on conflict do nothing;

create table if not exists monthly_private.puzzles (
  date date primary key check(date between '2026-11-01' and '2026-11-30'),
  puzzle text not null check(puzzle ~ '^[0-9]{81}$'),
  solution text not null check(solution ~ '^[1-9]{81}$')
);
create table if not exists monthly_private.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null references monthly_private.puzzles(date),
  issued_at timestamptz not null default now(),
  unique(user_id,date)
);
create table if not exists public.monthly_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null references monthly_private.puzzles(date),
  completed_at timestamptz not null default now(),
  primary key(user_id,date)
);
alter table public.monthly_completions enable row level security;
revoke all on public.monthly_completions from public,anon,authenticated;
grant select on public.monthly_completions to authenticated;
drop policy if exists monthly_read_own on public.monthly_completions;
create policy monthly_read_own on public.monthly_completions for select to authenticated using(user_id=(select auth.uid()));

create or replace function monthly_private.today() returns date language sql stable set search_path='' as $$
  select coalesce(preview_today,(now() at time zone 'UTC')::date) from monthly_private.config where id;
$$;
create or replace function monthly_private.member() returns uuid language plpgsql stable set search_path='' as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null or not exists(select 1 from auth.users where id=v_user and is_anonymous=false) then
    raise exception 'Sign in to play the Monthly Challenge';
  end if;
  return v_user;
end;
$$;

insert into public.shop_items(id,category,name,description,price_coin,rarity,unlock_type,available,sort_order,metadata) values
('avatar_monthly_lotus_otter','avatar','Lotus Otter','Moonlit Wishes · Complete 5 puzzle dates',1,'rare','monthly',true,501,'{"monthly_days":5}'),
('frame_monthly_lotus_orbit','avatar_frame','Lotus Orbit','Moonlit Wishes · Complete 10 puzzle dates',1,'rare','monthly',true,502,'{"monthly_days":10}'),
('theme_moonlit_river','theme','Moonlit River','Moonlit Wishes · Complete 15 puzzle dates',1,'epic','monthly',true,503,'{"monthly_days":15}'),
('avatar_monthly_moon_rabbit','avatar','Moon Rabbit','Moonlit Wishes · Complete 20 puzzle dates',1,'epic','monthly',true,504,'{"monthly_days":20}'),
('frame_monthly_full_moon_halo','avatar_frame','Full Moon Halo','Moonlit Wishes · Complete 25 puzzle dates',1,'epic','monthly',true,505,'{"monthly_days":25}'),
('theme_river_of_stars','theme','River of Stars','Moonlit Wishes · Complete 30 puzzle dates',1,'legendary','monthly',true,506,'{"monthly_days":30}') on conflict(id) do nothing;

-- A nonzero catalog price keeps legacy free-item equip paths from bypassing ownership.
create or replace function monthly_private.protect_reward_purchase() returns trigger language plpgsql set search_path='' as $$
begin
  if new.item_id in ('avatar_monthly_lotus_otter','frame_monthly_lotus_orbit','theme_moonlit_river','avatar_monthly_moon_rabbit','frame_monthly_full_moon_halo','theme_river_of_stars')
     and current_setting('monthly.claiming',true) is distinct from new.user_id::text then
    raise exception 'Monthly rewards must be earned in Monthly Challenge';
  end if;
  return new;
end;
$$;
drop trigger if exists monthly_reward_ownership on public.user_inventory;
create trigger monthly_reward_ownership before insert on public.user_inventory for each row execute function monthly_private.protect_reward_purchase();

create or replace function public.get_monthly_challenge() returns jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object('today',monthly_private.today(),'preview',exists(select 1 from monthly_private.config where preview_today is not null),
    'completed',coalesce((select jsonb_agg(date order by date) from public.monthly_completions where user_id=auth.uid()),'[]'::jsonb),
    'claimed',coalesce((select jsonb_agg(item_id) from public.user_inventory where user_id=auth.uid() and item_id in ('avatar_monthly_lotus_otter','frame_monthly_lotus_orbit','theme_moonlit_river','avatar_monthly_moon_rabbit','frame_monthly_full_moon_halo','theme_river_of_stars')),'[]'::jsonb));
$$;

create or replace function public.start_monthly_puzzle(p_date date) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid := monthly_private.member(); v_ticket uuid; v_puzzle text; v_today date := monthly_private.today();
begin
  if p_date is null or p_date not between '2026-11-01' and '2026-11-30' or p_date>v_today or v_today not between '2026-11-01' and '2026-11-30' then raise exception 'Puzzle date is not available'; end if;
  if exists(select 1 from public.monthly_completions where user_id=v_user and date=p_date) then raise exception 'Puzzle already completed'; end if;
  select puzzle into strict v_puzzle from monthly_private.puzzles where date=p_date;
  insert into monthly_private.tickets(user_id,date) values(v_user,p_date)
    on conflict(user_id,date) do update set user_id=excluded.user_id returning id into v_ticket;
  return jsonb_build_object('ticket_id',v_ticket,'date',p_date,'puzzle',v_puzzle);
end;
$$;

create or replace function public.complete_monthly_puzzle(p_ticket uuid,p_seconds integer,p_moves jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_user uuid := monthly_private.member(); v_ticket monthly_private.tickets; v_puzzle monthly_private.puzzles;
  v_move jsonb; v_r integer; v_c integer; v_n integer; v_t bigint; v_previous bigint := 0;
  v_index integer; v_board text; v_hints integer := 0; v_balance integer; v_count integer;
begin
  select * into strict v_ticket from monthly_private.tickets where id=p_ticket and user_id=v_user for update;
  if exists(select 1 from public.monthly_completions where user_id=v_user and date=v_ticket.date) then
    select coins into v_balance from public.user_wallet where user_id=v_user;
    return jsonb_build_object('coins',0,'balance',v_balance,'duplicate',true);
  end if;
  if monthly_private.today() not between '2026-11-01' and '2026-11-30' or v_ticket.date>monthly_private.today() then raise exception 'Collection is not active'; end if;
  if p_seconds is null or p_seconds<100 or p_seconds>10800 or extract(epoch from now()-v_ticket.issued_at)+5<p_seconds then raise exception 'Invalid play time'; end if;
  if p_moves is null or jsonb_typeof(p_moves)<>'array' or jsonb_array_length(p_moves) not between 1 and 20000 then raise exception 'Invalid moves'; end if;
  select * into strict v_puzzle from monthly_private.puzzles where date=v_ticket.date;
  v_board := v_puzzle.puzzle;
  for v_move in select value from jsonb_array_elements(p_moves) loop
    if not (v_move ?& array['r','c','n','t']) or jsonb_typeof(v_move->'r')<>'number' or jsonb_typeof(v_move->'c')<>'number' or jsonb_typeof(v_move->'n')<>'number' or jsonb_typeof(v_move->'t')<>'number'
      or (v_move->>'r')!~'^[0-8]$' or (v_move->>'c')!~'^[0-8]$' or (v_move->>'n')!~'^[0-9]$' or (v_move->>'t')!~'^[0-9]+$' then raise exception 'Invalid move'; end if;
    v_r := (v_move->>'r')::integer; v_c := (v_move->>'c')::integer; v_n := (v_move->>'n')::integer; v_t := (v_move->>'t')::bigint;
    if v_t<v_previous or v_t>p_seconds::bigint*1000+1000 then raise exception 'Invalid move time'; end if;
    v_previous := v_t; v_index := v_r*9+v_c+1;
    if substr(v_puzzle.puzzle,v_index,1)<>'0' then raise exception 'Cannot change a given'; end if;
    if v_move ? 'isHint' and jsonb_typeof(v_move->'isHint')<>'boolean' then raise exception 'Invalid hint'; end if;
    if (v_move->>'isHint')::boolean is true then
      v_hints := v_hints+1;
      if v_n::text<>substr(v_puzzle.solution,v_index,1) then raise exception 'Invalid hint'; end if;
    end if;
    v_board := overlay(v_board placing v_n::text from v_index for 1);
  end loop;
  if v_hints>3 or v_board<>v_puzzle.solution then raise exception 'Puzzle is not solved'; end if;
  insert into public.monthly_completions(user_id,date) values(v_user,v_ticket.date) on conflict do nothing;
  get diagnostics v_count = row_count;
  if v_count=1 then v_balance := public.grant_coins(v_user,100,'monthly_puzzle_complete',jsonb_build_object('date',v_ticket.date));
  else select coins into v_balance from public.user_wallet where user_id=v_user; end if;
  return jsonb_build_object('coins',v_count*100,'balance',v_balance,'duplicate',v_count=0);
end;
$$;

create or replace function public.claim_monthly_reward(p_item text) returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid := monthly_private.member(); v_days integer; v_count integer;
begin
  v_days := case p_item when 'avatar_monthly_lotus_otter' then 5 when 'frame_monthly_lotus_orbit' then 10 when 'theme_moonlit_river' then 15 when 'avatar_monthly_moon_rabbit' then 20 when 'frame_monthly_full_moon_halo' then 25 when 'theme_river_of_stars' then 30 end;
  if v_days is null then raise exception 'Unknown reward'; end if;
  select count(*) into v_count from public.monthly_completions where user_id=v_user;
  if v_count<v_days then raise exception 'Complete more puzzle dates to claim this reward'; end if;
  perform set_config('monthly.claiming',v_user::text,true);
  insert into public.user_inventory(user_id,item_id,acquired_from) values(v_user,p_item,'monthly_challenge') on conflict do nothing;
end;
$$;

revoke all on all functions in schema monthly_private from public,anon,authenticated;
revoke all on all tables in schema monthly_private from public,anon,authenticated;
revoke all on function public.get_monthly_challenge() from public;
grant execute on function public.get_monthly_challenge() to anon,authenticated;
revoke all on function public.start_monthly_puzzle(date), public.complete_monthly_puzzle(uuid,integer,jsonb), public.claim_monthly_reward(text) from public,anon;
grant execute on function public.start_monthly_puzzle(date), public.complete_monthly_puzzle(uuid,integer,jsonb), public.claim_monthly_reward(text) to authenticated;

insert into monthly_private.puzzles(date,puzzle,solution) values
('2026-11-01','000200095702005031000819000420050600300090207870100054050040006000381500903000120','681237495792465831534819762429758613315694287876123954158942376267381549943576128'),
('2026-11-02','700380090852400000003007800000006050004170006005208137038700060106000305020650700','761382594852491673943567812217936458384175926695248137538714269176829345429653781'),
('2026-11-03','000009540000003900209405038405317890073008000000520370047000013000700089910006000','381269547754183962269475138425317896173698425698524371847952613536741289912836754'),
('2026-11-04','004060000396010080007005000720080005145902870069750301008670400030490000470000000','514869237396217584287345169723186945145932876869754321958673412632491758471528693'),
('2026-11-05','800000000000600800000801024073000050405709006006000007350064790024908135700103460','862347519149625873537891624273486951415739286986512347351264798624978135798153462'),
('2026-11-06','050000001001003000084000506000100759039040012170006008003860005007904803260075100','756482931921653487384719526642138759839547612175296348493861275517924863268375194'),
('2026-11-07','001578002070000090500049000790030020080000517020400830000065240007300100403082970','941578362678213495532649781795831624384926517126457839819765243267394158453182976'),
('2026-11-08','510004300800000120090100004100940600403070000000008400020401968000895017901060503','516724389847359126392186754158943672463572891279618435725431968634895217981267543'),
('2026-11-09','009800000020713000300065004206007000190080630070156200530009082002030109900000043','659824371824713956317965824286397415195482637473156298531649782742538169968271543'),
('2026-11-10','030197040040085301008006075000001400000530800020760050361050000090670000052003960','235197648647285391918346275586921437179534826423768159361459782894672513752813964'),
('2026-11-11','004700065000050200802046701000600000001009070290508100040035600320160900000097438','914782365673951284852346791487613529531429876296578143749835612328164957165297438'),
('2026-11-12','208901000090407820070002640001050902002190000069000135007300400005810090000000258','248961573596437821173582649431756982852193764769248135987325416625814397314679258'),
('2026-11-13','100896002520040600080000000956480010708500006340700900000020500400078090203900860','134896752529147638687253149956482317718539426342761985891624573465378291273915864'),
('2026-11-14','005000060010054237006307008047080000653000481000060790000090600704238010000100073','375829164819654237426317958947581326653972481281463795138795642764238519592146873'),
('2026-11-15','800510007000904350430007690090070010004150902210008040000680000078000004650740009','869513427721964358435827691596472813384156972217398546142689735978235164653741289'),
('2026-11-16','500009000060000902193000000050984010040102030010050089005400600480520390231090008','528649173764813952193275864357984216849162735612357489975438621486521397231796548'),
('2026-11-17','001032000430600010020040600270100000094000107150720096015086900000300060008059270','681932754439675812527841639276194385894563127153728496715286943942317568368459271'),
('2026-11-18','600000058000065720500002310904208000000001980018094570006003800035000000082409160','623917458841365729579842316954278631267531984318694572196723845435186297782459163'),
('2026-11-19','005600070001089000003507010200006080030800200168004730704060000910008653306000840','425613978671489325893527416247936581539871264168254739784365192912748653356192847'),
('2026-11-20','000540062040000090050000804200004100000310006080020309063002007091458020020603918','318549762642837591957261834236984175479315286185726349863192457791458623524673918'),
('2026-11-21','830090700000600030000030200640502903508903604310407050264300080700200400950000000','832194765475628139196735248647582913528913674319467852264379581783251496951846327'),
('2026-11-22','004100805016087290320004017000000060002000400069700001607053008185400900000910700','974162835516387294328594617731849562852631479469725381697253148185476923243918756'),
('2026-11-23','600400170008000420415000000080002617300067000270000049860009034000230800130056700','623498175798615423415723986589342617341967258276581349862179534957234861134856792'),
('2026-11-24','030876020270540083040900006060000005002008000098000010603090000407360190059084030','935876421276541983841923756364219875712458369598637214683192547427365198159784632'),
('2026-11-25','000006407070238000108000320750040103002000074340007000069703005010405600800600702','523196487674238951198574326756842193982361574341957268469723815217485639835619742'),
('2026-11-26','000040073900263004040000920600000735705300800204805010001058067070004000390001050','862149573957263184143587926689412735715396842234875619421958367578634291396721458'),
('2026-11-27','000100030098563000070200910800705360000040080960010700000052603003071000207930108','524197836198563427376284915841725369735649281962318754419852673683471592257936148'),
('2026-11-28','980400500710000403040501690204000009059708040038940006000007960800000000001039024','986473512715692483342581697274316859659728341138945276423157968897264135561839724'),
('2026-11-29','300000264000040300002007980918005000060029700703006000030678045000004093000953602','387591264196842357452367981918735426564129738723486519239678145675214893841953672'),
('2026-11-30','703406200004000800200090540320000401040000092900804700000245078000970360400368000','753486219694512837218793546327659481845137692961824753136245978582971364479368125') on conflict(date) do nothing;
