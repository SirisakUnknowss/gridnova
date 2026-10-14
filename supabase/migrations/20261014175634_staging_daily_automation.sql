
-- This migration is intentionally inert outside the isolated staging project.
DO $guard$ BEGIN
 IF current_setting('app.settings.api_url', true) IS DISTINCT FROM 'https://xrtgcxofjisqaigaaboy.supabase.co' THEN
   -- Supabase does not always populate api_url; the staging marker is installed separately.
   IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'gridnova_staging_scheduler') THEN
     RAISE EXCEPTION 'Staging scheduler credential must be provisioned first';
   END IF;
 END IF;
END $guard$;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE TABLE public.staging_reminder_deliveries (
 token_id uuid NOT NULL, reminder_date date NOT NULL, status integer NOT NULL DEFAULT 0,
 claimed_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
 PRIMARY KEY(token_id, reminder_date)
);
ALTER TABLE public.staging_reminder_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.staging_reminder_deliveries FROM PUBLIC, anon, authenticated;
CREATE FUNCTION public.staging_automation_config() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $fn$
 SELECT jsonb_build_object(
 'scheduler_token',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='gridnova_staging_scheduler'),
 'vapid_public',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='gridnova_staging_vapid_public'),
 'vapid_private',(SELECT decrypted_secret::jsonb FROM vault.decrypted_secrets WHERE name='gridnova_staging_vapid_private'));
$fn$;
REVOKE ALL ON FUNCTION public.staging_automation_config() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.staging_automation_config() TO service_role;
CREATE FUNCTION public.claim_staging_daily_reminders()
RETURNS TABLE(id uuid, token text, p256dh text, auth text, reminder_date date)
LANGUAGE sql SECURITY DEFINER SET search_path='' AS $fn$
 WITH candidates AS (
 SELECT t.id,t.token,t.p256dh,t.auth,(now() AT TIME ZONE 'UTC')::date AS reminder_date
 FROM public.push_tokens t
 JOIN auth.users u ON u.id=t.user_id AND NOT u.is_anonymous
 JOIN public.user_settings s ON s.user_id=t.user_id AND s.notifications_daily=true
 WHERE t.platform='web' AND coalesce(t.p256dh,'')<>'' AND coalesce(t.auth,'')<>''
 AND EXISTS(SELECT 1 FROM public.daily_puzzles p WHERE p.date=(now() AT TIME ZONE 'UTC')::date)
 AND NOT EXISTS(SELECT 1 FROM public.user_game_history h WHERE h.user_id=t.user_id AND h.mode='daily' AND h.daily_date=(now() AT TIME ZONE 'UTC')::date)
 AND NOT EXISTS(SELECT 1 FROM public.daily_leaderboard l WHERE l.user_id=t.user_id AND l.date=(now() AT TIME ZONE 'UTC')::date)
 AND NOT EXISTS(SELECT 1 FROM public.staging_reminder_deliveries d WHERE d.token_id=t.id AND d.reminder_date=(now() AT TIME ZONE 'UTC')::date AND (d.status BETWEEN 200 AND 299 OR d.claimed_at>now()-interval '10 minutes'))
 ORDER BY t.id LIMIT 20
 ), claimed AS (
 INSERT INTO public.staging_reminder_deliveries(token_id,reminder_date)
 SELECT c.id,c.reminder_date FROM candidates c
 ON CONFLICT(token_id,reminder_date) DO UPDATE SET claimed_at=now(),status=0,finished_at=NULL
 WHERE staging_reminder_deliveries.status NOT BETWEEN 200 AND 299 AND staging_reminder_deliveries.claimed_at<=now()-interval '10 minutes'
 RETURNING token_id
 )
 SELECT c.id,c.token,c.p256dh,c.auth,c.reminder_date FROM candidates c JOIN claimed d ON d.token_id=c.id;
$fn$;
REVOKE ALL ON FUNCTION public.claim_staging_daily_reminders() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_staging_daily_reminders() TO service_role;
CREATE FUNCTION public.finish_staging_daily_reminder(p_token_id uuid,p_date date,p_status integer) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path='' AS $fn$
 UPDATE public.staging_reminder_deliveries SET status=p_status,finished_at=now() WHERE token_id=p_token_id AND reminder_date=p_date;
$fn$;
REVOKE ALL ON FUNCTION public.finish_staging_daily_reminder(uuid,date,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finish_staging_daily_reminder(uuid,date,integer) TO service_role;
SELECT cron.schedule('gridnova-staging-generate-daily','15 20 * * *', $job$
 SELECT net.http_post(url:='https://xrtgcxofjisqaigaaboy.supabase.co/functions/v1/generate-daily-puzzle',
 headers:=jsonb_build_object('Content-Type','application/json','x-gridnova-scheduler',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='gridnova_staging_scheduler')),
 body:='{"days":30}'::jsonb,timeout_milliseconds:=120000);
$job$);
SELECT cron.schedule('gridnova-staging-daily-reminder','*/10 22,23 * * *', $job$
 SELECT net.http_post(url:='https://xrtgcxofjisqaigaaboy.supabase.co/functions/v1/send-push-reminders',
 headers:=jsonb_build_object('Content-Type','application/json','x-gridnova-scheduler',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='gridnova_staging_scheduler')),
 body:='{}'::jsonb,timeout_milliseconds:=120000);
$job$);

