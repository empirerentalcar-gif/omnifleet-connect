
-- Create agency_notes table for admin comments on agencies
CREATE TABLE public.agency_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL,
  admin_email text NOT NULL,
  note_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agency_notes ENABLE ROW LEVEL SECURITY;

-- Only admins can view notes
CREATE POLICY "Admins can view agency notes"
ON public.agency_notes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert notes
CREATE POLICY "Admins can insert agency notes"
ON public.agency_notes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND admin_user_id = auth.uid());

-- No update or delete for audit trail
CREATE POLICY "No update on agency notes"
ON public.agency_notes
FOR UPDATE
USING (false);

CREATE POLICY "No delete on agency notes"
ON public.agency_notes
FOR DELETE
USING (false);

-- Index for fast lookups by agency
CREATE INDEX idx_agency_notes_agency_id ON public.agency_notes(agency_id);
