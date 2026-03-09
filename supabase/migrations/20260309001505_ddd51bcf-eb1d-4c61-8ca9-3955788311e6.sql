-- Replace SECURITY DEFINER view approach with a dedicated public-safe table,
-- so we can keep the view as security_invoker=on while still hiding PII.

-- 1) Public-safe projection of profiles (no contact_email/phone/address)
CREATE TABLE IF NOT EXISTS public.agency_public_profiles (
  profile_id uuid PRIMARY KEY,
  business_name text NOT NULL,
  cash_accepted boolean NOT NULL DEFAULT false,
  owner_story text NULL,
  deposit_info text NULL,
  cancellation_policy text NULL,
  requirements text[] NULL,
  photos text[] NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT agency_public_profiles_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.agency_public_profiles ENABLE ROW LEVEL SECURITY;

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS update_agency_public_profiles_updated_at ON public.agency_public_profiles;
CREATE TRIGGER update_agency_public_profiles_updated_at
BEFORE UPDATE ON public.agency_public_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Policies: public can read only when the owning agency is approved+active
DROP POLICY IF EXISTS "Public can view agency public profiles" ON public.agency_public_profiles;
DROP POLICY IF EXISTS "Authenticated can view agency public profiles" ON public.agency_public_profiles;

CREATE POLICY "Public can view agency public profiles"
ON public.agency_public_profiles
FOR SELECT
TO anon
USING (public.profile_has_approved_agency(profile_id));

CREATE POLICY "Authenticated can view agency public profiles"
ON public.agency_public_profiles
FOR SELECT
TO authenticated
USING (public.profile_has_approved_agency(profile_id));

-- 3) Sync table from profiles (runs server-side, no client write needed)
CREATE OR REPLACE FUNCTION public.sync_agency_public_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.agency_public_profiles (
    profile_id,
    business_name,
    cash_accepted,
    owner_story,
    deposit_info,
    cancellation_policy,
    requirements,
    photos
  ) VALUES (
    NEW.id,
    NEW.business_name,
    NEW.cash_accepted,
    NEW.owner_story,
    NEW.deposit_info,
    NEW.cancellation_policy,
    NEW.requirements,
    NEW.photos
  )
  ON CONFLICT (profile_id)
  DO UPDATE SET
    business_name = EXCLUDED.business_name,
    cash_accepted = EXCLUDED.cash_accepted,
    owner_story = EXCLUDED.owner_story,
    deposit_info = EXCLUDED.deposit_info,
    cancellation_policy = EXCLUDED.cancellation_policy,
    requirements = EXCLUDED.requirements,
    photos = EXCLUDED.photos,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_agency_public_profile_after_write ON public.profiles;
CREATE TRIGGER sync_agency_public_profile_after_write
AFTER INSERT OR UPDATE OF
  business_name,
  cash_accepted,
  owner_story,
  deposit_info,
  cancellation_policy,
  requirements,
  photos
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_agency_public_profile();

-- 4) Backfill existing profiles
INSERT INTO public.agency_public_profiles (
  profile_id,
  business_name,
  cash_accepted,
  owner_story,
  deposit_info,
  cancellation_policy,
  requirements,
  photos
)
SELECT
  p.id,
  p.business_name,
  p.cash_accepted,
  p.owner_story,
  p.deposit_info,
  p.cancellation_policy,
  p.requirements,
  p.photos
FROM public.profiles p
ON CONFLICT (profile_id)
DO UPDATE SET
  business_name = EXCLUDED.business_name,
  cash_accepted = EXCLUDED.cash_accepted,
  owner_story = EXCLUDED.owner_story,
  deposit_info = EXCLUDED.deposit_info,
  cancellation_policy = EXCLUDED.cancellation_policy,
  requirements = EXCLUDED.requirements,
  photos = EXCLUDED.photos,
  updated_at = now();

-- 5) Rebuild the public view to join the public-safe table and switch back to security_invoker=on
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
  ap.business_name,
  ap.cash_accepted,
  ap.owner_story,
  ap.deposit_info,
  ap.cancellation_policy,
  ap.requirements,
  ap.photos AS agency_photos
FROM public.vehicles v
JOIN public.agency_public_profiles ap
  ON ap.profile_id = v.profile_id
WHERE v.status = 'available'::vehicle_status
  AND public.profile_has_approved_agency(v.profile_id);

ALTER VIEW public.available_vehicles_public SET (security_invoker = on);

GRANT SELECT ON public.available_vehicles_public TO anon, authenticated;