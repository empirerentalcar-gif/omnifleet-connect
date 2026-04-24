ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS last_payout_status text,
  ADD COLUMN IF NOT EXISTS last_payout_amount_cents integer,
  ADD COLUMN IF NOT EXISTS last_payout_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_payout_failure_message text;