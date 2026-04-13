

# Admin Panel Implementation

## Overview
Build a complete admin panel at `/admin` with role-based access. Your email (`alihassan39se@gmail.com`) will be hardcoded as the initial admin. The panel will be hidden from all normal users and providers.

## Database Changes

### 1. Migration: Add `is_approved` to `service_providers`
Add a boolean column `is_approved` (default `false`) so new providers require admin approval before appearing. Update the RLS SELECT policy to only show approved+active providers to non-admins.

### 2. Migration: Add admin RLS policies
- Allow admins to SELECT all rows on `profiles`, `service_providers`, `bookings`, `user_roles`, `messages`, `reviews`, `website_feedback`, `testimonials`
- Allow admins to UPDATE `service_providers` (for approval/suspension)
- Allow admins to UPDATE `bookings` (for dispute resolution)
- Allow admins to INSERT/UPDATE/DELETE `testimonials`
- Allow admins to INSERT `user_roles` (to grant/revoke roles)
- Allow admins to DELETE `user_roles`
- All policies use `public.has_role(auth.uid(), 'admin')`

### 3. Seed admin role
Insert admin role for your account: find user by email in `auth.users`, insert into `user_roles` with role `'admin'`.

## New Files

### `src/hooks/useAdmin.tsx`
A hook that checks `has_role(auth.uid(), 'admin')` via RPC and caches the result. Returns `{ isAdmin, loading }`.

### `src/pages/Admin.tsx`
Main admin page with tab-based layout:

**Dashboard tab:**
- Stats cards: total users, providers, bookings, revenue (completed bookings sum)
- Counts by booking status
- Recent activity feed

**Users tab:**
- Table of all profiles with search/filter
- View user details, booking history
- Ban/suspend capability (set a flag or delete)

**Providers tab:**
- Table of all providers with approval status filter
- Approve/Reject buttons for pending providers (sets `is_approved`)
- Suspend/reactivate (sets `is_active`)
- View provider details, ratings, booking count

**Bookings tab:**
- Table of all bookings with status filter
- View booking details, cancel/refund actions
- Dispute resolution

**Content tab:**
- Manage testimonials (add/edit/delete)
- View website feedback with ratings
- Manage service categories display

**Settings tab:**
- Change admin email/password (via `supabase.auth.updateUser`)
- Platform settings (stored in a new `platform_settings` table or localStorage for now)

### `src/components/AdminRoute.tsx`
A route guard that checks admin role and redirects non-admins to `/`.

## Edited Files

### `src/App.tsx`
- Add `/admin` route wrapped in `AdminRoute`

### `src/components/Header.tsx`
- Show "Admin" link only when `useAdmin().isAdmin` is true

### `src/pages/ProviderRegistration.tsx`
- After provider registration, set `is_approved = false` and show message "Your registration is pending admin approval"

### `src/pages/Providers.tsx`
- Filter query to only show `is_approved = true` providers

## Security
- All admin queries go through RLS policies using `has_role()` security definer function
- No client-side role checks for data access -- all enforced at DB level
- Admin route guard is UX only; real security is in RLS

## Files Summary
- **Create:** `src/hooks/useAdmin.tsx`, `src/pages/Admin.tsx`, `src/components/AdminRoute.tsx`
- **Edit:** `src/App.tsx`, `src/components/Header.tsx`, `src/pages/ProviderRegistration.tsx`, `src/pages/Providers.tsx`
- **Migrations:** Add `is_approved` column, admin RLS policies, seed admin role

