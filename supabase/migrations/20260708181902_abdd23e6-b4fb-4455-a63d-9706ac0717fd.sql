
-- Auto-approve pending agencies from the old flow
UPDATE public.agencies SET approved = true, updated_at = now() WHERE approved = false;

-- Rewrite handle_new_user: approve at creation, change founding cap 50 -> 25
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
BEGIN
  normalized_business_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'business_name'), ''), 'My Business');

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
        approved = true,
        updated_at = now()
    WHERE id = existing_agency_id;
  ELSE
    SELECT COUNT(*) INTO founding_count
    FROM public.agencies
    WHERE is_founding_member = true;

    is_founding := founding_count < 25;

    IF is_founding THEN
      trial_days := 60;
      -- Lowest unused founding number 1..25 (reclaims freed slots)
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
      agency_name,
      email,
      owner_user_id,
      trial_start_date,
      trial_end_date,
      is_founding_member,
      founding_member_number,
      subscription_status,
      approved,
      active
    ) VALUES (
      normalized_business_name,
      NEW.email,
      NEW.id,
      CURRENT_DATE,
      CURRENT_DATE + trial_days,
      is_founding,
      next_number,
      'trial',
      true,
      true
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Signup setup failed because a conflicting agency record still exists for this email. Please contact support.';
END;
$function$;
