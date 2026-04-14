
-- Create notification type enum
CREATE TYPE public.notification_type AS ENUM ('booking_update', 'new_message', 'review_received', 'provider_approved', 'provider_rejected', 'system');

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all notifications" ON public.notifications FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create terms_acceptance table
CREATE TABLE public.terms_acceptance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  terms_version text NOT NULL DEFAULT '1.0',
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  UNIQUE(user_id, terms_version)
);

ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own acceptance" ON public.terms_acceptance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own acceptance" ON public.terms_acceptance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all acceptances" ON public.terms_acceptance FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create platform_settings table
CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.platform_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert settings" ON public.platform_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.platform_settings (key, value) VALUES
  ('contact_phone', '03024942710'),
  ('contact_email', 'alihassan39se@gmail.com'),
  ('support_hours', 'Mon-Sat 9AM-6PM PKT'),
  ('terms_version', '1.0');

-- Trigger: auto-notify on booking status change
CREATE OR REPLACE FUNCTION public.notify_booking_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (NEW.user_id, 'booking_update',
      'Booking ' || NEW.status,
      'Your booking has been ' || NEW.status || '.',
      '/bookings');
    INSERT INTO public.notifications (user_id, type, title, body, link)
    SELECT sp.user_id, 'booking_update',
      'Booking ' || NEW.status,
      'A booking has been ' || NEW.status || '.',
      '/bookings'
    FROM public.service_providers sp WHERE sp.id = NEW.provider_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_notification
AFTER UPDATE ON public.bookings FOR EACH ROW
EXECUTE FUNCTION public.notify_booking_update();

-- Trigger: auto-notify on new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (NEW.receiver_id, 'new_message', 'New Message',
    'You have a new message.', '/messages');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_message_notification
AFTER INSERT ON public.messages FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();
