
-- Fix 1: Profiles - deny anonymous SELECT, authenticated users already scoped to own data
CREATE POLICY "Deny anonymous select on profiles"
  ON public.profiles FOR SELECT TO anon USING (false);

-- Fix 2: Subscriptions - deny anonymous SELECT, authenticated users already scoped to own data
CREATE POLICY "Deny anonymous select on subscriptions"
  ON public.subscriptions FOR SELECT TO anon USING (false);

-- Fix 3: Access codes - deny all direct access (only accessed via SECURITY DEFINER RPCs)
CREATE POLICY "No direct select on access codes"
  ON public.access_codes FOR SELECT USING (false);

CREATE POLICY "No direct insert on access codes"
  ON public.access_codes FOR INSERT WITH CHECK (false);

CREATE POLICY "No direct update on access codes"
  ON public.access_codes FOR UPDATE USING (false);

CREATE POLICY "No direct delete on access codes"
  ON public.access_codes FOR DELETE USING (false);
