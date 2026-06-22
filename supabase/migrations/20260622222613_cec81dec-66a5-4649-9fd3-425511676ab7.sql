CREATE OR REPLACE FUNCTION public.get_rented_vehicle_ids()
RETURNS TABLE(vehicle_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT b.vehicle_id
  FROM public.bookings b
  WHERE b.booking_status IN ('approved', 'pending_agency')
    AND b.vehicle_id IS NOT NULL
    AND b.pickup_date <= (CURRENT_DATE + 2)
    AND b.dropoff_date >= CURRENT_DATE;
$$;

GRANT EXECUTE ON FUNCTION public.get_rented_vehicle_ids() TO anon, authenticated;