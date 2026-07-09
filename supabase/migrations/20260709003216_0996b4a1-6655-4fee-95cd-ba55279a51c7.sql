CREATE OR REPLACE FUNCTION public.verify_stuck_report_secret(_provided text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  expected text;
BEGIN
  IF _provided IS NULL OR length(_provided) < 8 THEN
    RETURN false;
  END IF;
  SELECT decrypted_secret INTO expected
  FROM vault.decrypted_secrets
  WHERE name = 'stuck_report_cron_secret'
  LIMIT 1;
  RETURN expected IS NOT NULL AND _provided = expected;
END;
$$;
REVOKE ALL ON FUNCTION public.verify_stuck_report_secret(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_stuck_report_secret(text) TO service_role;