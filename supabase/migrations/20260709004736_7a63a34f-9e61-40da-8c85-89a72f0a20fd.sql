ALTER PUBLICATION supabase_realtime DROP TABLE public.agencies;

CREATE POLICY "Owners can delete their reservation requests"
ON public.reservation_requests
FOR DELETE
TO authenticated
USING (
  profile_id IN (
    SELECT profiles.id FROM public.profiles WHERE profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete reservation requests"
ON public.reservation_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));