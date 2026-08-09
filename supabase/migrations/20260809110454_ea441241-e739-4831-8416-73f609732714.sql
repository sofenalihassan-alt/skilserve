DROP POLICY IF EXISTS "Booking parties can create disputes" ON public.disputes;
CREATE POLICY "Booking parties can create disputes"
ON public.disputes FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = raised_by AND
  EXISTS (
    SELECT 1 FROM public.bookings b
    LEFT JOIN public.service_providers sp ON sp.id = b.provider_id
    WHERE b.id = disputes.booking_id
      AND (
        (b.user_id = auth.uid() AND disputes.against_user_id = sp.user_id) OR
        (sp.user_id = auth.uid() AND disputes.against_user_id = b.user_id)
      )
  )
);

REVOKE SELECT ON public.service_providers FROM anon, authenticated;
GRANT SELECT (id, user_id, business_name, category, specialization, hourly_rate, bio,
  years_experience, insurance_verified, is_active, created_at, updated_at,
  availability_24_7, is_approved, verification_status)
ON public.service_providers TO anon, authenticated;

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, full_name, avatar_url, city, state FROM public.profiles;
GRANT SELECT ON public.public_profiles TO authenticated;

REVOKE EXECUTE ON FUNCTION public.award_points(uuid, integer, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_license_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_booking_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.qualify_referral_on_booking() FROM PUBLIC, anon, authenticated;