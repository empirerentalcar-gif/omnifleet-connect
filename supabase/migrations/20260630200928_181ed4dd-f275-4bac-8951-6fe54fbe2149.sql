
-- Fix 1: Allow renters to view their own bookings (profile_id ties to their profile).
CREATE POLICY "Renters can view their own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Fix 2: Replace the broken reservations INSERT check that called
-- profile_has_approved_agency(agency_id) — the function expects a profile_id,
-- not an agency id, so the check was effectively meaningless.
DROP POLICY IF EXISTS "Anyone can submit reservations with validation" ON public.reservations;

CREATE POLICY "Anyone can submit reservations with validation"
  ON public.reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    full_name IS NOT NULL
    AND char_length(full_name) > 1
    AND phone_number IS NOT NULL
    AND char_length(phone_number) > 6
    AND agency_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.agencies a
      WHERE a.id = reservations.agency_id
        AND a.approved = true
        AND a.active = true
    )
  );
