

# Mobile UI Optimization Plan

## 1. Bottom Navigation Bar (Mobile Only)
**New file:** `src/components/BottomNav.tsx`

Create a fixed bottom navigation bar visible only on mobile (`md:hidden`). Four tabs: Home (`/`), Map (`/providers?view=map`), Bookings (`/bookings`), Profile (`/profile`). Uses `useLocation` to highlight the active tab. Includes unread message badge on Profile if needed. Height ~64px with safe-area padding for notched phones (`pb-safe`).

**Edit:** `src/components/Header.tsx` -- Hide the mobile hamburger menu section and the entire mobile nav dropdown on `md:hidden` since the bottom nav replaces it. Keep the top header simplified on mobile (logo + search icon + theme toggle only).

**Edit:** `src/pages/Providers.tsx`, `src/pages/Index.tsx`, `src/pages/Bookings.tsx`, `src/pages/Profile.tsx` -- Add `pb-20` bottom padding so content doesn't hide behind the fixed bottom nav on mobile.

## 2. Pull-to-Refresh on Provider List
**Edit:** `src/pages/Providers.tsx`

Implement a touch-based pull-to-refresh using pointer events:
- Track `touchstart` / `touchmove` / `touchend` on the provider list container
- When pulled down >60px at scroll top, show a spinning refresh indicator and call `fetchProviders()` + `fetchReviewStats()`
- Animate the indicator with framer-motion (rotate + fade)
- Only active on mobile (check `useIsMobile`)

## 3. Swipe-Up Drawer for Map Pin Details
**Edit:** `src/components/ProvidersMap.tsx`

Replace the Mapbox popup with a swipe-up drawer (using existing `vaul` Drawer component):
- When a map marker is clicked, set a `selectedProvider` state instead of showing a popup
- Open a `<Drawer>` from the bottom with the provider's details: avatar, name, category, rate, specialization, and action buttons (Call, Message, Book)
- The drawer uses snap points (`[0.35, 0.7]`) so users can swipe up for more detail or swipe down to dismiss
- This mirrors the Google Maps / Uber pattern

## Summary of Files
- **Create:** `src/components/BottomNav.tsx`
- **Edit:** `src/components/Header.tsx`, `src/pages/Providers.tsx`, `src/pages/Index.tsx`, `src/pages/Bookings.tsx`, `src/pages/Profile.tsx`, `src/components/ProvidersMap.tsx`
- No database changes

