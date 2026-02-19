
-- Create a function that calls the notify-new-agency edge function via pg_net
-- We'll use a simpler approach: a database webhook trigger that the app can call
-- Instead, let's create a trigger function that uses pg_net to call the edge function

CREATE OR REPLACE FUNCTION public.notify_new_agency_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  payload jsonb;
BEGIN
  -- Build the payload
  payload := jsonb_build_object(
    'agency', jsonb_build_object(
      'id', NEW.id,
      'agency_name', NEW.agency_name,
      'city', NEW.city,
      'state', NEW.state,
      'phone', NEW.phone,
      'email', NEW.email,
      'created_at', NEW.created_at
    )
  );

  -- Call the edge function via pg_net
  PERFORM net.http_post(
    url := 'https://mtrzzdrobjjxppunqtaa.supabase.co/functions/v1/notify-new-agency',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cnp6ZHJvYmpqeHBwdW5xdGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzkzMDcsImV4cCI6MjA4NjAxNTMwN30.bRKI5IKSJbwJtfWjSVeDygrz0bihPXiwa4EpvBfdHWM'
    ),
    body := payload
  );

  RETURN NEW;
END;
$$;

-- Create the trigger on agencies table
CREATE TRIGGER on_new_agency_signup
AFTER INSERT ON public.agencies
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_agency_signup();
