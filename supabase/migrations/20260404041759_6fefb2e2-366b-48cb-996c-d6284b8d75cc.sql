
-- Drop the dangerous INSERT policy that lets users create subscriptions with any status/tier
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;

-- Drop the dangerous UPDATE policy that lets users modify subscription status/tier
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
