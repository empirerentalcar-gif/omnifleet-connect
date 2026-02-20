-- Remove the trigger that fires on agency insert (eliminates hardcoded anon key)
DROP TRIGGER IF EXISTS on_new_agency_signup ON public.agencies;

-- Drop the trigger function that contained the hardcoded key
DROP FUNCTION IF EXISTS public.notify_new_agency_signup();
