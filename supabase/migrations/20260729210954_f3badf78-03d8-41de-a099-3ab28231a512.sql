-- 1. Leads table for agencies that cannot accept payments yet
CREATE TABLE public.vehicle_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL,
  agency_id uuid,
  renter_name text NOT NULL,
  renter_email text NOT NULL,
  renter_phone text NOT NULL,
  pickup_date date NOT NULL,
  dropoff_date date NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'new',
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_inquiries TO authenticated;
GRANT INSERT ON public.vehicle_inquiries TO anon;
GRANT ALL ON public.vehicle_inquiries TO service_role;

ALTER TABLE public.vehicle_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an inquiry for a listed vehicle"
ON public.vehicle_inquiries FOR INSERT TO anon, authenticated
WITH CHECK (
  public.profile_exists(profile_id)
  AND EXISTS (
    SELECT 1 FROM public.vehicles v
    WHERE v.id = vehicle_id AND v.profile_id = vehicle_inquiries.profile_id
  )
);

CREATE POLICY "Agency owners can view their inquiries"
ON public.vehicle_inquiries FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = vehicle_inquiries.profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all inquiries"
ON public.vehicle_inquiries FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agency owners and admins can update inquiries"
ON public.vehicle_inquiries FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = vehicle_inquiries.profile_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = vehicle_inquiries.profile_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete inquiries"
ON public.vehicle_inquiries FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_vehicle_inquiries_profile ON public.vehicle_inquiries(profile_id, created_at DESC);
CREATE INDEX idx_vehicle_inquiries_vehicle ON public.vehicle_inquiries(vehicle_id);

CREATE TRIGGER update_vehicle_inquiries_updated_at
BEFORE UPDATE ON public.vehicle_inquiries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.renter_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid renter email';
  END IF;
  IF NEW.renter_phone !~ '^[0-9()\-\+\s\.]+$' THEN
    RAISE EXCEPTION 'Invalid renter phone';
  END IF;
  IF char_length(NEW.renter_name) < 2 OR char_length(NEW.renter_name) > 100 THEN
    RAISE EXCEPTION 'Invalid renter name';
  END IF;
  IF NEW.message IS NOT NULL AND char_length(NEW.message) > 1000 THEN
    RAISE EXCEPTION 'Message is too long';
  END IF;
  IF TG_OP = 'INSERT' AND NEW.pickup_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Pickup date cannot be in the past';
  END IF;
  IF NEW.dropoff_date <= NEW.pickup_date THEN
    RAISE EXCEPTION 'Drop-off date must be after pickup date';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_vehicle_inquiry
BEFORE INSERT OR UPDATE ON public.vehicle_inquiries
FOR EACH ROW EXECUTE FUNCTION public.validate_inquiry();

-- 2. Double-booking prevention
CREATE OR REPLACE FUNCTION public.prevent_double_booking()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  conflict_id uuid;
BEGIN
  -- Only active bookings hold a vehicle's dates.
  IF NEW.booking_status NOT IN ('pending_agency', 'approved') THEN
    RETURN NEW;
  END IF;

  -- On UPDATE, only re-check when the hold actually changes.
  IF TG_OP = 'UPDATE'
     AND NEW.vehicle_id IS NOT DISTINCT FROM OLD.vehicle_id
     AND NEW.pickup_date IS NOT DISTINCT FROM OLD.pickup_date
     AND NEW.dropoff_date IS NOT DISTINCT FROM OLD.dropoff_date
     AND OLD.booking_status IN ('pending_agency', 'approved') THEN
    RETURN NEW;
  END IF;

  SELECT b.id INTO conflict_id
  FROM public.bookings b
  WHERE b.vehicle_id = NEW.vehicle_id
    AND b.id <> NEW.id
    AND b.booking_status IN ('pending_agency', 'approved')
    AND daterange(b.pickup_date, b.dropoff_date, '[)')
        && daterange(NEW.pickup_date, NEW.dropoff_date, '[)')
  LIMIT 1;

  IF conflict_id IS NOT NULL THEN
    RAISE EXCEPTION 'These dates are no longer available for this vehicle. Please choose different dates.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_double_booking_trigger
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.prevent_double_booking();

-- 3. Expose payment-readiness on the public listing
CREATE OR REPLACE FUNCTION public.profile_can_accept_payments(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.agencies a ON a.owner_user_id = p.user_id
    WHERE p.id = _profile_id
      AND a.approved = true
      AND a.active = true
      AND a.stripe_charges_enabled = true
      AND a.stripe_connect_account_id IS NOT NULL
  );
$$;

CREATE OR REPLACE VIEW public.available_vehicles_public AS
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
    FROM vehicles v
      JOIN agency_public_profiles ap ON ap.profile_id = v.profile_id
      LEFT JOIN LATERAL get_agency_payment_defaults(v.profile_id) d(payment_methods, payment_restrictions, fee_settings, tax_rate, custom_fees) ON true
   WHERE v.status = 'available'::vehicle_status AND profile_has_approved_agency(v.profile_id);