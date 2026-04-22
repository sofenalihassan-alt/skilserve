

# Roadmap to Make Skill Serve a Top-Tier Public Platform

You already have the basics (auth, roles, bookings, messaging, notifications, terms, invoices, availability, admin, SEO, error boundary, emails, Google sign-in). Here's what's actually missing for a **trustworthy, sticky, real-world marketplace**.

---

## Tier 1 — Trust & Safety (do these BEFORE going public)

### 1. Provider Verification with Document Upload
Right now `is_approved` is just a boolean an admin flips. There's no proof. Add:
- CNIC (ID card) front/back upload
- Selfie holding ID
- Optional skill certificate / license document
- Storage bucket `verification-docs` (private, admin-only read)
- Admin sees documents inline before approving
- Provider gets a "Verified ✓" gold badge once complete

### 2. Two-Way Review System + Moderation
Currently only users review providers. Add:
- Providers rate users (no-shows, payment, behavior) → builds user reputation score
- Review responses (provider can publicly reply to a review)
- Report/flag button on reviews; admin moderation queue
- Auto-hide reviews flagged 3+ times pending review

### 3. Dispute Resolution System
For a marketplace, this is non-negotiable.
- New table `disputes` (booking_id, raised_by, reason, evidence_urls, status, resolution)
- "Report Issue" button on completed/in-progress bookings
- Admin dispute panel with full booking + chat history visible
- Resolution states: pending → investigating → resolved/refund-recommended

### 4. Block / Report User & Provider
- `blocked_users` table — blocked users can't message or book each other
- Report button on every profile with reason categories (fraud, abuse, fake, etc.)
- Admin queue for reports

---

## Tier 2 — Engagement & Retention

### 5. Favorites / Saved Providers
- `favorites` table (user_id, provider_id)
- Heart icon on every provider card
- "Saved" tab in profile so users can quickly rebook trusted providers

### 6. Booking History Insights for Users
- "Rebook" button on past completed bookings (one-click, prefilled)
- Spending summary on profile (`Rs X spent on Y services this month`)

### 7. Provider Portfolio Gallery
- Providers upload up to 10 photos of past work (e.g., a carpenter's projects)
- Storage bucket `portfolios`, lightbox viewer on provider card
- Massively increases booking conversion

### 8. Service Packages / Fixed-Price Offerings
Right now everything is hourly. Add:
- `provider_services` table: predefined packages (e.g., "AC Service - Rs 1500 fixed")
- Users book a package directly, no hourly negotiation
- Most users prefer fixed prices over hourly estimates

### 9. Referral Program
- Each user gets a unique referral code
- Tracks signups + first-booking conversions
- Future: discount credit (when payments are added)

---

## Tier 3 — Operations & Quality

### 10. Provider Earnings Dashboard
- Dedicated page for providers showing: bookings this month, revenue, completion rate, response time, rating trend
- Charts (Recharts) for visual trend
- Helps providers improve, gives them reason to stay active

### 11. Booking Reminders (Push + Email)
- Auto-notification 24 hours and 1 hour before scheduled booking
- Edge function with pg_cron schedule
- Reduces no-shows dramatically

### 12. Cancellation Policy & Tracking
- Track cancellation reason (required field when cancelling)
- Auto-calculate cancellation rate per user/provider
- Show on profile (e.g., "95% reliability")
- Admin can suspend users with high cancellation rates

### 13. Service Area Radius for Providers
- Providers set their service radius (e.g., 10km from their location)
- Users only see providers who actually serve their area
- Big quality-of-life improvement on the map

---

## Tier 4 — Polish & Compliance

### 14. Account Deletion (GDPR / legal requirement)
- "Delete my account" button in profile
- Edge function: anonymize bookings/messages, delete profile, revoke roles
- Required for app store / public launch in many regions

### 15. Cookie Consent Banner
- One-time banner on first visit, choice stored in localStorage
- Required for EU visitors and Pakistan's PDPB compliance
- Links to Privacy Policy

### 16. Sitemap.xml + robots.txt Optimization
- Generate sitemap of all public routes
- Helps Google index faster

### 17. Multi-Image in Messages
Currently text-only chat. Add image attachments — users want to send photos of broken pipes, damaged items, etc., to providers.

---

## Recommended Build Order

If you want to launch fast and iterate:

**Phase 1 (Pre-launch, must-have):** Provider verification with documents (#1), Dispute system (#3), Account deletion (#14), Cookie consent (#15)

**Phase 2 (Week 2-3, growth):** Favorites (#5), Service packages (#8), Provider portfolio (#7), Service radius (#13)

**Phase 3 (Month 2, polish):** Two-way reviews (#2), Earnings dashboard (#10), Booking reminders (#11), Image messages (#17)

**Phase 4 (later):** Referral program (#9), Cancellation tracking (#12), Block/report (#4), Insights (#6)

---

## My Recommendation

Start with **Phase 1** in one focused build cycle. These four items make your platform legally launch-ready and trustworthy. Everything else is value-add that you can ship iteratively after real users start coming in (their feedback will tell you what they want most).

**Reply with the phase or specific item numbers you want to build first**, and I'll create a detailed implementation plan for that batch.

