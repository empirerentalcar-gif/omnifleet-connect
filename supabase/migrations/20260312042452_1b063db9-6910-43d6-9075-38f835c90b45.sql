
-- Fix: recreate view with SECURITY INVOKER to use the querying user's permissions
DROP VIEW IF EXISTS public.agencies_public_view;
CREATE VIEW public.agencies_public_view
WITH (security_invoker = true)
AS
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

-- Grant access
GRANT SELECT ON public.agencies_public_view TO anon, authenticated;

-- Re-add limited anon/authenticated policies on agencies table so the view can read
-- These policies use a restrictive check but the view already filters approved+active
CREATE POLICY "Anon can select safe agency fields via view"
ON public.agencies
FOR SELECT
TO anon
USING (approved = true AND active = true);

CREATE POLICY "Authenticated can select safe agency fields via view"
ON public.agencies
FOR SELECT
TO authenticated
USING (approved = true AND active = true);
