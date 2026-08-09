-- client_reviews
DROP POLICY IF EXISTS "Authenticated users can read client reviews" ON public.client_reviews;
CREATE POLICY "Involved parties can read client reviews"
ON public.client_reviews FOR SELECT TO authenticated
USING (
  auth.uid() = client_id
  OR EXISTS (
    SELECT 1 FROM public.service_providers sp
    WHERE sp.id = client_reviews.provider_id AND sp.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.service_providers sp2 ON sp2.id = b.provider_id
    WHERE sp2.user_id = auth.uid() AND b.user_id = client_reviews.client_id
  )
);

-- platform_settings
DROP POLICY IF EXISTS "Authenticated can read settings" ON public.platform_settings;
CREATE POLICY "Public settings readable, others admin only"
ON public.platform_settings FOR SELECT TO authenticated
USING (
  key IN ('contact_phone', 'contact_email', 'support_hours', 'terms_version')
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- referral_codes
DROP POLICY IF EXISTS "Signed-in users can read referral codes" ON public.referral_codes;
CREATE POLICY "Users read their own referral code"
ON public.referral_codes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

ALTER TABLE public.referrals ALTER COLUMN referrer_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.resolve_referral_referrer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT user_id INTO owner_id
  FROM public.referral_codes
  WHERE code = upper(trim(NEW.code));

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;

  NEW.referrer_id := owner_id;
  NEW.code := upper(trim(NEW.code));
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.resolve_referral_referrer() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS resolve_referral_referrer_trg ON public.referrals;
CREATE TRIGGER resolve_referral_referrer_trg
BEFORE INSERT ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.resolve_referral_referrer();