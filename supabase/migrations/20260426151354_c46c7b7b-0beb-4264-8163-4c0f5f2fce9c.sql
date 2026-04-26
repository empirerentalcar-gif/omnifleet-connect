ALTER TABLE public.agencies
ADD COLUMN IF NOT EXISTS day50_reminder_sent boolean NOT NULL DEFAULT false;