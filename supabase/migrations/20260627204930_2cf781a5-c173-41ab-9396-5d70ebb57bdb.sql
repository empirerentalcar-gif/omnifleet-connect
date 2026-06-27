ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS tos_version_2026_06 boolean NOT NULL DEFAULT false;

-- Existing rows already got false via the default. New rows from now on should default to true.
ALTER TABLE public.agencies
  ALTER COLUMN tos_version_2026_06 SET DEFAULT true;