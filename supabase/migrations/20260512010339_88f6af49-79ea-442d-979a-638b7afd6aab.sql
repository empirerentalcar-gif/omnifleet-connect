REVOKE ALL ON FUNCTION public.handle_email_confirmed_auto_approve() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_email_confirmed_auto_approve() FROM anon;
REVOKE ALL ON FUNCTION public.handle_email_confirmed_auto_approve() FROM authenticated;