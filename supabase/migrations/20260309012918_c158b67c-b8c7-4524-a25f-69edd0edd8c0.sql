
CREATE OR REPLACE FUNCTION public.assign_agency_owner(
  _agency_id uuid,
  _owner_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Require admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;

  -- Validate agency exists
  IF NOT EXISTS (SELECT 1 FROM public.agencies WHERE id = _agency_id) THEN
    RAISE EXCEPTION 'Agency not found';
  END IF;

  -- Validate owner profile exists for this user_id
  IF _owner_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _owner_user_id) THEN
    RAISE EXCEPTION 'No profile found for the specified user';
  END IF;

  -- Perform the update
  UPDATE public.agencies
  SET owner_user_id = _owner_user_id,
      updated_at = now()
  WHERE id = _agency_id;
END;
$$;
