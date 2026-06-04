# Phase 2 — Engagement & Discovery

Building on Phase 1 (verification, disputes, account deletion). Phase 2 focuses on features that make users come back and help them find the right provider faster.

## What's included

### 1. Favorites / Saved Providers
- New `favorites` table (user_id, provider_id, created_at) with RLS
- Heart icon on every `ProviderCard` — tap to save/unsave (optimistic UI)
- New **Favorites** tab in Profile showing all saved providers as cards
- Empty state with "Browse Providers" CTA

### 2. Service Packages (fixed-price bundles)
- New `service_packages` table (provider_id, title, description, price, duration_minutes, is_active)
- Providers manage packages from a new **Packages** section in Profile (when in provider mode): add / edit / delete / toggle active
- `ProviderCard` shows a "View Packages" expand if any active packages exist
- `BookingDialog` gets a new "Select package" dropdown (optional) that auto-fills price + duration

### 3. Portfolio Gallery
- New `portfolio_items` table (provider_id, image_url, caption, sort_order)
- New public storage bucket `portfolio` with RLS (provider can write own, anyone can read)
- Providers upload up to 12 photos from Profile → Portfolio section
- New compact gallery strip on ProviderCard (3 thumbnails + "+N more") opens a lightbox dialog

### 4. Provider Detail Page (new route)
- New route `/provider/:id` — full profile view consolidating: bio, badges, reviews list, packages, portfolio, availability calendar, book/call/message buttons
- ProviderCard becomes clickable → navigates to detail page (action buttons keep working via stopPropagation)
- Bilingual EN/UR support, mobile responsive

## What's deferred (was originally listed for Phase 2)

- **Service radius/location filter** — depends on map integration, which you asked me to skip. Will revisit when maps are in scope.

## Technical Summary

**New tables:** `favorites`, `service_packages`, `portfolio_items` (all with RLS — owner write, public read where appropriate)
**New storage bucket:** `portfolio` (public read, owner write)
**New files:**
- `src/pages/ProviderDetail.tsx` (new route)
- `src/components/FavoriteButton.tsx`
- `src/components/PackagesManager.tsx` (provider-side CRUD)
- `src/components/PortfolioManager.tsx` (provider-side upload)
- `src/components/PortfolioGallery.tsx` (public view + lightbox)
- `src/components/PackagesList.tsx` (public view)

**Edits:**
- `src/components/ProviderCard.tsx` — add heart, portfolio strip, click-through
- `src/pages/Profile.tsx` — add Favorites / Packages / Portfolio tabs
- `src/pages/Bookings.tsx` (via BookingDialog) — package selector
- `src/App.tsx` — register `/provider/:id` route
- `src/contexts/LanguageContext.tsx` — Urdu strings for new UI

**Safety:** No changes to auth, payments, or map. All new components are additive — existing flows continue to work unchanged. RLS audited before migration runs.

## Build order (so nothing breaks mid-way)

1. Migration: create all 3 tables + bucket + policies (one shot)
2. Favorites (smallest, validates the table + UI pattern)
3. Packages (manager + public list + booking integration)
4. Portfolio (upload + gallery + lightbox)
5. ProviderDetail page (ties everything together)
6. Bilingual strings + final mobile pass

Reply **approve** and I'll start with the migration.
