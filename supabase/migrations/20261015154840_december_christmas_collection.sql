create table monthly_private.collections (
  id text primary key, starts_on date not null unique, ends_on date not null,
  check(starts_on<=ends_on)
);
insert into monthly_private.collections values
('2026-11','2026-11-01','2026-11-30'),('2026-12','2026-12-01','2026-12-31');
alter table monthly_private.puzzles drop constraint puzzles_date_check;
alter table monthly_private.puzzles add constraint puzzles_date_check check(date between '2026-11-01' and '2026-12-31');

insert into public.shop_items(id,category,name,description,price_coin,rarity,unlock_type,available,sort_order,metadata) values
('avatar_monthly_snowflake_girl','avatar','Snowflake Girl','Christmas Day · Complete 5 puzzle dates',1,'rare','monthly',true,601,'{"monthly_days":5,"monthly_collection":"2026-12"}'),
('frame_monthly_candy_cane_orbit','avatar_frame','Candy Cane Orbit','Christmas Day · Complete 10 puzzle dates',1,'rare','monthly',true,602,'{"monthly_days":10,"monthly_collection":"2026-12"}'),
('theme_winter_wonderland','theme','Winter Wonderland','Christmas Day · Complete 15 puzzle dates',1,'epic','monthly',true,603,'{"monthly_days":15,"monthly_collection":"2026-12"}'),
('avatar_monthly_christmas_boy','avatar','Christmas Boy','Christmas Day · Complete 20 puzzle dates',1,'epic','monthly',true,604,'{"monthly_days":20,"monthly_collection":"2026-12"}'),
('frame_monthly_starlight_wreath','avatar_frame','Starlight Wreath','Christmas Day · Complete 25 puzzle dates',1,'epic','monthly',true,605,'{"monthly_days":25,"monthly_collection":"2026-12"}'),
('theme_christmas_eve','theme','Christmas Eve','Christmas Day · Complete 30 puzzle dates',1,'legendary','monthly',true,606,'{"monthly_days":30,"monthly_collection":"2026-12"}');

create table monthly_private.rewards (
  item_id text primary key references public.shop_items(id),
  collection_id text not null references monthly_private.collections(id),
  days integer not null check(days>0), unique(collection_id,days)
);
insert into monthly_private.rewards values
('avatar_monthly_lotus_otter','2026-11',5),('frame_monthly_lotus_orbit','2026-11',10),('theme_moonlit_river','2026-11',15),
('avatar_monthly_moon_rabbit','2026-11',20),('frame_monthly_full_moon_halo','2026-11',25),('theme_river_of_stars','2026-11',30),
('avatar_monthly_snowflake_girl','2026-12',5),('frame_monthly_candy_cane_orbit','2026-12',10),('theme_winter_wonderland','2026-12',15),
('avatar_monthly_christmas_boy','2026-12',20),('frame_monthly_starlight_wreath','2026-12',25),('theme_christmas_eve','2026-12',30);

create or replace function monthly_private.protect_reward_purchase() returns trigger language plpgsql set search_path='' as $$
begin
  if exists(select 1 from monthly_private.rewards where item_id=new.item_id)
    and current_setting('monthly.claiming',true) is distinct from new.user_id::text then
    raise exception 'Monthly rewards must be earned in Monthly Challenge';
  end if;
  return new;
end;
$$;

