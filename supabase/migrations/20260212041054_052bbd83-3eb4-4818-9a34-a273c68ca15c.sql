
-- Create reservation_requests table
CREATE TABLE public.reservation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id),
  agency_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  pickup_date DATE NOT NULL,
  dropoff_date DATE NOT NULL,
  vehicle_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'vehicle_ready', 'extension_approved', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservation_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a reservation request (public booking form)
CREATE POLICY "Anyone can submit reservation requests"
ON public.reservation_requests
FOR INSERT
WITH CHECK (true);

-- Agency owners can view requests for their agency
CREATE POLICY "Owners can view their reservation requests"
ON public.reservation_requests
FOR SELECT
USING (
  profile_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

-- Agency owners can update their reservation requests (approve/decline)
CREATE POLICY "Owners can update their reservation requests"
ON public.reservation_requests
FOR UPDATE
USING (
  profile_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

-- Add cash_accepted and owner_story columns to profiles for search/agency detail
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cash_accepted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS owner_story TEXT,
ADD COLUMN IF NOT EXISTS deposit_info TEXT,
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT DEFAULT 'All cancellations must be made by calling the agency directly.',
ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT ARRAY['Valid driver''s license (21+ years old)', 'Proof of insurance', 'Credit/debit card or cash deposit'],
ADD COLUMN IF NOT EXISTS photos TEXT[];

-- Create trigger for updated_at
CREATE TRIGGER update_reservation_requests_updated_at
BEFORE UPDATE ON public.reservation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add profile_id to available_vehicles_public view so we can group by agency
DROP VIEW IF EXISTS public.available_vehicles_public;
CREATE VIEW public.available_vehicles_public AS
SELECT
  v.id,
  v.make,
  v.model,
  v.year,
  v.vehicle_type,
  v.daily_rate,
  v.description,
  v.features,
  v.fuel_type,
  v.transmission,
  v.seats,
  v.images,
  v.location_city,
  v.location_state,
  v.profile_id
FROM public.vehicles v
WHERE v.status = 'available'::vehicle_status;
