
-- Schedule expire-stalled-bookings to run every hour.
-- Uses vault for the CRON_SECRET so it is not stored in plain SQL.
DO $$
DECLARE
  cron_secret_val text;
BEGIN
  SELECT decrypted_secret INTO cron_secret_val
  FROM vault.decrypted_secrets
  WHERE name = 'cron_secret'
  LIMIT 1;

  -- Remove any prior schedule so re-runs are idempotent
  BEGIN
    PERFORM cron.unschedule('expire-stalled-bookings-hourly');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  PERFORM cron.schedule(
    'expire-stalled-bookings-hourly',
    '15 * * * *',
    format($cron$
      SELECT net.http_post(
        url := 'https://mtrzzdrobjjxppunqtaa.supabase.co/functions/v1/expire-stalled-bookings',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', %L
        ),
        body := '{}'::jsonb
      );
    $cron$, COALESCE(cron_secret_val, ''))
  );
END $$;
