CREATE TABLE public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type text NOT NULL,
  target_type text,
  target_id text,
  target_label text,
  admin_user_id uuid,
  admin_email text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log (created_at DESC);
CREATE INDEX idx_admin_audit_log_action_type ON public.admin_audit_log (action_type);

GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No client insert on audit log"
ON public.admin_audit_log
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "No client update on audit log"
ON public.admin_audit_log
FOR UPDATE
TO public
USING (false);

CREATE POLICY "No client delete on audit log"
ON public.admin_audit_log
FOR DELETE
TO public
USING (false);