
-- Drop and recreate the public vehicles view to include agency info
DROP VIEW IF EXISTS public.available_vehicles_public;

CREATE VIEW public.available_vehicles_public
WITH (security_invoker = on) AS
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
  p.business_name,
  p.contact_phone,
  p.cash_accepted,
  p.owner_story,
  p.deposit_info,
  p.cancellation_policy,
  p.requirements,
  p.photos AS agency_photos
FROM public.vehicles v
JOIN public.profiles p ON p.id = v.profile_id
WHERE v.status = 'available';
