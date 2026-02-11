
-- Create rate limit tracking table
CREATE TABLE IF NOT EXISTS public.rpc_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  function_name TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.rpc_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies needed - only accessed via SECURITY DEFINER functions

-- Create helper function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  func_name text,
  max_attempts integer DEFAULT 10,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
  caller_id uuid;
BEGIN
  caller_id := auth.uid();
  
  -- Count recent attempts (by user_id if authenticated, otherwise count all anonymous)
  SELECT COALESCE(SUM(attempt_count), 0) INTO current_attempts
  FROM public.rpc_rate_limits
  WHERE function_name = func_name
  AND (
    (caller_id IS NOT NULL AND user_id = caller_id)
    OR (caller_id IS NULL AND user_id IS NULL)
  )
  AND window_start > now() - (window_minutes || ' minutes')::interval;
  
  IF current_attempts >= max_attempts THEN
    RETURN false;
  END IF;
  
  -- Log this attempt
  INSERT INTO public.rpc_rate_limits (user_id, function_name)
  VALUES (caller_id, func_name);
  
  RETURN true;
END;
$$;

-- Update validate_access_code with rate limiting
-- NOTE: validate_access_code intentionally allows unauthenticated access
-- because it's used during the registration flow before the user has an account
CREATE OR REPLACE FUNCTION public.validate_access_code(code_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check rate limit (10 attempts per hour)
  IF NOT public.check_rate_limit('validate_access_code', 10, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  RETURN EXISTS(
    SELECT 1 FROM public.access_codes
    WHERE code = code_to_check
    AND is_used = false
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Update redeem_access_code with auth check + rate limiting
CREATE OR REPLACE FUNCTION public.redeem_access_code(code_to_redeem text, user_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_id uuid;
  caller_profile_id uuid;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Verify caller owns the profile
  SELECT id INTO caller_profile_id
  FROM public.profiles
  WHERE user_id = auth.uid()
  AND id = user_profile_id;
  
  IF caller_profile_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: profile does not belong to caller';
  END IF;

  -- Check rate limit (5 attempts per hour for redemption)
  IF NOT public.check_rate_limit('redeem_access_code', 5, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
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

-- Cleanup old rate limit entries periodically (optional index for performance)
CREATE INDEX IF NOT EXISTS idx_rpc_rate_limits_lookup 
ON public.rpc_rate_limits (function_name, user_id, window_start);
