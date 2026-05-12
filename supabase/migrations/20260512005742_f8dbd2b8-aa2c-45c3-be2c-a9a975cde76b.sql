-- Function: auto-approve owner's agency on email confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmed_auto_approve()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only act when email_confirmed_at transitions from NULL to a value
  IF NEW.email_confirmed_at IS NOT NULL
     AND OLD.email_confirmed_at IS NULL THEN

    UPDATE public.agencies
    SET approved = true,
        updated_at = now()
    WHERE owner_user_id = NEW.id
      AND approved = false;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if re-running
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed_auto_approve ON auth.users;

-- Trigger on auth.users update for email confirmation
CREATE TRIGGER on_auth_user_email_confirmed_auto_approve
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
EXECUTE FUNCTION public.handle_email_confirmed_auto_approve();