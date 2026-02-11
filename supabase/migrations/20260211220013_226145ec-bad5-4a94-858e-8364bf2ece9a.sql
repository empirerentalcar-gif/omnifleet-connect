
-- 1. Drop the vulnerable access_codes UPDATE policy (access_code_update_bypass)
DROP POLICY IF EXISTS "Users can mark codes as used during registration" ON public.access_codes;

-- 2. Create a public view for vehicles that excludes sensitive metadata (vehicles_public_select)
CREATE VIEW public.available_vehicles_public
WITH (security_invoker = on) AS
SELECT id, make, model, year, vehicle_type, daily_rate,
       description, features, images, seats, transmission,
       fuel_type, location_city, location_state
FROM public.vehicles
WHERE status = 'available';

-- 3. Add a trigger to auto-create profile on user signup (signup_incomplete)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, business_name, contact_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
