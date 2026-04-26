ALTER TABLE public.agencies
ADD COLUMN IF NOT EXISTS day40_reminder_sent boolean NOT NULL DEFAULT false;