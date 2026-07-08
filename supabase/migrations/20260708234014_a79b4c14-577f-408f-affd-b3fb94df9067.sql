-- 1. Add per-agency commission rate column (default 10% for new rows going forward)
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS commission_rate_bps INTEGER NOT NULL DEFAULT 1000;

-- 2. Grandfather every existing agency at 5% (500 bps).
--    Safe because this migration runs once; new rows created after this point
--    receive the 1000 default via handle_new_user / column default.
UPDATE public.agencies SET commission_rate_bps = 500 WHERE created_at < now();

-- 3. Protect commission_rate_bps from client-side owner edits (admins / service_role bypass).
CREATE OR REPLACE FUNCTION public.prevent_owner_sensitive_agency_updates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('role', true) = 'service_role'
     OR auth.role() = 'service_role'
     OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'::app_role)) THEN
    RETURN NEW;
  END IF;

  IF NEW.stripe_connect_account_id IS DISTINCT FROM OLD.stripe_connect_account_id
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
     OR NEW.stripe_charges_enabled IS DISTINCT FROM OLD.stripe_charges_enabled
     OR NEW.stripe_payouts_enabled IS DISTINCT FROM OLD.stripe_payouts_enabled
     OR NEW.stripe_connect_status IS DISTINCT FROM OLD.stripe_connect_status
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.approved IS DISTINCT FROM OLD.approved
     OR NEW.active IS DISTINCT FROM OLD.active
     OR NEW.is_founding_member IS DISTINCT FROM OLD.is_founding_member
     OR NEW.founding_member_number IS DISTINCT FROM OLD.founding_member_number
     OR NEW.grace_period_end IS DISTINCT FROM OLD.grace_period_end
     OR NEW.trial_start_date IS DISTINCT FROM OLD.trial_start_date
     OR NEW.trial_end_date IS DISTINCT FROM OLD.trial_end_date
     OR NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id
     OR NEW.tos_version_2026_06 IS DISTINCT FROM OLD.tos_version_2026_06
     OR NEW.commission_rate_bps IS DISTINCT FROM OLD.commission_rate_bps
  THEN
    RAISE EXCEPTION 'You are not allowed to modify protected agency fields. Please contact support if you need a change to billing, approval, or Stripe settings.';
  END IF;

  RETURN NEW;
END;
$function$;

-- 4. New signups: 30-day trial for everyone (founding + non-founding),
--    and explicit 1000 bps (10%) commission.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  founding_count integer;
  next_number integer;
  is_founding boolean;
  trial_days integer;
  existing_profile_id uuid;
  existing_agency_id uuid;
  normalized_business_name text;
  meta_city text;
  meta_state text;
  meta_phone text;
  has_required_profile boolean;
BEGIN
  normalized_business_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'business_name'), ''), 'My Business');
  meta_city  := NULLIF(trim(NEW.raw_user_meta_data->>'city'), '');
  meta_state := NULLIF(trim(NEW.raw_user_meta_data->>'state'), '');
  meta_phone := NULLIF(trim(NEW.raw_user_meta_data->>'phone'), '');
  has_required_profile := meta_city IS NOT NULL AND meta_state IS NOT NULL AND meta_phone IS NOT NULL;

  SELECT p.id INTO existing_profile_id
  FROM public.profiles p
  WHERE p.user_id = NEW.id OR lower(p.contact_email) = lower(NEW.email)
  ORDER BY CASE WHEN p.user_id = NEW.id THEN 0 ELSE 1 END, p.created_at ASC
  LIMIT 1;

  IF existing_profile_id IS NOT NULL THEN
    UPDATE public.profiles
    SET user_id = NEW.id,
        business_name = normalized_business_name,
        contact_email = NEW.email,
        updated_at = now()
    WHERE id = existing_profile_id;
  ELSE
    INSERT INTO public.profiles (user_id, business_name, contact_email)
    VALUES (NEW.id, normalized_business_name, NEW.email)
    RETURNING id INTO existing_profile_id;
  END IF;

  SELECT a.id INTO existing_agency_id
  FROM public.agencies a
  WHERE a.owner_user_id = NEW.id OR lower(a.email) = lower(NEW.email)
  ORDER BY CASE WHEN a.owner_user_id = NEW.id THEN 0 ELSE 1 END, a.created_at ASC
  LIMIT 1;

  IF existing_agency_id IS NOT NULL THEN
    UPDATE public.agencies
    SET owner_user_id = NEW.id,
        agency_name = normalized_business_name,
        email = NEW.email,
        city  = COALESCE(meta_city, city),
        state = COALESCE(meta_state, state),
        phone = COALESCE(meta_phone, phone),
        approved = CASE WHEN has_required_profile THEN true ELSE approved END,
        updated_at = now()
    WHERE id = existing_agency_id;
  ELSE
    SELECT COUNT(*) INTO founding_count
    FROM public.agencies
    WHERE is_founding_member = true;

    is_founding := founding_count < 25;

    -- New signups now get 30 days regardless of founding status.
    trial_days := 30;

    IF is_founding THEN
      SELECT MIN(n) INTO next_number
      FROM generate_series(1, 25) AS n
      WHERE n NOT IN (
        SELECT founding_member_number
        FROM public.agencies
        WHERE founding_member_number IS NOT NULL
      );
    ELSE
      next_number := NULL;
    END IF;

    INSERT INTO public.agencies (
      agency_name, email, owner_user_id,
      city, state, phone,
      trial_start_date, trial_end_date,
      is_founding_member, founding_member_number,
      subscription_status, approved, active,
      commission_rate_bps
    ) VALUES (
      normalized_business_name, NEW.email, NEW.id,
      meta_city, meta_state, meta_phone,
      CURRENT_DATE, CURRENT_DATE + trial_days,
      is_founding, next_number,
      'trial',
      has_required_profile,
      true,
      1000  -- 10% commission for all new agencies
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Signup setup failed because a conflicting agency record still exists for this email. Please contact support.';
END;
$function$;