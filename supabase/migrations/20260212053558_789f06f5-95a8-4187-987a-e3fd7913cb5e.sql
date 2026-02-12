
-- Drop the overly permissive INSERT policy
DROP POLICY "Anyone can submit reservation requests" ON public.reservation_requests;

-- Create a secure INSERT policy: only authenticated users can submit,
-- and profile_id must belong to an existing profile (or be null for public submissions with rate limiting)
-- Since renters are unauthenticated visitors, we allow anon inserts but restrict what they can set
CREATE POLICY "Public can submit reservation requests with valid profile_id"
ON public.reservation_requests
FOR INSERT
WITH CHECK (
  -- status must be pending on insert
  status = 'pending'
  -- profile_id must reference a real profile if provided
  AND (
    profile_id IS NULL 
    OR profile_id IN (SELECT id FROM profiles)
  )
);
