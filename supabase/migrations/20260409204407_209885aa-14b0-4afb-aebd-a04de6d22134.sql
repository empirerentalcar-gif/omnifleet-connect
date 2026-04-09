
-- Revoke direct RPC access to security-sensitive helper functions from anon and public roles.
-- These functions will still work inside RLS policies (Postgres invokes them in policy context).

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.profile_exists(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.profile_has_approved_agency(uuid) FROM anon, public;

-- Grant to authenticated only where needed (has_role is used by frontend hooks)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.profile_exists(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.profile_has_approved_agency(uuid) TO authenticated;
