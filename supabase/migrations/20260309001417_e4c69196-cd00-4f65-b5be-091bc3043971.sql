-- Ensure public users can browse only vehicles belonging to approved+active agencies,
-- and fix the public view so it doesn't get blocked by profiles RLS.

CREATE OR REPLACE FUNCTION public.profile_has_approved_agency(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.agencies a
      ON a.owner_user_id = p.user_id
    WHERE p.id = _profile_id
      AND a.approved = true
      AND a.active = true
  );
$$;

-- Public agency read (approved + active)
DROP POLICY IF EXISTS "Public can view approved active agencies" ON public.agencies;
DROP POLICY IF EXISTS "Authenticated can view approved active agencies" ON public.agencies;

CREATE POLICY "Public can view approved active agencies"
ON public.agencies
FOR SELECT
TO anon
USING (approved = true AND active = true);

CREATE POLICY "Authenticated can view approved active agencies"
ON public.agencies
FOR SELECT
TO authenticated
USING (approved = true AND active = true);

-- Tighten vehicle public read to only vehicles from approved+active agencies
DROP POLICY IF EXISTS "Anyone can view available vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Public can view available vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Authenticated can browse available vehicles" ON public.vehicles;

CREATE POLICY "Public can view available vehicles"
ON public.vehicles
FOR SELECT
TO anon
USING (
  status = 'available'::vehicle_status
  AND public.profile_has_approved_agency(profile_id)
);

CREATE POLICY "Authenticated can browse available vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (
  status = 'available'::vehicle_status
  AND public.profile_has_approved_agency(profile_id)
);

-- Rebuild the public view so it no longer runs as the caller (security_invoker=on)
-- which was blocking it due to profiles RLS.
CREATE OR REPLACE VIEW public.available_vehicles_public AS
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
  p.cash_accepted,
  p.owner_story,
  p.deposit_info,
  p.cancellation_policy,
  p.requirements,
  p.photos AS agency_photos
FROM public.vehicles v
JOIN public.profiles p ON p.id = v.profile_id
WHERE v.status = 'available'::vehicle_status
  AND public.profile_has_approved_agency(v.profile_id);

ALTER VIEW public.available_vehicles_public SET (security_invoker = off);

GRANT SELECT ON public.available_vehicles_public TO anon, authenticated;