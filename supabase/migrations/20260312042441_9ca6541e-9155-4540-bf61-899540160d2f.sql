
-- Create a public-safe view of agencies exposing only non-sensitive fields
CREATE OR REPLACE VIEW public.agencies_public_view AS
SELECT
  id,
  agency_name,
  city,
  state,
  phone,
  email,
  approved,
  active
FROM public.agencies
WHERE approved = true AND active = true;

-- Grant anon and authenticated access to the view
GRANT SELECT ON public.agencies_public_view TO anon, authenticated;

-- Create an RPC to get founding member count (no sensitive data exposed)
CREATE OR REPLACE FUNCTION public.get_founding_member_count()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*)::integer FROM public.agencies WHERE is_founding_member = true;
$$;

-- Drop the broad anon/authenticated SELECT policies that expose all columns
DROP POLICY IF EXISTS "Public can view approved active agencies" ON public.agencies;
DROP POLICY IF EXISTS "Authenticated can view approved active agencies" ON public.agencies;
