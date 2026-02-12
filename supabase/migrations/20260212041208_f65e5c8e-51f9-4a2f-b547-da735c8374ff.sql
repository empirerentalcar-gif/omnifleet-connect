
-- Fix: set view to SECURITY INVOKER to avoid security definer warning
ALTER VIEW public.available_vehicles_public SET (security_invoker = on);
