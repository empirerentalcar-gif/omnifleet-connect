CREATE TABLE public.agency_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  agreement_text TEXT NOT NULL,
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.agency_agreements TO authenticated;
GRANT ALL ON public.agency_agreements TO service_role;

ALTER TABLE public.agency_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all agreements"
  ON public.agency_agreements FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view their own agreements"
  ON public.agency_agreements FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.agencies a
    WHERE a.id = agency_agreements.agency_id
      AND a.owner_user_id = auth.uid()
  ));

CREATE INDEX idx_agency_agreements_agency_id ON public.agency_agreements(agency_id);
CREATE INDEX idx_agency_agreements_agreed_at ON public.agency_agreements(agreed_at DESC);