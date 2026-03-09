-- Create or replace the handle_new_user function to also create an agency record
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, business_name, contact_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    NEW.email
  );
  
  -- Create agency record with owner_user_id auto-linked
  INSERT INTO public.agencies (agency_name, email, owner_user_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    NEW.email,
    NEW.id
  );
  
  RETURN NEW;
END;
$function$;