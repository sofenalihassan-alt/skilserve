

# Fix Terms Dialog + Provider Availability + Invoice Generation + Email Notifications

## 1. Fix Terms Acceptance Dialog Button Visibility
The "Accept & Continue" button exists in the code but is likely being cut off on smaller viewports because the DialogContent doesn't scroll its own content.

**Fix:** Wrap the dialog body (scroll area + checkbox + button) in a flex column with overflow-y-auto and max-height so the button is always visible. Add padding-bottom to ensure the button isn't hidden.

**File:** `src/components/TermsAcceptanceDialog.tsx`

## 2. Provider Availability Calendar

### Database
- Add `provider_availability` table with columns: `id`, `provider_id`, `day_of_week` (0-6), `start_time` (time), `end_time` (time), `is_available` (boolean), `specific_date` (date, nullable for one-off overrides)
- RLS: providers can CRUD their own rows, anyone can SELECT

### New Files
- `src/components/AvailabilityCalendar.tsx` -- A weekly calendar grid where providers set their available slots (e.g., Mon 9AM-5PM). Shown on the provider's profile/settings page.
- `src/components/ProviderAvailabilityView.tsx` -- Read-only view shown on provider cards or booking dialog so users see when the provider is free.

### Edits
- `src/pages/Profile.tsx` -- Add availability management section for users who are providers
- `src/components/BookingDialog.tsx` -- Show provider's available slots when picking date/time, disable unavailable times

## 3. Invoice/Receipt PDF Generation

### New Files
- `src/components/InvoiceGenerator.tsx` -- Component that generates a downloadable PDF receipt for completed bookings using browser-side PDF generation (jsPDF or html2canvas). Includes: booking ID, date, provider name, service description, duration, amount, status, both party details.

### Edits
- `src/pages/Bookings.tsx` -- Add "Download Receipt" button on completed bookings that triggers the PDF generation

## 4. Email Notifications

This requires setting up the email infrastructure. Steps:
1. Check if an email domain is configured
2. Set up email infrastructure
3. Scaffold transactional email templates for:
   - **Booking confirmation** -- sent to user when booking is created
   - **Booking status update** -- sent to user/provider when status changes
   - **New message notification** -- sent when a new message is received
   - **Provider approved/rejected** -- sent when admin approves/rejects provider
4. Wire up triggers in the relevant UI code

### Templates to create
- `booking-confirmation.tsx`
- `booking-status-update.tsx`
- `new-message-alert.tsx`
- `provider-approval.tsx`

### Edits
- `src/components/BookingDialog.tsx` -- invoke email after booking creation
- `src/pages/Bookings.tsx` -- invoke email on status change actions
- `src/pages/Admin.tsx` -- invoke email when approving/rejecting providers

## Technical Details
- **Availability table** uses day_of_week (0=Sun..6=Sat) for recurring weekly slots, with optional `specific_date` for date-specific overrides
- **PDF generation** uses jsPDF library (client-side, no server needed)
- **Email** uses Lovable's built-in email infrastructure with `send-transactional-email` Edge Function

## Files Summary
- **Create:** `src/components/AvailabilityCalendar.tsx`, `src/components/ProviderAvailabilityView.tsx`, `src/components/InvoiceGenerator.tsx`
- **Edit:** `src/components/TermsAcceptanceDialog.tsx`, `src/pages/Profile.tsx`, `src/components/BookingDialog.tsx`, `src/pages/Bookings.tsx`, `src/pages/Admin.tsx`
- **Migrations:** `provider_availability` table + RLS
- **Email:** Domain check, infrastructure setup, 4 transactional templates, trigger wiring

