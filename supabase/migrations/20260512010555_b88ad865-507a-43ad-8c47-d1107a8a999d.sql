-- Ensure ownership is postgres (least-privilege; trigger runs as definer = owner)
ALTER FUNCTION public.handle_email_confirmed_auto_approve() OWNER TO postgres;

-- Strip every grant from every role
REVOKE ALL ON FUNCTION public.handle_email_confirmed_auto_approve() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_email_confirmed_auto_approve() FROM anon;
REVOKE ALL ON FUNCTION public.handle_email_confirmed_auto_approve() FROM authenticated;
REVOKE ALL ON FUNCTION public.handle_email_confirmed_auto_approve() FROM service_role;

-- Trigger executes as the function owner (postgres) regardless of grants;
-- explicit grant to postgres for clarity.
GRANT EXECUTE ON FUNCTION public.handle_email_confirmed_auto_approve() TO postgres;