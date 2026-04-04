
-- 1. Drop INSERT and UPDATE policies on subscriptions to prevent client-side mutation
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;

-- 2. Replace the permissive reservations INSERT policy with a constrained one
DROP POLICY IF EXISTS "Anyone can submit reservations" ON public.reservations;

CREATE POLICY "Anyone can submit reservations with validation"
ON public.reservations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  full_name IS NOT NULL
  AND char_length(full_name) > 1
  AND phone_number IS NOT NULL
  AND char_length(phone_number) > 6
  AND (
    agency_id IS NULL
    OR profile_has_approved_agency(agency_id)
  )
);
