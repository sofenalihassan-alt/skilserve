

# Implementation Plan

I will complete tasks 2, 3, and 4 fully. Task 1 (Admin Dashboard) is too large for the remaining credits and will be listed as not done.

## Task 2: Make Hero Section Smaller
- Reduce `h1` font sizes from `text-3xl sm:text-4xl md:text-6xl` to `text-2xl sm:text-3xl md:text-4xl`
- Reduce padding from `py-12 sm:py-20` to `py-8 sm:py-14`
- Make subtitle text slightly smaller
- Keep search bar and layout unchanged

**File:** `src/components/Hero.tsx`

## Task 3: Make Testimonials Dynamic from Database
- Create a `testimonials` table in the database with columns: `id`, `name`, `role`, `quote`, `rating`, `created_at`
- Seed it with the 5 existing hardcoded testimonials
- Add RLS policy allowing anyone to read testimonials
- Update `src/components/Testimonials.tsx` to fetch from the database instead of using hardcoded data, with the hardcoded list as fallback
- Show total review count in the section subtitle (e.g., "Trusted by X+ customers")
- This way you can add real testimonials over time and the count grows naturally

**Files:** New migration, `src/components/Testimonials.tsx`

## Task 4: Provider Reviews on Find Services Page + Feedback
- Fetch average rating and review count per provider from the `reviews` table
- Show star rating and review count on each `ProviderCard`
- Add a "Leave Feedback" button/dialog on each provider card that opens a simple star rating + comment form
- The feedback form submits to the `reviews` table (requires a completed booking per existing RLS)
- Add a general "Website Feedback" floating button on the Providers page that opens a simple form (stored in a new `website_feedback` table)
- Add sorting by rating using actual review averages

**Files:** `src/components/ProviderCard.tsx`, `src/pages/Providers.tsx`, new migration for `website_feedback` table, new `src/components/FeedbackDialog.tsx`

## What Will NOT Be Done
**Task 1: Admin Dashboard** -- This is a major feature requiring multiple new pages (users list, providers list, bookings management, content moderation), admin role setup, protected routes, and significant UI work. It needs its own dedicated credit to build properly. I recommend tackling it as a standalone task.

## Technical Details

**Database changes:**
1. New `testimonials` table with public SELECT RLS policy
2. Insert 5 seed testimonials
3. New `website_feedback` table with authenticated INSERT policy and public SELECT

**Component changes:**
- `Hero.tsx`: Smaller font sizes and padding
- `Testimonials.tsx`: Fetch from DB, show count, fallback to hardcoded
- `ProviderCard.tsx`: Add rating stars, review count, feedback button
- `Providers.tsx`: Pass review data, add website feedback button
- New `FeedbackDialog.tsx`: Reusable feedback form component

