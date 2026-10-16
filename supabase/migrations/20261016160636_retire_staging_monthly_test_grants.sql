-- Only tagged, disposable test grants in the isolated staging environment are retired.
do $$
begin
  if exists(select 1 from vault.secrets where name='gridnova_staging_scheduler') then
    delete from public.user_inventory i using monthly_private.rewards r
    where i.item_id=r.item_id and i.acquired_from='staging_monthly_qa_grant';
  end if;
end $$;
