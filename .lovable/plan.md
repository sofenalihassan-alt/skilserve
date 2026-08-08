# Phase 4 — Rich chat, referrals, provider earnings, smarter search

Four features, built in this order so each ships working before the next starts.

## 1. Image sharing in chat

- Attach up to **3 images per message**, **5MB each**, JPG/PNG/WEBP only.
- Paperclip button in the chat composer with thumbnail previews and a remove (x) before sending.
- Images render as a grid inside the message bubble; tapping opens a full-screen lightbox with swipe between images.
- Upload progress indicator, and friendly errors for oversized or wrong-type files.
- Text is optional when images are attached (image-only messages allowed).
- Notifications for image messages read "sent you a photo".

## 2. Referral program (points, no money)

- Every user gets a unique referral code (short, shareable, e.g. `SS-4K9QX2`).
- Signup screen accepts a referral code; it can also arrive as a link (`/auth?ref=CODE`).
- A referral counts as **successful** when the referred user completes their first booking — this prevents fake-signup farming.
- Rewards in points only: **100 points** to the referrer, **50 points** to the new user on qualification.
- New "Referrals" section in Profile: your code, copy + WhatsApp share buttons, points balance, and a list of invited people with pending/qualified status.
- Points are a tracked balance only. Nothing is redeemable yet — a note in the UI says rewards are coming, so nothing looks broken.

## 3. Provider earnings dashboard

- New "Earnings" section for providers in Profile (visible only if you have a provider profile).
- Cards: total earned (completed bookings), this month, pending (confirmed but not completed), jobs done, average job value, average rating.
- Charts: earnings over the last 6 months, jobs per category, booking status mix.
- A recent completed-jobs table with client, date and amount, plus an empty state for new providers.
- Reuses the same chart library and styling as the admin analytics tab so it looks consistent.

## 4. Advanced search & filters

On the Providers page, added to the current category/price/sort controls:
- Minimum rating filter (any / 3+ / 4+ / 4.5+).
- Verified-only and 24/7-available toggles.
- Years-of-experience minimum.
- "Has portfolio" toggle.
- Active filters shown as removable chips, plus a "Clear all" button.
- **Saved searches**: name and save the current filter set, reload it in one tap, delete it. Saved per user.
- Filters reflected in the URL so a filtered search can be shared or bookmarked.
- Result count and a proper empty state that suggests loosening filters.

Everything above gets Urdu translations, RTL-correct layout, loading skeletons, empty states and a mobile pass, consistent with the Phase 3 retouch.

## Technical summary

**Database (one migration)**
- `message_attachments` (or an `attachments` jsonb column on `messages`) — image paths per message; new private-with-signed-URL storage bucket `chat-images` with RLS so only the two participants of a conversation can read.
- `referral_codes` (user_id, code unique), `referrals` (referrer_id, referred_id, status, qualified_at), `user_points` (user_id, balance) with a ledger table `point_transactions` for auditability.
- Trigger on `bookings` status → `completed` that qualifies a pending referral once and credits points (security definer, idempotent).
- `saved_searches` (user_id, name, filters jsonb).
- GRANTs + RLS on every new table; users only see their own referrals, points and saved searches.

**Frontend**
- `Messages.tsx` composer + bubble rendering; new `ChatImageUpload.tsx` and `ChatImageLightbox.tsx`.
- `ReferralCard.tsx` in Profile, referral code capture in `Auth.tsx`.
- `ProviderEarnings.tsx` using recharts, mounted in Profile for providers.
- `Providers.tsx` filter panel extended, new `SavedSearches.tsx` and filter-chip row.
- New strings added to `LanguageContext.tsx` (English + Urdu).

**Not touched:** payments, map, auth providers.

## One thing to confirm

Referral points are credited when the referred user completes their **first booking**. If you'd rather credit immediately on signup (simpler, but easier to game), tell me and I'll switch it.
