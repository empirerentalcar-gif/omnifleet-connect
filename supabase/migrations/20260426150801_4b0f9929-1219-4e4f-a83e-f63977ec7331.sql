CREATE OR REPLACE FUNCTION public.profile_has_approved_agency(_profile_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.agencies a ON a.owner_user_id = p.user_id
    WHERE p.id = _profile_id
      AND a.approved = true
      AND a.active = true
      -- Stripe Connect is required only for non-trial agencies
      AND (a.subscription_status = 'trial' OR a.stripe_charges_enabled = true)
      -- Soft-block expired / payment_required agencies (unless within grace period)
      AND (
        a.subscription_status NOT IN ('expired', 'payment_required')
        OR (a.grace_period_end IS NOT NULL AND a.grace_period_end >= CURRENT_DATE)
      )
  );
$function$;