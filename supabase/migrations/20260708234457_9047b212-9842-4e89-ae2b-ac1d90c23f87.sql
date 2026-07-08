DROP POLICY IF EXISTS "Public can submit reservation requests with valid profile_id" ON public.reservation_requests;

CREATE POLICY "Public can submit reservation requests to active agencies"
ON public.reservation_requests
FOR INSERT
WITH CHECK (
  status = 'pending'
  AND profile_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.agencies a ON a.owner_user_id = p.user_id
    WHERE p.id = reservation_requests.profile_id
      AND a.approved = true
      AND a.active = true
  )
);