create or replace function public.get_monthly_collection(p_month text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_collection monthly_private.collections;
begin
  select * into strict v_collection from monthly_private.collections where id=p_month;
  return jsonb_build_object('today',monthly_private.today(),'preview',exists(select 1 from monthly_private.config where preview_today is not null),
    'completed',coalesce((select jsonb_agg(date order by date) from public.monthly_completions where user_id=auth.uid() and date between v_collection.starts_on and v_collection.ends_on),'[]'::jsonb),
    'claimed',coalesce((select jsonb_agg(i.item_id) from public.user_inventory i join monthly_private.rewards r on r.item_id=i.item_id where i.user_id=auth.uid() and r.collection_id=p_month),'[]'::jsonb));
end;
$$;
create or replace function public.get_monthly_challenge() returns jsonb language sql stable security definer set search_path='' as $$
  select public.get_monthly_collection(coalesce((select id from monthly_private.collections where starts_on<=monthly_private.today() order by starts_on desc limit 1),(select id from monthly_private.collections order by starts_on limit 1)));
$$;

create or replace function public.start_monthly_puzzle(p_date date) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid := monthly_private.member(); v_ticket uuid; v_puzzle text; v_today date := monthly_private.today();
begin
  if p_date is null or p_date>v_today or not exists(select 1 from monthly_private.collections where p_date between starts_on and ends_on and v_today between starts_on and ends_on) then raise exception 'Puzzle date is not available'; end if;
  if exists(select 1 from public.monthly_completions where user_id=v_user and date=p_date) then raise exception 'Puzzle already completed'; end if;
  select puzzle into strict v_puzzle from monthly_private.puzzles where date=p_date;
  insert into monthly_private.tickets(user_id,date) values(v_user,p_date)
    on conflict(user_id,date) do update set user_id=excluded.user_id returning id into v_ticket;
  return jsonb_build_object('ticket_id',v_ticket,'date',p_date,'puzzle',v_puzzle);
end;
$$;

create or replace function public.claim_monthly_reward(p_item text) returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid := monthly_private.member(); v_reward monthly_private.rewards; v_collection monthly_private.collections; v_count integer;
begin
  select * into strict v_reward from monthly_private.rewards where item_id=p_item;
  select * into strict v_collection from monthly_private.collections where id=v_reward.collection_id;
  select count(*) into v_count from public.monthly_completions where user_id=v_user and date between v_collection.starts_on and v_collection.ends_on;
  if v_count<v_reward.days then raise exception 'Complete more puzzle dates to claim this reward'; end if;
  perform set_config('monthly.claiming',v_user::text,true);
  insert into public.user_inventory(user_id,item_id,acquired_from) values(v_user,p_item,'monthly_challenge') on conflict do nothing;
end;
$$;

revoke all on all tables in schema monthly_private from public,anon,authenticated;
revoke all on all functions in schema monthly_private from public,anon,authenticated;
revoke all on function public.get_monthly_collection(text) from public;
grant execute on function public.get_monthly_collection(text) to anon,authenticated;

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
  if not exists(select 1 from monthly_private.collections where v_ticket.date between starts_on and ends_on and monthly_private.today() between starts_on and ends_on) or v_ticket.date>monthly_private.today() then raise exception 'Collection is not active'; end if;
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


insert into monthly_private.puzzles(date,puzzle,solution) values
('2026-12-01','000470800010500200370090051005120086000080402000906075601000703700012004040739000','256471839819563247374298651435127986967385412128946375691854723783612594542739168'),
('2026-12-02','150000679000009053070001420020003006809670200000920740504100802000080310008290000','153842679482769153976351428725413986849675231631928745564137892297586314318294567'),
('2026-12-03','870000000509000000403708050012057809050690007007030060200510370006004205000209610','871965423529143786463728951612457839358692147947831562294516378186374295735289614'),
('2026-12-04','040086000060007200207095060900000072076000810010040005605170924000954100000002087','341286759569317248287495361953861472476529813812743695635178924728954136194632587'),
('2026-12-05','020074003580100040900006001703602908050037006000009004310040000402061800000028017','126874593587193642934256781743612958859437126261589374318745269472961835695328417'),
('2026-12-06','047900020060080045500042008400073800050609034209000706000201083380000060000030409','847956321162387945593142678416573892758629134239814756974261583381495267625738419'),
('2026-12-07','201769803070018009069003700000520976000037000010006008085000010100300000603102400','251769843374218569869453721438521976926837154517946238785694312142385697693172485'),
('2026-12-08','860090001200064900003087042135670420600040139000002750080000300000000060500906800','864293571271564983953187642135679428627845139498312756786421395319758264542936817'),
('2026-12-09','000050000100439700096000051205004603000200090974503012819075000000000187740800000','327651948158439726496728351285194673631287495974563812819375264563942187742816539'),
('2026-12-10','000060003409000000308050970605201000207680190100000402800079500924315007700800000','572964813419738256368152974695241738247683195183597462836479521924315687751826349'),
('2026-12-11','906204708100080060080600020050000210019023800208000397093000680020170000000390500','936214758172985463584637129357849216619723845248561397793452681825176934461398572'),
('2026-12-12','304000120857900300000030000032700090106094802090612070620075014040000200000000560','364587129857921346219436785432758691176394852598612473623875914745169238981243567'),
('2026-12-13','400600001060500020003400098000060289506700043830940005070000012040097806089006000','427689531968513427153472698714365289596728143832941765675834912341297856289156374'),
('2026-12-14','652000410010002069079000050420000000000001576760500200548000007296710030007940000','652397418314852769879164352425673981983421576761589243548236197296715834137948625'),
('2026-12-15','060841090000020050930007104000000810817000000050170000040682001081795030025003900','562841793174329658938567124493256817817934265256178349349682571681795432725413986'),
('2026-12-16','040060080000000020718035690100608509300029108089003040062500010000890400000016800','243961785956784321718235694124678539375429168689153247862547913531892476497316852'),
('2026-12-17','000010280000269730900030061001003007500091600490002815750000040300000170014000906','637514289185269734942738561261853497578491623493672815759186342326945178814327956'),
('2026-12-18','007031800002904500400005360008000000300008705795060028560010007000842956000006010','957631842632984571481275369218597634346128795795463128564319287173842956829756413'),
('2026-12-19','790801036008000027603720800500086040001030500009502003025307100006000080300200090','792851436158643927643729851537186249261934578489572613825397164976415382314268795'),
('2026-12-20','079003004300700005600094030037129000002050109000000052040930001700400200006802543','879513624324786915615294837537129486462358179981647352248935761753461298196872543'),
('2026-12-21','100507000000923410009400305436002051000701000500600002000378006028100040070005980','143587269765923418289416375436892751892751634517634892954378126328169547671245983'),
('2026-12-22','007200003053400800200000746040900210020000395085300004004019080000802430800000967','467298153153476829298135746346957218721684395985321674634719582579862431812543967'),
('2026-12-23','900370584700008003080050600438000902206000005057400000000007031500830040800264009','921376584765948123384152697438615972296783415157429368642597831579831246813264759'),
('2026-12-24','008000107006007000700060902043100006052003810000640020260350001007006090015209680','528934167196527438734861952943182576652793814871645329269358741387416295415279683'),
('2026-12-25','300648090290000100007201350730000681006100703800000900062004000080003002970802400','315648297298537164647291358739425681456189723821376945562714839184963572973852416'),
('2026-12-26','005820000791560000600100539004006000856041000200085360000417003040050806500000001','435829617791563428682174539374296185856341792219785364968417253143952876527638941'),
('2026-12-27','630842900020300000800795000341200580002158460000004021000009000100000345070500008','635842917927361854814795632341276589792158463568934721253489176189627345476513298'),
('2026-12-28','000000095800059403039010270094603050000080741050100000070068004080020019200500380','462837195817259463539416278194673852623985741758142936971368524385724619246591387'),
('2026-12-29','050900780030075200790086040000040037100863900069027010003090004000000002580702300','452931786638475291791286543825149637147863925369527418273698154916354872584712369'),
('2026-12-30','943070100800430006071200340018700609005809037007060000180000070000020061006004900','943576182852431796671298345318745629265819437497362518189653274534927861726184953'),
('2026-12-31','020003000300950008097060000203000040600041209001700003062009035030504700050136490','826413957314957628597268314273695841685341279941782563462879135139524786758136492');
