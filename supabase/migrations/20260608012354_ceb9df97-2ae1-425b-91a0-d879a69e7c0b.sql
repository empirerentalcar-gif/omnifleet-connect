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
       ap.business_name,
       ap.cash_accepted,
       ap.owner_story,
       ap.deposit_info,
       ap.cancellation_policy,
       ap.requirements,
       ap.photos AS agency_photos,
       v.payment_settings AS vehicle_payment_settings,
       (SELECT a.payment_settings
          FROM public.agencies a
          JOIN public.profiles p ON p.user_id = a.owner_user_id
         WHERE p.id = v.profile_id
         LIMIT 1) AS agency_payment_settings
  FROM public.vehicles v
  JOIN public.agency_public_profiles ap ON ap.profile_id = v.profile_id
 WHERE v.status = 'available'::vehicle_status
   AND profile_has_approved_agency(v.profile_id);
GRANT SELECT ON public.available_vehicles_public TO anon, authenticated;