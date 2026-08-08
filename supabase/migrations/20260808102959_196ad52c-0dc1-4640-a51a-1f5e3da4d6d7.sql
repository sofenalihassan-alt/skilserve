-- 1. Chat image attachments
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.messages ALTER COLUMN message DROP NOT NULL;

-- 2. Referral codes
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users can read referral codes" ON public.referral_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create their own referral code" ON public.referral_codes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. Referrals
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  qualified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT referrals_no_self CHECK (referrer_id <> referred_id),
  CONSTRAINT referrals_status_valid CHECK (status IN ('pending','qualified'))
);
GRANT SELECT, INSERT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see referrals they are part of" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users record their own referral" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referred_id);

-- 4. Points balance
CREATE TABLE public.user_points (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_points TO authenticated;
GRANT ALL ON public.user_points TO service_role;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own points" ON public.user_points FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 5. Point ledger
CREATE TABLE public.point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.point_transactions TO authenticated;
GRANT ALL ON public.point_transactions TO service_role;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own point history" ON public.point_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 6. Saved searches
CREATE TABLE public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_searches TO authenticated;
GRANT ALL ON public.saved_searches TO service_role;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own saved searches" ON public.saved_searches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_saved_searches_updated_at BEFORE UPDATE ON public.saved_searches FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Award points helper
CREATE OR REPLACE FUNCTION public.award_points(_user_id uuid, _amount integer, _reason text, _reference_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_points (user_id, balance, updated_at)
  VALUES (_user_id, _amount, now())
  ON CONFLICT (user_id) DO UPDATE SET balance = public.user_points.balance + _amount, updated_at = now();

  INSERT INTO public.point_transactions (user_id, amount, reason, reference_id)
  VALUES (_user_id, _amount, _reason, _reference_id);
END;
$$;

-- 8. Qualify referral on first completed booking
CREATE OR REPLACE FUNCTION public.qualify_referral_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref RECORD;
BEGIN
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    SELECT * INTO ref FROM public.referrals
      WHERE referred_id = NEW.user_id AND status = 'pending'
      FOR UPDATE;

    IF FOUND THEN
      UPDATE public.referrals SET status = 'qualified', qualified_at = now() WHERE id = ref.id;
      PERFORM public.award_points(ref.referrer_id, 100, 'referral_reward', ref.id);
      PERFORM public.award_points(ref.referred_id, 50, 'referral_welcome', ref.id);

      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (ref.referrer_id, 'system', 'Referral reward earned',
        'Someone you invited completed their first booking. You earned 100 points!', '/profile');
      INSERT INTO public.notifications (user_id, type, title, body, link)
      VALUES (ref.referred_id, 'system', 'Welcome bonus',
        'You earned 50 points for joining through a referral.', '/profile');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_qualify_referral AFTER UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.qualify_referral_on_booking();