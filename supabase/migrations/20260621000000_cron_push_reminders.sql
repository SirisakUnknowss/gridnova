-- Schedule daily push reminder at 09:00 UTC every day
SELECT cron.schedule(
  'send-daily-push-reminders',
  '0 9 * * *',
  $$
    SELECT extensions.http_post(
      url := 'https://hcytemasimtaiwfdxawl.supabase.co/functions/v1/send-push-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    );
  $$
);
