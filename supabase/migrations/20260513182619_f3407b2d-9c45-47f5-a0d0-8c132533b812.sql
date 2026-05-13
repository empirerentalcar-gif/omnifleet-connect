-- Fix broken 'Owners can view their reservations' policy.
-- The previous policy joined to profiles.id, but reservations.agency_id references agencies.id.
-- Replace it so agency owners can actually see reservations submitted to their agency.

DROP POLICY IF EXISTS "Owners can view their reservations" ON public.reservations;

CREATE POLICY "Owners can view their reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (
  agency_id IN (
    SELECT a.id FROM public.agencies a
    WHERE a.owner_user_id = auth.uid()
  )
);