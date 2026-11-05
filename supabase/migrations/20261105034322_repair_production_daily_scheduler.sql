-- Production release only. The staging scheduler uses a separate credential and job.
DO $guard$ BEGIN
  IF EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'gridnova_staging_scheduler') THEN
    RAISE EXCEPTION 'Production scheduler migration cannot run on staging';
  END IF;
END $guard$;

SELECT vault.create_secret(encode(gen_random_bytes(32), 'hex'), 'gridnova_production_scheduler');

CREATE FUNCTION public.production_automation_config() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $fn$
  SELECT jsonb_build_object(
    'scheduler_token', (SELECT decrypted_secret FROM vault.decrypted_secrets
                        WHERE name = 'gridnova_production_scheduler'));
$fn$;
REVOKE ALL ON FUNCTION public.production_automation_config() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.production_automation_config() TO service_role;

SELECT cron.unschedule('generate-daily-puzzle');
SELECT cron.schedule('generate-daily-puzzle', '0 23 * * *', $job$
  SELECT net.http_post(
    url := 'https://sqjllqilozhxbzvfjhra.supabase.co/functions/v1/generate-daily-puzzle',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-gridnova-scheduler', (SELECT decrypted_secret FROM vault.decrypted_secrets
                               WHERE name = 'gridnova_production_scheduler')),
    body := '{"days":30}'::jsonb,
    timeout_milliseconds := 120000);
$job$);
