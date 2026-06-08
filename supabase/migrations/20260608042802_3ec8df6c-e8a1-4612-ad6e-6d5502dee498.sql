-- Fix fees_banner_dismissed default to NULL for three-state logic
ALTER TABLE public.vehicles
  ALTER COLUMN fees_banner_dismissed DROP NOT NULL,
  ALTER COLUMN fees_banner_dismissed SET DEFAULT NULL;

-- Also update any existing false values to NULL so they behave as "unseen"
UPDATE public.vehicles SET fees_banner_dismissed = NULL WHERE fees_banner_dismissed = false;