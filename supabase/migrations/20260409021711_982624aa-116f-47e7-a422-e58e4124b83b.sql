ALTER TABLE public.reservation_requests DROP CONSTRAINT IF EXISTS reservation_requests_profile_id_fkey;
ALTER TABLE public.reservation_requests
  ADD CONSTRAINT reservation_requests_profile_id_fkey
  FOREIGN KEY (profile_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;