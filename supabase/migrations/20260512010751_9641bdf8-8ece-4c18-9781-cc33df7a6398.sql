-- Admin-only / authenticated-only RPCs: remove anon EXECUTE.
REVOKE ALL ON FUNCTION public.assign_agency_owner(uuid, uuid) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_invite_code(text) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_access_code(text, uuid) FROM anon, PUBLIC;