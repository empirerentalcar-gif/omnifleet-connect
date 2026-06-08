
CREATE OR REPLACE FUNCTION public.get_agency_payment_defaults(_profile_id uuid)
RETURNS TABLE (
  payment_methods jsonb,
  payment_restrictions text,
  fee_settings jsonb,
  tax_rate numeric,
  custom_fees jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.payment_methods, a.payment_restrictions, a.fee_settings, a.tax_rate, a.custom_fees
  FROM public.agencies a
  JOIN public.profiles p ON p.user_id = a.owner_user_id
  WHERE p.id = _profile_id
    AND a.approved = true
    AND a.active = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_agency_payment_defaults(uuid) TO anon, authenticated;

DROP VIEW IF EXISTS public.available_vehicles_public;

CREATE VIEW public.available_vehicles_public
WITH (security_invoker = true) AS
SELECT
  v.id,
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
  ap.business_name,
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
  d.custom_fees AS agency_custom_fees
FROM public.vehicles v
JOIN public.agency_public_profiles ap ON ap.profile_id = v.profile_id
LEFT JOIN LATERAL public.get_agency_payment_defaults(v.profile_id) d ON true
WHERE v.status = 'available'::vehicle_status
  AND public.profile_has_approved_agency(v.profile_id);

GRANT SELECT ON public.available_vehicles_public TO anon, authenticated;
