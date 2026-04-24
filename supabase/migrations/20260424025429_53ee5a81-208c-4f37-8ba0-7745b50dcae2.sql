-- =========================================
-- Phase 1: Stripe Connect + Bookings schema
-- =========================================

-- 1. Add Stripe fields to agencies
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_connect_status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS grace_period_end date;

CREATE UNIQUE INDEX IF NOT EXISTS agencies_stripe_connect_account_id_key
  ON public.agencies (stripe_connect_account_id)
  WHERE stripe_connect_account_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS agencies_stripe_subscription_id_key
  ON public.agencies (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- 2. Bookings table (paid, vehicle-specific reservations)
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE RESTRICT,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  renter_name text NOT NULL,
  renter_email text NOT NULL,
  renter_phone text NOT NULL,
  pickup_date date NOT NULL,
  dropoff_date date NOT NULL,
  rental_days integer NOT NULL,
  daily_rate_cents integer NOT NULL,
  total_amount_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id text UNIQUE,
  stripe_setup_intent_id text UNIQUE,
  stripe_charge_id text,
  payment_method_id text,
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','requires_capture','authorized','scheduled','captured','canceled','failed','refunded')),
  booking_status text NOT NULL DEFAULT 'pending_agency'
    CHECK (booking_status IN ('pending_agency','approved','declined','completed','canceled')),
  capture_method text NOT NULL DEFAULT 'manual'
    CHECK (capture_method IN ('manual','setup_intent')),
  decline_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_agency_id_idx ON public.bookings (agency_id);
CREATE INDEX IF NOT EXISTS bookings_vehicle_id_idx ON public.bookings (vehicle_id);
CREATE INDEX IF NOT EXISTS bookings_pickup_date_idx ON public.bookings (pickup_date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (booking_status, payment_status);

-- updated_at trigger
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Validation trigger (dates, amounts)
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.pickup_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Pickup date cannot be in the past';
  END IF;
  IF NEW.dropoff_date <= NEW.pickup_date THEN
    RAISE EXCEPTION 'Drop-off date must be after pickup date';
  END IF;
  IF NEW.rental_days < 1 THEN
    RAISE EXCEPTION 'Rental days must be >= 1';
  END IF;
  IF NEW.total_amount_cents < 100 THEN
    RAISE EXCEPTION 'Total amount must be at least $1.00';
  END IF;
  IF NEW.platform_fee_cents < 0 OR NEW.platform_fee_cents > NEW.total_amount_cents THEN
    RAISE EXCEPTION 'Invalid platform fee';
  END IF;
  IF NEW.renter_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid renter email';
  END IF;
  IF NEW.renter_phone !~ '^[0-9()\-\+\s\.]+$' THEN
    RAISE EXCEPTION 'Invalid renter phone';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_booking_trigger ON public.bookings;
CREATE TRIGGER validate_booking_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking();

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS: anyone (anon or authenticated) can create a booking against an approved agency's vehicle
CREATE POLICY "Public can create bookings for approved agencies"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  booking_status = 'pending_agency'
  AND payment_status IN ('pending','requires_capture','authorized','scheduled')
  AND profile_has_approved_agency(profile_id)
  AND EXISTS (
    SELECT 1 FROM public.vehicles v
    WHERE v.id = vehicle_id
      AND v.profile_id = bookings.profile_id
  )
);

-- Agency owners can view bookings for their agency
CREATE POLICY "Owners can view their agency bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid())
);

-- Agency owners can update bookings for their agency (approve / decline / mark complete)
CREATE POLICY "Owners can update their agency bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid())
)
WITH CHECK (
  agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid())
);

-- Admins can view all
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 3. Stripe webhook event idempotency table
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb
);

CREATE INDEX IF NOT EXISTS stripe_webhook_events_type_idx
  ON public.stripe_webhook_events (event_type);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- No client access; service role bypasses RLS
CREATE POLICY "No client read on webhook events"
ON public.stripe_webhook_events FOR SELECT TO public USING (false);
CREATE POLICY "No client insert on webhook events"
ON public.stripe_webhook_events FOR INSERT TO public WITH CHECK (false);
CREATE POLICY "No client update on webhook events"
ON public.stripe_webhook_events FOR UPDATE TO public USING (false);
CREATE POLICY "No client delete on webhook events"
ON public.stripe_webhook_events FOR DELETE TO public USING (false);

-- 4. Update profile_has_approved_agency to also allow grace period
-- (Soft-block: agencies in grace period are still considered approved.)
CREATE OR REPLACE FUNCTION public.profile_has_approved_agency(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.agencies a ON a.owner_user_id = p.user_id
    WHERE p.id = _profile_id
      AND a.approved = true
      AND a.active = true
      AND (
        a.subscription_status NOT IN ('expired', 'payment_required')
        OR (a.grace_period_end IS NOT NULL AND a.grace_period_end >= CURRENT_DATE)
      )
  );
$$;
