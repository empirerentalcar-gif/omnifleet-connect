DO $$
DECLARE
  req_id bigint;
  secret text;
BEGIN
  SELECT decrypted_secret INTO secret FROM vault.decrypted_secrets WHERE name = 'stuck_report_cron_secret';
  SELECT net.http_post(
    url := 'https://mtrzzdrobjjxppunqtaa.supabase.co/functions/v1/report-stuck-bookings',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret', secret),
    body := '{"force": true, "source": "manual-test"}'::jsonb
  ) INTO req_id;
  RAISE NOTICE 'request_id=%', req_id;
END $$;