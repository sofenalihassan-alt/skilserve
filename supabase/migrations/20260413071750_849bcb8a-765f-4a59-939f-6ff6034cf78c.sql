
-- 1. Add is_approved column
ALTER TABLE public.service_providers ADD COLUMN is_approved boolean NOT NULL DEFAULT false;
UPDATE public.service_providers SET is_approved = true WHERE is_active = true;

-- Update SELECT policy
DROP POLICY IF EXISTS "Anyone can view active providers" ON public.service_providers;
CREATE POLICY "Anyone can view approved active providers"
ON public.service_providers FOR SELECT
USING (
  (is_active = true AND is_approved = true)
  OR public.has_role(auth.uid(), 'admin')
  OR auth.uid() = user_id
);

-- 2. Admin RLS policies
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any provider" ON public.service_providers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any booking" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete feedback" ON public.website_feedback FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 3. Seed admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'alihassan39se@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Recreate view with correct column order + is_approved
DROP VIEW IF EXISTS public.public_service_providers;
CREATE VIEW public.public_service_providers AS
SELECT
  sp.id,
  sp.user_id,
  sp.business_name,
  sp.category,
  sp.hourly_rate,
  sp.years_experience,
  sp.is_active,
  sp.insurance_verified,
  sp.availability_24_7,
  sp.specialization,
  sp.bio,
  sp.created_at,
  sp.updated_at,
  p.avatar_url,
  sp.is_approved
FROM service_providers sp
LEFT JOIN profiles p ON sp.user_id = p.id;
