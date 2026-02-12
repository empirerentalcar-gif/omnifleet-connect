
-- Add a validation trigger for reservation_requests to enforce format constraints server-side
CREATE OR REPLACE FUNCTION public.validate_reservation_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate email format if provided
  IF NEW.customer_email IS NOT NULL AND NEW.customer_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Validate phone contains only digits, spaces, dashes, parens, plus
  IF NEW.customer_phone !~ '^[0-9()\-\+\s\.]+$' THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;

  -- Validate pickup_date is not in the past (allow today)
  IF NEW.pickup_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Pickup date cannot be in the past';
  END IF;

  -- Validate dropoff_date is after pickup_date
  IF NEW.dropoff_date <= NEW.pickup_date THEN
    RAISE EXCEPTION 'Drop-off date must be after pickup date';
  END IF;

  -- Validate vehicle_type is one of the allowed values
  IF NEW.vehicle_type NOT IN ('Compact', 'Sedan', 'SUV', 'Truck', 'Van', 'Luxury') THEN
    RAISE EXCEPTION 'Invalid vehicle type';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_reservation_before_insert
BEFORE INSERT ON public.reservation_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_reservation_request();
