DROP VIEW IF EXISTS public.public_service_providers;

CREATE VIEW public.public_service_providers
WITH (security_invoker = true)
AS
SELECT
  sp.id,
  sp.user_id,
  sp.business_name,
  sp.category,
  sp.specialization,
  sp.bio,
  sp.hourly_rate,
  sp.years_experience,
  sp.is_active,
  sp.insurance_verified,
  sp.availability_24_7,
  sp.is_approved,
  sp.verification_status,
  sp.created_at,
  sp.updated_at,
  p.avatar_url
FROM public.service_providers sp
LEFT JOIN public.profiles p ON p.id = sp.user_id
WHERE sp.is_active = true AND sp.is_approved = true;

GRANT SELECT ON public.public_service_providers TO anon, authenticated;
