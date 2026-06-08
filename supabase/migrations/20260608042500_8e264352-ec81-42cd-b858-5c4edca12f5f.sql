
-- 1. Drop dependent view + legacy columns
DROP VIEW IF EXISTS public.available_vehicles_public;
ALTER TABLE public.agencies DROP COLUMN IF EXISTS payment_settings;
ALTER TABLE public.vehicles DROP COLUMN IF EXISTS payment_settings;

-- 2. Agency-level columns
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_restrictions TEXT,
  ADD COLUMN IF NOT EXISTS fee_settings JSONB NOT NULL DEFAULT jsonb_build_object(
    'security_deposit',           jsonb_build_object('enabled', false, 'amount', 0, 'taxable', false, 'collection_method', 'same_as_rental'),
    'cleaning_fee',               jsonb_build_object('enabled', false, 'amount', 0, 'taxable', false),
    'late_return_fee',            jsonb_build_object('enabled', false, 'amount', 0, 'taxable', false),
    'fuel_refueling_fee',         jsonb_build_object('enabled', false, 'amount', 0, 'taxable', false),
    'smoking_fee',                jsonb_build_object('enabled', false, 'amount', 0, 'taxable', false),
    'mileage_overage_fee',        jsonb_build_object('enabled', false, 'amount', 0, 'taxable', false, 'included_miles_per_day', 0),
    'toll_pass_fee',              jsonb_build_object('enabled', false, 'amount', 0, 'taxable', false),
    'young_driver_fee',           jsonb_build_object('enabled', false, 'amount', 0, 'taxable', false),
    'additional_driver_fee',      jsonb_build_object('enabled', false, 'amount', 0, 'taxable', false),
    'airport_fee',                jsonb_build_object('enabled', false, 'amount', 0, 'taxable', false),
    'insurance_damage_waiver_fee',jsonb_build_object('enabled', false, 'amount', 0, 'taxable', false)
  ),
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS custom_fees JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS fees_setup_complete BOOLEAN NOT NULL DEFAULT false;

-- 3. Vehicle-level override columns
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS payment_methods_override JSONB,
  ADD COLUMN IF NOT EXISTS payment_restrictions_override TEXT,
  ADD COLUMN IF NOT EXISTS fee_settings_override JSONB,
  ADD COLUMN IF NOT EXISTS tax_rate_override NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS custom_fees_override JSONB,
  ADD COLUMN IF NOT EXISTS fees_banner_dismissed BOOLEAN NOT NULL DEFAULT false;

-- 4. Shared validation function
CREATE OR REPLACE FUNCTION public.validate_payment_fee_payload(
  _fee_settings JSONB,
  _custom_fees JSONB,
  _tax_rate NUMERIC,
  _restrictions TEXT
) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  fee_key text;
  fee_val jsonb;
  amt numeric;
  miles numeric;
  cf jsonb;
  cf_amt numeric;
  cf_label text;
  cf_count int;
BEGIN
  IF _tax_rate IS NOT NULL AND (_tax_rate < 0 OR _tax_rate > 100) THEN
    RAISE EXCEPTION 'One or more values are outside the allowed range. Please review your settings and try again.';
  END IF;

  IF _restrictions IS NOT NULL AND char_length(_restrictions) > 500 THEN
    RAISE EXCEPTION 'One or more values are outside the allowed range. Please review your settings and try again.';
  END IF;

  IF _fee_settings IS NOT NULL THEN
    FOR fee_key, fee_val IN SELECT * FROM jsonb_each(_fee_settings) LOOP
      amt := COALESCE((fee_val->>'amount')::numeric, 0);
      IF fee_key = 'security_deposit' THEN
        IF amt < 0 OR amt > 5000 THEN
          RAISE EXCEPTION 'Security deposits are capped at $5,000. For higher deposits, please contact renters directly.';
        END IF;
      ELSE
        IF amt < 0 OR amt > 9999 THEN
          RAISE EXCEPTION 'One or more values are outside the allowed range. Please review your settings and try again.';
        END IF;
      END IF;

      IF fee_key = 'mileage_overage_fee' THEN
        miles := COALESCE((fee_val->>'included_miles_per_day')::numeric, 0);
        IF miles < 0 OR miles > 9999 THEN
          RAISE EXCEPTION 'One or more values are outside the allowed range. Please review your settings and try again.';
        END IF;
      END IF;
    END LOOP;
  END IF;

  IF _custom_fees IS NOT NULL THEN
    cf_count := jsonb_array_length(_custom_fees);
    IF cf_count > 3 THEN
      RAISE EXCEPTION 'Only up to 3 custom fees are allowed.';
    END IF;
    FOR cf IN SELECT * FROM jsonb_array_elements(_custom_fees) LOOP
      cf_amt := COALESCE((cf->>'amount')::numeric, 0);
      cf_label := COALESCE(cf->>'label', '');
      IF cf_amt < 0 OR cf_amt > 9999 THEN
        RAISE EXCEPTION 'One or more values are outside the allowed range. Please review your settings and try again.';
      END IF;
      IF char_length(cf_label) > 40 THEN
        RAISE EXCEPTION 'One or more values are outside the allowed range. Please review your settings and try again.';
      END IF;
    END LOOP;
  END IF;
