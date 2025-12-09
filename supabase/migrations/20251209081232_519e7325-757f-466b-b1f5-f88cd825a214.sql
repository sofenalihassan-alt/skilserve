-- Drop and recreate the view with SECURITY INVOKER (default, but being explicit)
DROP VIEW IF EXISTS public.public_service_providers;

CREATE VIEW public.public_service_providers 
WITH (security_invoker = true)
AS 
SELECT 
  id, 
  user_id, 
  business_name, 
  category, 
  hourly_rate, 
  bio, 
  years_experience, 
  specialization, 
  is_active, 
  insurance_verified, 
  created_at, 
  updated_at
FROM public.service_providers
WHERE is_active = true;

-- Grant access to the view for authenticated and anon users
GRANT SELECT ON public.public_service_providers TO authenticated, anon;