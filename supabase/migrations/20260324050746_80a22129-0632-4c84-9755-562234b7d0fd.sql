
-- Function to validate an invite code (callable by anyone, security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.validate_invite_code(code_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.invite_codes
    WHERE code = code_to_check
    AND active = true
    AND uses_count < max_uses
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Function to redeem an invite code (increment uses_count)
CREATE OR REPLACE FUNCTION public.redeem_invite_code(code_to_redeem text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  code_row_id uuid;
BEGIN
  -- Find and lock the code row
  SELECT id INTO code_row_id
  FROM public.invite_codes
  WHERE code = code_to_redeem
  AND active = true
  AND uses_count < max_uses
  AND (expires_at IS NULL OR expires_at > now())
  FOR UPDATE;

  IF code_row_id IS NULL THEN
    RETURN false;
  END IF;

  -- Increment uses_count
  UPDATE public.invite_codes
  SET uses_count = uses_count + 1,
      updated_at = now()
  WHERE id = code_row_id;

  RETURN true;
END;
$$;
