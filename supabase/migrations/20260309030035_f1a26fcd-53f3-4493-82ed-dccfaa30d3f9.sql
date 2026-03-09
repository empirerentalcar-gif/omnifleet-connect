
-- Create enum for agency subscription status
CREATE TYPE public.agency_subscription_status AS ENUM ('trial', 'active', 'expired', 'cancelled');

-- Add trial columns to agencies table
ALTER TABLE public.agencies
  ADD COLUMN trial_start_date date,
  ADD COLUMN trial_end_date date,
  ADD COLUMN is_founding_member boolean NOT NULL DEFAULT false,
  ADD COLUMN subscription_status public.agency_subscription_status NOT NULL DEFAULT 'trial';

-- Set existing approved agencies to 'active' (pre-trial system)
UPDATE public.agencies SET subscription_status = 'active' WHERE approved = true;

-- Update handle_new_user to auto-set trial fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  founding_count integer;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, business_name, contact_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    NEW.email
  );
  
  -- Count current founding members
  SELECT COUNT(*) INTO founding_count FROM public.agencies WHERE is_founding_member = true;
  
  -- Create agency record with trial fields
  INSERT INTO public.agencies (agency_name, email, owner_user_id, trial_start_date, trial_end_date, is_founding_member, subscription_status)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    NEW.email,
    NEW.id,
    CURRENT_DATE,
    CURRENT_DATE + 60,
    founding_count < 50,
    'trial'::agency_subscription_status
  );
  
  RETURN NEW;
END;
$$;

-- Update profile_has_approved_agency to hide expired trial vehicles
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
      AND a.subscription_status != 'expired'::agency_subscription_status
  );
$$;
