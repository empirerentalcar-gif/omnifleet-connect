
-- Function to bootstrap the first admin account (only works when no admins exist)
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if ANY admin already exists
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'An admin account already exists. Bootstrap is disabled.';
  END IF;

  -- Assign admin role to the caller
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin');

  RETURN true;
END;
$$;
