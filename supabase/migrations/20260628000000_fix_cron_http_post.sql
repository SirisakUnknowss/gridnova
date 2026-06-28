-- Fix pg_cron jobs: extensions.http_post does not exist — must use net.http_post.
-- Both jobs (generate-daily-puzzle and send-daily-push-reminders) had the wrong schema.
-- Also removes the redundant Authorization header from generate-daily-puzzle
-- since that function runs with verify_jwt=false.

SELECT cron.unschedule('generate-daily-puzzle');
SELECT cron.unschedule('send-daily-push-reminders');

SELECT cron.schedule(
  'generate-daily-puzzle',
  '0 23 * * *',
  $$
    SELECT net.http_post(
      url := 'https://sqjllqilozhxbzvfjhra.supabase.co/functions/v1/generate-daily-puzzle',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := '{"days":30}'::jsonb
    );
  $$
);

SELECT cron.schedule(
  'send-daily-push-reminders',
  '0 9 * * *',
  $$
    SELECT net.http_post(
      url := 'https://hcytemasimtaiwfdxawl.supabase.co/functions/v1/send-push-reminders',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
