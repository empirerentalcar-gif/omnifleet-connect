ALTER TABLE public.agencies
ADD COLUMN IF NOT EXISTS day60_notice_sent boolean NOT NULL DEFAULT false;