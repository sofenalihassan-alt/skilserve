
-- 1. Fix: platform_settings readable only by authenticated users
DROP POLICY IF EXISTS "Anyone can read settings" ON public.platform_settings;
CREATE POLICY "Authenticated can read settings" ON public.platform_settings
  FOR SELECT TO authenticated USING (true);

-- 2. Fix: website_feedback only visible to submitter and admins
DROP POLICY IF EXISTS "Anyone can view feedback" ON public.website_feedback;
CREATE POLICY "Users can view own feedback" ON public.website_feedback
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all feedback" ON public.website_feedback
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix: notifications INSERT only by authenticated users (triggers bypass RLS via SECURITY DEFINER)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert own notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
