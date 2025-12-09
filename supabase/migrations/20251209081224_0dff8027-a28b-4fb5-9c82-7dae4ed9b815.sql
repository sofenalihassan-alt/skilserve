-- Fix 1: Add INSERT policy for profiles table
-- This provides a fallback if the handle_new_user trigger fails
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Fix 2: Create a secure view for public service provider data
-- This view excludes the sensitive license_number field
CREATE VIEW public.public_service_providers AS 
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