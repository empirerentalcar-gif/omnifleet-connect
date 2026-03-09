
-- Update handle_new_user for hybrid trial (60d founding, 30d standard)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  founding_count integer;
  next_number integer;
  is_founding boolean;
  trial_days integer;
BEGIN
  INSERT INTO public.profiles (user_id, business_name, contact_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    NEW.email
  );
  
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
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    NEW.email,
    NEW.id,
    CURRENT_DATE,
    CURRENT_DATE + trial_days,
    is_founding,
    next_number,
    'trial'
  );
  
  RETURN NEW;
END;
$$;

-- Update profile_has_approved_agency to hide payment_required and expired
CREATE OR REPLACE FUNCTION public.profile_has_approved_agency(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.agencies a ON a.owner_user_id = p.user_id
    WHERE p.id = _profile_id
      AND a.approved = true
      AND a.active = true
      AND a.subscription_status NOT IN ('expired', 'payment_required')
  );
$$;
