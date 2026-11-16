-- =====================================================================
-- Update generate-daily-puzzle cron horizon to 7 days and clear future
-- pre-generated daily puzzles without leaderboard entries so they are
-- regenerated under the new day-of-week difficulty schedule.
-- =====================================================================

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'gridnova_staging_scheduler') THEN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'gridnova-staging-generate-daily') THEN
      PERFORM cron.unschedule('gridnova-staging-generate-daily');
    END IF;
    PERFORM cron.schedule('gridnova-staging-generate-daily', '15 20 * * *', $job$
      SELECT net.http_post(
        url := 'https://xrtgcxofjisqaigaaboy.supabase.co/functions/v1/generate-daily-puzzle',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-gridnova-scheduler', (SELECT decrypted_secret FROM vault.decrypted_secrets
                                   WHERE name = 'gridnova_staging_scheduler')),
        body := jsonb_build_object('days', 7),
        timeout_milliseconds := 120000);
    $job$);
  ELSE
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-daily-puzzle') THEN
      PERFORM cron.unschedule('generate-daily-puzzle');
    END IF;
    PERFORM cron.schedule('generate-daily-puzzle', '0 23 * * *', $job$
      SELECT net.http_post(
        url := 'https://sqjllqilozhxbzvfjhra.supabase.co/functions/v1/generate-daily-puzzle',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-gridnova-scheduler', (SELECT decrypted_secret FROM vault.decrypted_secrets
                                   WHERE name = 'gridnova_production_scheduler')),
        body := jsonb_build_object('days', 7),
        timeout_milliseconds := 120000);
    $job$);
  END IF;
END
$do$;

DELETE FROM public.daily_puzzles dp
WHERE dp.date > (now() AT TIME ZONE 'utc')::date
  AND NOT EXISTS (
    SELECT 1
    FROM public.daily_leaderboard dl
    WHERE dl.date = dp.date
  );
