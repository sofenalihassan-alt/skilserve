-- 1. Prevent providers self-approving / self-verifying
CREATE OR REPLACE FUNCTION public.enforce_provider_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_approved := false;
    NEW.verification_status := 'unverified';
    NEW.insurance_verified := false;
  ELSE
    NEW.is_approved := OLD.is_approved;
    NEW.verification_status := OLD.verification_status;
    NEW.insurance_verified := OLD.insurance_verified;
    NEW.user_id := OLD.user_id;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_provider_admin_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_provider_admin_fields_trg ON public.service_providers;
CREATE TRIGGER enforce_provider_admin_fields_trg
BEFORE INSERT OR UPDATE ON public.service_providers
FOR EACH ROW EXECUTE FUNCTION public.enforce_provider_admin_fields();

-- 2. Server-side booking price + status transition enforcement
CREATE OR REPLACE FUNCTION public.enforce_booking_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rate numeric;
  prov_user uuid;
  is_admin boolean := public.has_role(auth.uid(), 'admin');
BEGIN
  SELECT sp.hourly_rate, sp.user_id INTO rate, prov_user
  FROM public.service_providers sp WHERE sp.id = NEW.provider_id;

  IF TG_OP = 'INSERT' THEN
    IF NEW.estimated_duration IS NULL OR NEW.estimated_duration < 1 OR NEW.estimated_duration > 24 THEN
      RAISE EXCEPTION 'Invalid estimated duration';
    END IF;
    NEW.total_amount := COALESCE(rate, 0) * NEW.estimated_duration;
    NEW.status := 'pending';
    RETURN NEW;
  END IF;

  IF is_admin THEN
    RETURN NEW;
  END IF;

  -- Billing fields are immutable after creation
  NEW.total_amount := OLD.total_amount;
  NEW.estimated_duration := OLD.estimated_duration;
  NEW.user_id := OLD.user_id;
  NEW.provider_id := OLD.provider_id;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF auth.uid() = OLD.user_id THEN
      -- Customers may only cancel a booking that has not started
      IF NOT (NEW.status = 'cancelled' AND OLD.status IN ('pending', 'confirmed')) THEN
        RAISE EXCEPTION 'Not allowed to change booking status';
      END IF;
    ELSIF auth.uid() = prov_user THEN
      IF NOT (
        (OLD.status = 'pending' AND NEW.status IN ('confirmed', 'cancelled'))
        OR (OLD.status = 'confirmed' AND NEW.status IN ('in_progress', 'completed', 'cancelled'))
        OR (OLD.status = 'in_progress' AND NEW.status IN ('completed', 'cancelled'))
      ) THEN
        RAISE EXCEPTION 'Invalid booking status transition';
      END IF;
    ELSE
      RAISE EXCEPTION 'Not allowed to update this booking';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_booking_rules() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_booking_rules_trg ON public.bookings;
CREATE TRIGGER enforce_booking_rules_trg
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_rules();