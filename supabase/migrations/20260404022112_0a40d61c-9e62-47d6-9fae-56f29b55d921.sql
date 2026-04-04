CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  pickup_date DATE NOT NULL,
  dropoff_date DATE NOT NULL,
  vehicle_type TEXT NOT NULL,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a reservation
CREATE POLICY "Anyone can submit reservations"
ON public.reservations
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Admins can view all reservations
CREATE POLICY "Admins can view all reservations"
ON public.reservations
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Agency owners can view their reservations
CREATE POLICY "Owners can view their reservations"
ON public.reservations
FOR SELECT TO authenticated
USING (agency_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));