
-- Drop the policies we just added (they still expose all columns via direct queries)
DROP POLICY IF EXISTS "Anon can select safe agency fields via view" ON public.agencies;
DROP POLICY IF EXISTS "Authenticated can select safe agency fields via view" ON public.agencies;

-- Drop the view (not needed if using RPCs)
DROP VIEW IF EXISTS public.agencies_public_view;

-- Create RPC that returns only safe public agency fields
CREATE OR REPLACE FUNCTION public.get_public_agencies()
RETURNS TABLE(id uuid, agency_name text, city text, state text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id, agency_name, city, state
  FROM public.agencies
  WHERE approved = true AND active = true;
$$;
