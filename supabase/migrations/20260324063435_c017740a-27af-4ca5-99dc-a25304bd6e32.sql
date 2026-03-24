CREATE POLICY "Admins can view all reservation requests"
ON public.reservation_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));