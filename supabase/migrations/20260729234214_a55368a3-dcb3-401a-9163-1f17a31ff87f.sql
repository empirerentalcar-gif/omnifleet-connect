DROP VIEW IF EXISTS public.available_vehicles_public;

CREATE VIEW public.available_vehicles_public AS
 SELECT v.id,
    v.make,
    v.model,
    v.year,
    v.vehicle_type,
    v.daily_rate,
    v.description,
    v.features,
    v.fuel_type,
    v.seats,
    v.transmission,
    v.images,
    v.location_city,
    v.location_state,
    v.profile_id,
    ap.cash_accepted,
    ap.owner_story,
    ap.deposit_info,
    ap.cancellation_policy,
    ap.requirements,
    ap.photos AS agency_photos,
    v.payment_methods_override AS vehicle_payment_methods,
    v.payment_restrictions_override AS vehicle_payment_restrictions,
    v.fee_settings_override AS vehicle_fee_settings,
    v.tax_rate_override AS vehicle_tax_rate,
    v.custom_fees_override AS vehicle_custom_fees,
    d.payment_methods AS agency_payment_methods,
    d.payment_restrictions AS agency_payment_restrictions,
    d.fee_settings AS agency_fee_settings,
    d.tax_rate AS agency_tax_rate,
    d.custom_fees AS agency_custom_fees,
    public.profile_can_accept_payments(v.profile_id) AS bookable
   FROM public.vehicles v
     JOIN public.agency_public_profiles ap ON ap.profile_id = v.profile_id
     LEFT JOIN LATERAL public.get_agency_payment_defaults(v.profile_id) d(payment_methods, payment_restrictions, fee_settings, tax_rate, custom_fees) ON true
  WHERE v.status = 'available'::vehicle_status AND public.profile_has_approved_agency(v.profile_id);

ALTER VIEW public.available_vehicles_public SET (security_invoker = true);
GRANT SELECT ON public.available_vehicles_public TO anon, authenticated;

-- Column-level access: hide business_name from public readers
REVOKE SELECT ON public.agency_public_profiles FROM anon, authenticated;
GRANT SELECT (profile_id, cash_accepted, owner_story, deposit_info, cancellation_policy, requirements, photos, created_at, updated_at)
  ON public.agency_public_profiles TO anon, authenticated;
GRANT ALL ON public.agency_public_profiles TO service_role;

-- Public agency lookup no longer leaks names
DROP FUNCTION IF EXISTS public.get_public_agencies();
CREATE FUNCTION public.get_public_agencies()
RETURNS TABLE(id uuid, city text, state text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT id, city, state
  FROM public.agencies
  WHERE approved = true AND active = true;
$function$;
GRANT EXECUTE ON FUNCTION public.get_public_agencies() TO anon, authenticated;