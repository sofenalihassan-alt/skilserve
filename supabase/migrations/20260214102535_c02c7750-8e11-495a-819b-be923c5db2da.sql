
-- Add availability_24_7 column to service_providers table
ALTER TABLE public.service_providers ADD COLUMN availability_24_7 boolean NOT NULL DEFAULT false;

-- Update the public view to include the new column
DROP VIEW IF EXISTS public.public_service_providers;
CREATE VIEW public.public_service_providers AS
SELECT
  id,
  user_id,
  business_name,
  category,
  hourly_rate,
  years_experience,
  specialization,
  bio,
  is_active,
  insurance_verified,
  availability_24_7,
  created_at,
  updated_at
FROM public.service_providers;
