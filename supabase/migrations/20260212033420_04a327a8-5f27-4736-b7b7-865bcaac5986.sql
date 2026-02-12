
-- Fix 1: Add deny-all RLS policies on rpc_rate_limits (SECURITY DEFINER functions bypass RLS)
CREATE POLICY "No direct select on rate limits"
  ON public.rpc_rate_limits FOR SELECT USING (false);

CREATE POLICY "No direct insert on rate limits"
  ON public.rpc_rate_limits FOR INSERT WITH CHECK (false);

CREATE POLICY "No direct update on rate limits"
  ON public.rpc_rate_limits FOR UPDATE USING (false);

CREATE POLICY "No direct delete on rate limits"
  ON public.rpc_rate_limits FOR DELETE USING (false);

-- Fix 2: Add database-level constraints for server-side input validation
ALTER TABLE public.profiles
  ADD CONSTRAINT business_name_length CHECK (char_length(business_name) <= 200);

ALTER TABLE public.profiles
  ADD CONSTRAINT contact_email_length CHECK (char_length(contact_email) <= 255);

ALTER TABLE public.access_codes
  ADD CONSTRAINT code_length CHECK (char_length(code) <= 100);
