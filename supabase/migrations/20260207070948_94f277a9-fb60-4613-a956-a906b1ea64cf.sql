-- Drop the insecure policy that allows reading access codes
DROP POLICY IF EXISTS "Anyone can read unused access codes for validation" ON public.access_codes;

-- Create a secure RPC function to validate access codes without exposing them
CREATE OR REPLACE FUNCTION public.validate_access_code(code_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_valid boolean;
BEGIN
  -- Check if the code exists, is unused, and not expired
  SELECT EXISTS(
    SELECT 1 FROM public.access_codes
    WHERE code = code_to_check
    AND is_used = false
    AND (expires_at IS NULL OR expires_at > now())
  ) INTO code_valid;
  
  RETURN code_valid;
END;
$$;

-- Create a secure RPC function to redeem an access code during registration
CREATE OR REPLACE FUNCTION public.redeem_access_code(code_to_redeem text, user_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_id uuid;
BEGIN
  -- Find and lock the code row
  SELECT id INTO code_id
  FROM public.access_codes
  WHERE code = code_to_redeem
  AND is_used = false
  AND (expires_at IS NULL OR expires_at > now())
  FOR UPDATE;
  
  IF code_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Mark the code as used
  UPDATE public.access_codes
  SET is_used = true,
      used_at = now(),
      used_by = user_profile_id
  WHERE id = code_id;
  
  RETURN true;
END;
$$;