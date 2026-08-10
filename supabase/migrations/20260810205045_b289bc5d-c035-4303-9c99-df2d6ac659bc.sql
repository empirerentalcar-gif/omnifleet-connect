ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_booking_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_booking_status_check CHECK (booking_status = ANY (ARRAY['pending_agency'::text, 'approved'::text, 'declined'::text, 'completed'::text, 'canceled'::text, 'cancelled_refunded'::text, 'refund_pending'::text]));

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_payment_status_check CHECK (payment_status = ANY (ARRAY['pending'::text, 'requires_capture'::text, 'authorized'::text, 'scheduled'::text, 'awaiting_payment'::text, 'captured'::text, 'canceled'::text, 'failed'::text, 'refunded'::text, 'partially_refunded'::text, 'refund_pending'::text]));

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_refund_id text,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;