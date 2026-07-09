CREATE OR REPLACE FUNCTION public.validate_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Date sanity is a create-time rule. On UPDATE we let agencies decline/approve
  -- bookings even after the pickup window (past-date bookings must still be
  -- resolvable), and we only re-check dates when they are actually being changed.
  IF TG_OP = 'INSERT' THEN
    IF NEW.pickup_date < CURRENT_DATE THEN
      RAISE EXCEPTION 'Pickup date cannot be in the past';
    END IF;
    IF NEW.dropoff_date <= NEW.pickup_date THEN
      RAISE EXCEPTION 'Drop-off date must be after pickup date';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF (NEW.pickup_date IS DISTINCT FROM OLD.pickup_date
        OR NEW.dropoff_date IS DISTINCT FROM OLD.dropoff_date)
       AND NEW.dropoff_date <= NEW.pickup_date THEN
      RAISE EXCEPTION 'Drop-off date must be after pickup date';
    END IF;
  END IF;

  IF NEW.rental_days < 1 THEN
    RAISE EXCEPTION 'Rental days must be >= 1';
  END IF;
  IF NEW.total_amount_cents < 100 THEN
    RAISE EXCEPTION 'Total amount must be at least $1.00';
  END IF;
  IF NEW.platform_fee_cents < 0 OR NEW.platform_fee_cents > NEW.total_amount_cents THEN
    RAISE EXCEPTION 'Invalid platform fee';
  END IF;
  IF NEW.renter_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid renter email';
  END IF;
  IF NEW.renter_phone !~ '^[0-9()\-\+\s\.]+$' THEN
    RAISE EXCEPTION 'Invalid renter phone';
  END IF;
  RETURN NEW;
END;
$function$;