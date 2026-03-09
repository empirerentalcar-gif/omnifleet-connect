
-- Convert subscription_status from enum to text for flexibility
ALTER TABLE public.agencies 
  ALTER COLUMN subscription_status DROP DEFAULT,
  ALTER COLUMN subscription_status TYPE text USING subscription_status::text,
  ALTER COLUMN subscription_status SET DEFAULT 'trial';

-- Add founding_member_number column
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS founding_member_number integer;

-- Set founding_member_number for existing founding members
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM public.agencies
  WHERE is_founding_member = true
)
UPDATE public.agencies a
SET founding_member_number = n.rn
FROM numbered n
WHERE a.id = n.id;
