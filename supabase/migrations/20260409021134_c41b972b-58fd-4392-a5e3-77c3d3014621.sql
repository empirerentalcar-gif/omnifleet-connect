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

  SELECT id INTO existing_profile_id
  FROM public.profiles
  WHERE user_id = NEW.id OR lower(contact_email) = lower(NEW.email)
  ORDER BY CASE WHEN user_id = NEW.id THEN 0 ELSE 1 END, created_at ASC
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
    VALUES (
      NEW.id,
      normalized_business_name,
      NEW.email
    )
    RETURNING id INTO existing_profile_id;
  END IF;

  SELECT id INTO existing_agency_id
  FROM public.agencies
  WHERE owner_user_id = NEW.id OR lower(email) = lower(NEW.email)
  ORDER BY CASE WHEN owner_user_id = NEW.id THEN 0 ELSE 1 END, created_at ASC
  LIMIT 1;

  IF existing_agency_id IS NOT NULL THEN
    UPDATE public.agencies
    SET owner_user_id = NEW.id,
        agency_name = normalized_business_name,
        email = NEW.email,
        updated_at = now()
    WHERE id = existing_agency_id;
  ELSE
    SELECT COUNT(*) INTO founding_count FROM public.agencies WHERE is_founding_member = true;
    is_founding := founding_count < 50;

    IF is_founding THEN
      trial_days := 60;
      next_number := founding_count + 1;
    ELSE
      trial_days := 30;
      next_number := NULL;
    END IF;

    INSERT INTO public.agencies (
      agency_name, email, owner_user_id,
      trial_start_date, trial_end_date,
      is_founding_member, founding_member_number,
      subscription_status
    ) VALUES (
      normalized_business_name,
      NEW.email,
      NEW.id,
      CURRENT_DATE,
      CURRENT_DATE + trial_days,
      is_founding,
      next_number,
      'trial'
    );
  END IF;

  RETURN NEW;
END;
$function$;