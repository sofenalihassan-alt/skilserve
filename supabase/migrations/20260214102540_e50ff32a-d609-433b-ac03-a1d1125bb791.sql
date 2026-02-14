
-- Fix: Make the view use SECURITY INVOKER (default) explicitly
ALTER VIEW public.public_service_providers SET (security_invoker = on);
