
-- Bookings: agency owners can update their bookings; admins can update any
CREATE POLICY "Owners can update their agency bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()))
WITH CHECK (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));

CREATE POLICY "Admins can update all bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- agency_public_profiles: admin-only write policies; other writes blocked
-- (rows are maintained by the sync_agency_public_profile trigger running as SECURITY DEFINER)
CREATE POLICY "Admins can insert agency public profiles"
ON public.agency_public_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update agency public profiles"
ON public.agency_public_profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete agency public profiles"
ON public.agency_public_profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
