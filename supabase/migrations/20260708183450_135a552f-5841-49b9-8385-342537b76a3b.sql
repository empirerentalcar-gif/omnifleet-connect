
DO $$
BEGIN
  PERFORM set_config('role', 'service_role', true);

  UPDATE public.agencies SET founding_member_number = 15, updated_at = now()
  WHERE id = 'fbfd9558-0d69-4e37-98c8-09ea58b0604b' AND founding_member_number = 4;

  UPDATE public.agencies
  SET is_founding_member = false,
      founding_member_number = NULL,
      updated_at = now()
  WHERE id IN (
    'b0eb4f22-a710-4b7f-9082-50fc5dc7705d',
    'e95a5015-ac8a-4f4a-b288-4e719e3d802f'
  );
END $$;

RESET role;

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

    IF is_founding THEN
      trial_days := 60;
      SELECT MIN(n) INTO next_number
      FROM generate_series(1, 25) AS n
      WHERE n NOT IN (
        SELECT founding_member_number
        FROM public.agencies
        WHERE founding_member_number IS NOT NULL
      );
    ELSE
      trial_days := 30;
      next_number := NULL;
    END IF;

    INSERT INTO public.agencies (
      agency_name, email, owner_user_id,
      city, state, phone,
      trial_start_date, trial_end_date,
      is_founding_member, founding_member_number,
      subscription_status, approved, active
    ) VALUES (
      normalized_business_name, NEW.email, NEW.id,
      meta_city, meta_state, meta_phone,
      CURRENT_DATE, CURRENT_DATE + trial_days,
      is_founding, next_number,
      'trial',
      has_required_profile,
      true
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Signup setup failed because a conflicting agency record still exists for this email. Please contact support.';
END;
$function$;
