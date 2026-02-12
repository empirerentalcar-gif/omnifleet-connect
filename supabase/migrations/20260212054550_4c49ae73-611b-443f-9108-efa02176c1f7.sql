
-- Add length constraints to reservation_requests text fields
ALTER TABLE public.reservation_requests
  ADD CONSTRAINT customer_name_length CHECK (char_length(customer_name) <= 100 AND char_length(customer_name) > 0),
  ADD CONSTRAINT customer_phone_length CHECK (char_length(customer_phone) <= 20 AND char_length(customer_phone) > 0),
  ADD CONSTRAINT customer_email_length CHECK (customer_email IS NULL OR (char_length(customer_email) <= 100 AND char_length(customer_email) > 0)),
  ADD CONSTRAINT agency_name_length CHECK (char_length(agency_name) <= 200 AND char_length(agency_name) > 0),
  ADD CONSTRAINT vehicle_type_length CHECK (char_length(vehicle_type) <= 50 AND char_length(vehicle_type) > 0),
  ADD CONSTRAINT notes_length CHECK (notes IS NULL OR char_length(notes) <= 1000);
