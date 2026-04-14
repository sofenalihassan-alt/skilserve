

# Notification Center, Legal Pages, Contact/Support Page

## Overview
Three major features in one pass: (1) In-app notification center for booking/message/review activity, (2) Terms of Service and Privacy Policy pages with mandatory user acceptance tracking, (3) Contact Us / Support page with admin-editable contact info.

## Database Changes

### Migration 1: Create `notifications` table
```sql
CREATE TYPE notification_type AS ENUM ('booking_update', 'new_message', 'review_received', 'provider_approved', 'provider_rejected', 'system');

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type notification_type NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- Users see own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);
-- System/admin can insert
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
-- Admins see all
CREATE POLICY "Admins can view all notifications" ON notifications FOR SELECT USING (has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### Migration 2: Create `terms_acceptance` table
```sql
CREATE TABLE terms_acceptance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  terms_version text NOT NULL DEFAULT '1.0',
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  UNIQUE(user_id, terms_version)
);

ALTER TABLE terms_acceptance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own acceptance" ON terms_acceptance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own acceptance" ON terms_acceptance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all" ON terms_acceptance FOR SELECT USING (has_role(auth.uid(), 'admin'));
```

### Migration 3: Create `platform_settings` table
```sql
CREATE TABLE platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON platform_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert settings" ON platform_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Seed default contact info
INSERT INTO platform_settings (key, value) VALUES
  ('contact_phone', '03024942710'),
  ('contact_email', 'alihassan39se@gmail.com'),
  ('support_hours', 'Mon-Sat 9AM-6PM PKT'),
  ('terms_version', '1.0');
```

### Migration 4: Trigger to auto-create notifications on booking status changes
```sql
CREATE OR REPLACE FUNCTION notify_booking_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify customer
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (NEW.user_id, 'booking_update',
      'Booking ' || NEW.status,
      'Your booking has been ' || NEW.status || '.',
      '/bookings');
    -- Notify provider
    INSERT INTO notifications (user_id, type, title, body, link)
    SELECT sp.user_id, 'booking_update',
      'Booking ' || NEW.status,
      'A booking has been ' || NEW.status || '.',
      '/bookings'
    FROM service_providers sp WHERE sp.id = NEW.provider_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_notification
AFTER UPDATE ON bookings FOR EACH ROW
EXECUTE FUNCTION notify_booking_update();
```

### Migration 5: Trigger for new message notifications
```sql
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (NEW.receiver_id, 'new_message', 'New Message',
    'You have a new message.', '/messages');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_message_notification
AFTER INSERT ON messages FOR EACH ROW
EXECUTE FUNCTION notify_new_message();
```

## New Files

### `src/components/NotificationCenter.tsx`
- Bell icon button in the Header with unread count badge
- Dropdown/popover showing recent notifications grouped by type
- "Mark all read" and individual mark-read on click
- Real-time subscription to `notifications` table for live updates
- Click notification navigates to its `link` field
- "Clear all" button

### `src/pages/TermsOfService.tsx`
- Comprehensive Terms of Service page covering: user eligibility, account responsibilities, service provider obligations, booking & payment terms, dispute resolution, limitation of liability, termination, governing law (Pakistan), intellectual property, prohibited conduct
- Professional layout with numbered sections and table of contents
- Version display from `platform_settings`

### `src/pages/PrivacyPolicy.tsx`
- Full privacy policy: data collection, usage, sharing, cookies, security measures, user rights, data retention, third-party services, children's privacy, contact for privacy concerns
- GDPR/local compliance language
- Last updated date from terms_version

### `src/pages/Contact.tsx`
- Contact info pulled from `platform_settings` table (phone, email, support hours) so admin can change anytime
- Contact form: name, email, subject, message -- submits to `website_feedback` table
- FAQ section with common questions (accordion)
- Office hours display
- WhatsApp quick link using the contact phone

### `src/components/TermsAcceptanceDialog.tsx`
- Modal shown to authenticated users who haven't accepted current terms version
- Checks `terms_acceptance` table for current version
- User must scroll through and check "I agree" before proceeding
- Records acceptance with timestamp in `terms_acceptance` table
- Blocks app usage until accepted (shown as a modal overlay)

## Edited Files

### `src/App.tsx`
- Add routes: `/terms`, `/privacy`, `/contact` (public, no ProtectedRoute)
- Add `<TermsAcceptanceDialog />` inside AuthProvider for logged-in users

### `src/components/Header.tsx`
- Add `<NotificationCenter />` bell icon next to messages button (desktop)
- Show notification bell on mobile top bar too

### `src/components/Footer.tsx`
- Update Terms/Privacy links to point to `/terms` and `/privacy`
- Add "Contact Us" link to `/contact`

### `src/pages/Admin.tsx` (Settings tab)
- Add "Contact Settings" section to edit contact_phone, contact_email, support_hours from `platform_settings`
- Add "Terms Version" field -- bumping version forces all users to re-accept

## Summary
- **Create:** `NotificationCenter.tsx`, `TermsAcceptanceDialog.tsx`, `TermsOfService.tsx`, `PrivacyPolicy.tsx`, `Contact.tsx`
- **Edit:** `App.tsx`, `Header.tsx`, `Footer.tsx`, `Admin.tsx`
- **Migrations:** 5 migrations (notifications table, terms_acceptance table, platform_settings table, booking notification trigger, message notification trigger)

