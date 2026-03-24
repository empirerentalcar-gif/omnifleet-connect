
-- Create a security definer function to check if a profile_id exists
-- This bypasses RLS on the profiles table so anonymous users can submit reservations
CREATE OR REPLACE FUNCTION public.profile_exists(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _profile_id
  )
$$;

-- Drop the old insert policy
DROP POLICY IF EXISTS "Public can submit reservation requests with valid profile_id" ON public.reservation_requests;

-- Create new insert policy using the security definer function
CREATE POLICY "Public can submit reservation requests with valid profile_id"
ON public.reservation_requests
FOR INSERT
TO public
WITH CHECK (
  status = 'pending'::text
  AND (
    profile_id IS NULL
    OR profile_exists(profile_id)
  )
);
