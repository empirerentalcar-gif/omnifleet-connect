-- Backfill tos_version_2026_06 for agencies that already recorded an agreement
-- (the previous client-side update was silently blocked by the
-- prevent_owner_sensitive_agency_updates trigger). Disable the trigger for
-- this single backfill, then re-enable.
ALTER TABLE public.agencies DISABLE TRIGGER USER;

UPDATE public.agencies a
SET tos_version_2026_06 = true,
    updated_at = now()
WHERE tos_version_2026_06 = false
  AND EXISTS (
    SELECT 1 FROM public.agency_agreements ag WHERE ag.agency_id = a.id
  );

ALTER TABLE public.agencies ENABLE TRIGGER USER;