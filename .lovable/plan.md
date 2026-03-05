

# Implementation Plan

## 1. Bento-Style Provider Cards
Redesign `ProviderCard.tsx` with a modern bento grid layout:
- Larger card with rounded-2xl corners, subtle gradient border on hover
- Top section: Avatar + name + category with inline high-contrast pill badges for "5km Away", "Verified", "24/7"
- Badges use bold bg colors: `bg-emerald-500/10 text-emerald-600` for Verified, `bg-orange-500/10 text-orange-600` for 24/7, `bg-blue-500/10 text-blue-600` for distance
- Simulated distance badge (random 2-8km since no real geolocation data exists)
- Bottom row: price prominently displayed, action buttons with consistent Lucide icons at `strokeWidth={1.5}`
- All Lucide icons across the card standardized to `strokeWidth={1.5}` for premium feel

**File:** `src/components/ProviderCard.tsx`

## 2. Live Activity Toast
Create a new `LiveActivityToast.tsx` component:
- Array of simulated activities: categories, cities (Bhakkar, Lahore, Islamabad, Karachi, etc.), time labels ("2 mins ago", "10 mins ago")
- Randomly picks one every 8-12 seconds using `setInterval`
- Renders as a small animated toast in the bottom-left corner using framer-motion (slide in, stay 4s, slide out)
- Subtle design: small avatar dot + text like "Plumber booked in Bhakkar 10 mins ago"
- Mount it in `Providers.tsx` page

**Files:** New `src/components/LiveActivityToast.tsx`, edit `src/pages/Providers.tsx`

## 3. Provider Grid Layout Change
Update `Providers.tsx` grid from single-column list (`grid gap-6`) to a responsive bento grid (`grid grid-cols-1 md:grid-cols-2 gap-5`) so cards tile nicely in a 2-column layout on desktop.

**File:** `src/pages/Providers.tsx`

## 4. Consistent Icon Stroke Weight
All Lucide icons in ProviderCard and Providers page will use `strokeWidth={1.5}` for a premium, consistent look. Icons used: `Star`, `MapPin`, `Clock`, `Briefcase`, `Phone`, `MessageSquareText`, `ThumbsUp`, `ShieldCheck`, `Navigation`.

---

**Summary of files:**
- Edit: `src/components/ProviderCard.tsx`, `src/pages/Providers.tsx`
- Create: `src/components/LiveActivityToast.tsx`
- No database changes needed

