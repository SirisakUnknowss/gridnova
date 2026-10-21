insert into public.user_equipped (user_id, theme_id)
select users.id, 'theme_classic_v1'
from auth.users as users
where not exists (
  select 1
  from public.user_equipped as equipped
  where equipped.user_id = users.id
);

update public.user_equipped
set theme_id = 'theme_classic_v1'
where theme_id is null;
