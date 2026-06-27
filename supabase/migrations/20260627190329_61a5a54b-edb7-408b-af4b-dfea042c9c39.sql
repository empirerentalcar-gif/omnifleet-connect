
-- 1) Disputes table
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_dispute_id TEXT NOT NULL UNIQUE,
  stripe_charge_id TEXT,
  stripe_payment_intent_id TEXT,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  reason TEXT,
  outcome TEXT,
  funds_withdrawn BOOLEAN NOT NULL DEFAULT false,
  funds_withdrawn_at TIMESTAMPTZ,
  funds_reinstated_at TIMESTAMPTZ,
  evidence_due_by TIMESTAMPTZ,
  raw JSONB,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_disputes_booking_id ON public.disputes(booking_id);
CREATE INDEX idx_disputes_agency_id ON public.disputes(agency_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);

GRANT SELECT ON public.disputes TO authenticated;
GRANT ALL ON public.disputes TO service_role;

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Agency owners can view their disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (
    agency_id IN (
      SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()
    )
  );

CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Booking dispute flags
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS disputed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dispute_status TEXT;