END;
$$;

-- 5. Trigger functions + triggers
CREATE OR REPLACE FUNCTION public.validate_agency_payment_settings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM public.validate_payment_fee_payload(
    NEW.fee_settings,
    NEW.custom_fees,
    NEW.tax_rate,
    NEW.payment_restrictions
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_vehicle_payment_settings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM public.validate_payment_fee_payload(
    NEW.fee_settings_override,
    NEW.custom_fees_override,
    NEW.tax_rate_override,
    NEW.payment_restrictions_override
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_agency_payment_settings ON public.agencies;
CREATE TRIGGER trg_validate_agency_payment_settings
  BEFORE INSERT OR UPDATE OF fee_settings, custom_fees, tax_rate, payment_restrictions
  ON public.agencies
  FOR EACH ROW EXECUTE FUNCTION public.validate_agency_payment_settings();

DROP TRIGGER IF EXISTS trg_validate_vehicle_payment_settings ON public.vehicles;
CREATE TRIGGER trg_validate_vehicle_payment_settings
  BEFORE INSERT OR UPDATE OF fee_settings_override, custom_fees_override, tax_rate_override, payment_restrictions_override
  ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.validate_vehicle_payment_settings();

-- 6. Rebuild public view with new columns
CREATE OR REPLACE VIEW public.available_vehicles_public AS
SELECT
  v.id, v.make, v.model, v.year, v.vehicle_type, v.daily_rate,
  v.description, v.features, v.fuel_type, v.seats, v.transmission,
  v.images, v.location_city, v.location_state, v.profile_id,
  ap.business_name, ap.cash_accepted, ap.owner_story, ap.deposit_info,
  ap.cancellation_policy, ap.requirements, ap.photos AS agency_photos,
  v.payment_methods_override AS vehicle_payment_methods,
  v.payment_restrictions_override AS vehicle_payment_restrictions,
  v.fee_settings_override AS vehicle_fee_settings,
  v.tax_rate_override AS vehicle_tax_rate,
  v.custom_fees_override AS vehicle_custom_fees,
  (SELECT a.payment_methods      FROM agencies a JOIN profiles p ON p.user_id = a.owner_user_id WHERE p.id = v.profile_id LIMIT 1) AS agency_payment_methods,
  (SELECT a.payment_restrictions FROM agencies a JOIN profiles p ON p.user_id = a.owner_user_id WHERE p.id = v.profile_id LIMIT 1) AS agency_payment_restrictions,
  (SELECT a.fee_settings         FROM agencies a JOIN profiles p ON p.user_id = a.owner_user_id WHERE p.id = v.profile_id LIMIT 1) AS agency_fee_settings,
  (SELECT a.tax_rate             FROM agencies a JOIN profiles p ON p.user_id = a.owner_user_id WHERE p.id = v.profile_id LIMIT 1) AS agency_tax_rate,
  (SELECT a.custom_fees          FROM agencies a JOIN profiles p ON p.user_id = a.owner_user_id WHERE p.id = v.profile_id LIMIT 1) AS agency_custom_fees
FROM public.vehicles v
JOIN public.agency_public_profiles ap ON ap.profile_id = v.profile_id
WHERE v.status = 'available'::vehicle_status AND public.profile_has_approved_agency(v.profile_id);

GRANT SELECT ON public.available_vehicles_public TO anon, authenticated;
