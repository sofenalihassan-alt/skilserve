
Objective:
Fix three issues together:
1) Show provider profile image on both “Find Services” and “Emergency Service Finder”.
2) Repair country/state selection so it reliably opens, searches, selects, and persists.
3) Hide “Become a Provider” in top navigation for users who already have a provider account, while keeping provider profile editing access.

What I found in the current codebase:
- Provider listings (`src/pages/Providers.tsx`, `src/components/ProviderCard.tsx`) and emergency cards (`src/pages/Emergency.tsx`) render only provider table/view data and currently do not include avatar image fields.
- Provider/user profile images live in `profiles.avatar_url`.
- Current profile table RLS only allows reading your own profile, so directly querying other users’ profile rows from client code is blocked (this affects cross-user avatars/names unless data is exposed through a safe public backend shape).
- Country/state UI is custom in `src/components/CountryStateSelector.tsx` with Popover + raw inputs + country-name matching; this is likely where interaction/state sync is failing.
- Header currently always shows “Become a Provider” (`src/components/Header.tsx`) when logged in, regardless of whether the user already has a provider profile.

Implementation approach:

1) Provider avatars on Find Services + Emergency
- Backend-safe data shape:
  - Add/refresh a public provider directory view (or update existing `public_service_providers`) to include:
    - provider core fields already used
    - `avatar_url` (and optionally `full_name` if needed later)
  - Join from `service_providers.user_id -> profiles.id`.
  - Expose only non-sensitive fields in this view.
- Frontend:
  - Extend provider types used in:
    - `src/pages/Providers.tsx`
    - `src/components/ProviderCard.tsx`
    - `src/pages/Emergency.tsx`
  - Render `Avatar` with:
    - `AvatarImage src={provider.avatar_url}`
    - fallback initials from business name.
  - Keep existing business/category presentation unchanged.

2) Fix country/state selector
- Refactor `src/components/CountryStateSelector.tsx` to a more reliable controlled combobox pattern:
  - Keep parent-controlled selected values (`country`, `state`) as now.
  - Use deterministic country lookup (case-insensitive + safe fallback).
  - Reset state correctly when country changes.
  - Ensure popovers remain clickable on desktop/mobile and search inputs work reliably.
- Improve resilience:
  - Handle countries with no states cleanly.
  - Preserve selected state when still valid after country changes.
  - Remove any unused imports/fragile behavior.
- Verify integration in `src/pages/Profile.tsx`:
  - Country and state update `formData`.
  - Save persists and reloads correctly.

3) Hide “Become a Provider” for provider accounts
- In `src/components/Header.tsx`:
  - Add `isProvider` state.
  - On auth user load, query `service_providers` by `user_id`.
  - Desktop and mobile nav:
    - Show “Become a Provider” only when logged-in user is not already provider.
    - Keep existing profile dropdown entry “Edit Provider Profile” access path through `/profile` section (already present there).
- Keep behavior for non-logged users unchanged (still show route to auth/provider flow).

Files to update:
- `src/components/ProviderCard.tsx`
- `src/pages/Providers.tsx`
- `src/pages/Emergency.tsx`
- `src/components/CountryStateSelector.tsx`
- `src/pages/Profile.tsx` (only if integration adjustments are needed)
- `src/components/Header.tsx`
- New migration file in `supabase/migrations/*` for public provider view update (schema-only).

Backend/security notes:
- I will avoid exposing full profile records.
- I will expose only minimal public provider identity fields required by listing cards (avatar/name if needed) through a controlled view.
- No changes to auth flow are needed for this request.

Validation checklist after implementation:
- Find Services page:
  - Each provider card shows avatar/fallback correctly.
- Emergency page:
  - Each emergency provider card shows avatar/fallback correctly.
- Country/state:
  - Country dropdown opens and searches.
  - Selecting country updates value and enables correct state list.
  - State dropdown opens and searches.
  - Save profile persists country/state and reload reflects saved values.
- Header behavior:
  - Existing provider account: no “Become a Provider” button in desktop/mobile nav.
  - Non-provider account: button still visible.
- Mobile check:
  - Test country/state dropdown usability and provider avatar rendering on mobile layout.

Potential edge cases handled:
- Provider has no avatar → fallback initials shown.
- Country with no states/provinces → state dropdown disabled with clear text.
- Existing stored country/state not matching library exactly → safe normalization/fallback logic.

Technical section:
- Because direct cross-user `profiles` reads are restricted, avatar delivery should come from a purpose-built public provider view rather than ad-hoc client queries.
- Header provider detection will use lightweight `maybeSingle()` provider existence check.
- Country/state selector will be stabilized with controlled state and safer match logic to remove current interaction fragility.
