REVOKE ALL ON FUNCTION public.award_points(uuid, integer, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.qualify_referral_on_booking() FROM PUBLIC, anon, authenticated;