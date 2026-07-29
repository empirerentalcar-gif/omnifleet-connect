ALTER VIEW public.available_vehicles_public SET (security_invoker = true);
GRANT SELECT ON public.available_vehicles_public TO anon, authenticated;