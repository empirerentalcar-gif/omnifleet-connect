CREATE TABLE IF NOT EXISTS public.booking_alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  channel text NOT NULL DEFAULT 'sms',
  sent_at timestamptz NOT NULL DEFAULT now(),
  detail text,
  UNIQUE (booking_id, alert_type, channel)
);

GRANT ALL ON public.booking_alert_log TO service_role;

ALTER TABLE public.booking_alert_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view booking alert log"
ON public.booking_alert_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_booking_alert_log_booking ON public.booking_alert_log(booking_id);