-- Trigger-only / internal helper functions: revoke EXECUTE from API roles.
-- Triggers run as the function owner under SECURITY DEFINER and do not
-- require EXECUTE grants on the underlying role.

DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'public.handle_new_user()',
    'public.update_updated_at_column()',
    'public.sync_agency_public_profile()',
    'public.validate_booking()',
    'public.validate_reservation_request()',
    'public.check_rate_limit(text, integer, integer)'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    EXECUTE format('ALTER FUNCTION %s OWNER TO postgres', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM service_role', fn);
  END LOOP;
END $$;