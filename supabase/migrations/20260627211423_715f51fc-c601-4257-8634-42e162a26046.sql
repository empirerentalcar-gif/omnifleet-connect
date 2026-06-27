
CREATE OR REPLACE FUNCTION public.prevent_owner_sensitive_agency_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role bypasses (edge functions). Admins bypass too.
  IF current_setting('role', true) = 'service_role'
     OR auth.role() = 'service_role'
     OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'::app_role)) THEN
    RETURN NEW;
  END IF;

  -- Block sensitive column changes for everyone else (i.e. owners via client).
  IF NEW.stripe_connect_account_id IS DISTINCT FROM OLD.stripe_connect_account_id
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
     OR NEW.stripe_charges_enabled IS DISTINCT FROM OLD.stripe_charges_enabled
     OR NEW.stripe_payouts_enabled IS DISTINCT FROM OLD.stripe_payouts_enabled
     OR NEW.stripe_connect_status IS DISTINCT FROM OLD.stripe_connect_status
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.approved IS DISTINCT FROM OLD.approved
     OR NEW.active IS DISTINCT FROM OLD.active
     OR NEW.is_founding_member IS DISTINCT FROM OLD.is_founding_member
     OR NEW.founding_member_number IS DISTINCT FROM OLD.founding_member_number
     OR NEW.grace_period_end IS DISTINCT FROM OLD.grace_period_end
     OR NEW.trial_start_date IS DISTINCT FROM OLD.trial_start_date
     OR NEW.trial_end_date IS DISTINCT FROM OLD.trial_end_date
     OR NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id
     OR NEW.tos_version_2026_06 IS DISTINCT FROM OLD.tos_version_2026_06
  THEN
    RAISE EXCEPTION 'You are not allowed to modify protected agency fields. Please contact support if you need a change to billing, approval, or Stripe settings.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_owner_sensitive_agency_updates ON public.agencies;
CREATE TRIGGER trg_prevent_owner_sensitive_agency_updates
BEFORE UPDATE ON public.agencies
FOR EACH ROW
EXECUTE FUNCTION public.prevent_owner_sensitive_agency_updates();
