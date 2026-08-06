# Phase 3 completion + full polish pass

Phase 3 already shipped two-way reviews (providers rating customers) and the Admin Analytics tab. What's left is automated booking reminders, plus a full retouch of everything built in Phases 2 and 3.

## 1. Automated booking reminders

Reminders go out **24 hours before** and again **1 hour before** each confirmed booking, delivered as an in-app notification (bell icon) and a web push.

- New backend job runs every 15 minutes and looks for confirmed bookings entering either window.
- Each booking gets at most one 24h reminder and one 1h reminder — tracked so nothing is sent twice.
- Both the customer and the provider get notified.
- Notification text is short and useful: service, time, and who it's with. Tapping it opens Bookings.

### Real push delivery

The current push function only logs the payload — it never actually sends anything to the browser. It will be rewritten to do real Web Push (VAPID-signed), so message notifications and the new reminders both actually reach the device. The VAPID key is already configured.

## 2. Full retouch pass

**Bug sweep across Phase 2/3 surfaces**
- Provider detail page, favorites, packages manager, portfolio manager/gallery, package selection inside booking, client review dialog and rating badge.
- Every button verified to do something: no dead handlers, no silent failures. Errors surface as friendly toasts instead of raw backend messages.
- Loading skeletons and empty states everywhere data is fetched (favorites with none saved, provider with no portfolio/packages/reviews, analytics with no data).
- Guard against missing/deleted providers on `/provider/:id` — proper "not found" state instead of a blank page.

**Urdu + RTL coverage**
- All new Phase 2/3 strings routed through the language context with Urdu translations.
- RTL check on the new screens: icon direction, alignment, star rows, dialog footers, gallery strip.

**Mobile responsiveness re-check**
- Every page re-checked at phone width: bottom-nav clearance, no horizontal scroll, tap targets, dialogs and lightbox fitting the screen, provider detail tabs scrollable rather than wrapping.
- Admin analytics charts made readable on small screens.

**Consistency**
- Uniform card radius, spacing and badge styling between older and newer components.
- Consistent date/time and currency formatting across bookings, packages and analytics.

## Technical summary

- Migration: add reminder tracking columns to `bookings` (the existing `reminder_sent_at` covers one window only; a second marker is needed for the two-stage schedule), enable `pg_cron` + `pg_net`, and schedule the job.
- New edge function `send-booking-reminders`: scans due bookings with the service role, inserts rows into `notifications`, calls push, and stamps the reminder markers.
- Rewrite `supabase/functions/send-push-notification/index.ts` to perform real VAPID Web Push and accept a generic `{ user_id, title, body, url }` payload so both messages and reminders use it.
- Frontend edits confined to presentation: `ProviderDetail.tsx`, `FavoritesView.tsx`, `PackagesManager/List`, `PortfolioManager/Gallery`, `BookingDialog.tsx`, `ClientReviewDialog.tsx`, `ClientRatingBadge.tsx`, `admin/AdminAnalytics.tsx`, plus Urdu strings in `LanguageContext.tsx`.
- No changes to auth, payments, or map.

## Open question

Reminders only fire for bookings with status **confirmed** (not pending or cancelled). If you'd rather also remind on pending bookings, say so and I'll widen it.
