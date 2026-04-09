
-- Drop the old permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit reservations with validation" ON public.reservations;

-- Recreate with agency_id IS NOT NULL requirement
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
  AND profile_has_approved_agency(agency_id)
);
