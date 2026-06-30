
CREATE TABLE public.sensitive_update_failures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID,
  field_name TEXT NOT NULL,
  source TEXT NOT NULL,
  expected_value TEXT,
  actual_value TEXT,
  error_message TEXT,
  user_id UUID,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sensitive_update_failures TO authenticated;
GRANT ALL ON public.sensitive_update_failures TO service_role;

ALTER TABLE public.sensitive_update_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sensitive update failures"
  ON public.sensitive_update_failures
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_sensitive_update_failures_created_at
  ON public.sensitive_update_failures (created_at DESC);
CREATE INDEX idx_sensitive_update_failures_agency
  ON public.sensitive_update_failures (agency_id);
