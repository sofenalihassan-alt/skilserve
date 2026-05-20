# Final Submission QA Pass

A full sweep of the app to make sure every button works, no console errors appear, and the UI is polished enough for a class demo. **Excluding map integration and payment system** as requested.

## Scope

I'll go page by page, click every button, watch the console + network tab, and fix anything that breaks or looks off.

## What I'll check & fix

### 1. Functional QA (every clickable element)
- **Home (`Index`)** — Hero CTAs, service category cards, stats counters, testimonials, footer links
- **Providers** — Search, filters, sort, provider card actions (Book, Call, Message, Feedback)
- **Bookings** — Status filters, Report Issue (dispute), cancel/complete actions, invoice generator
- **Messages** — Send, conversation switching, real-time updates, unread badges
- **Profile** — Avatar upload, edit fields, address selector, delete account dialog, role switch
- **Provider Registration** — Form validation, license auto-gen, submit flow
- **Emergency** — 24/7 provider listing, direct call/message
- **Admin** — Tabs (users, providers, bookings, verification, disputes, settings), approve/reject actions
- **Auth** — Login, signup, Google OAuth, password reset, validation errors
- **Mobile** — Bottom nav, "More" drawer, notification bell, command palette (Cmd+K)
- **Header** — Theme toggle, language toggle, notification center, profile menu

### 2. Error & glitch fixes
- Catch and sanitize any unhandled Supabase errors (no raw error JSON shown to user)
- Fix any broken `navigate()` targets or 404 links
- Fix dialog focus-trap / scroll-lock issues
- Fix forms that submit without validation feedback
- Fix any console warnings (missing keys, controlled/uncontrolled inputs, missing alt text)
- Ensure all `useEffect` cleanups exist for Supabase realtime channels
- Verify RLS doesn't silently block legitimate reads (toast on empty data where appropriate)

### 3. UI polish
- Consistent loading states (skeletons everywhere, no flash-of-empty)
- Consistent empty states (illustration + helpful CTA on Bookings/Messages/Favorites when empty)
- Mobile responsiveness check at 375px, 414px, 584px (current preview), 768px, 1024px
- Touch targets ≥ 44px on mobile
- Bottom nav doesn't overlap page content (add bottom padding on pages)
- Header doesn't overlap content on scroll
- Dark mode contrast pass on all custom colored badges
- Toast messages — friendly wording, consistent variants
- Button disabled states during async actions (prevent double-submit)
- Hover/focus rings visible for keyboard users

### 4. Bilingual (EN/UR) check
- Make sure all newly added strings (verification, disputes, delete account, cookie consent) have Urdu translations
- RTL layout doesn't break the new components

### 5. Final smoke test
- Sign up new user → verify email path works
- Browse providers → book one → see booking in dashboard
- Provider side: receive booking → confirm → complete
- Leave review → appears on provider card
- Report dispute → admin sees it
- Delete account → fully cleaned up

## Out of scope (per your request)
- Map integration (Mapbox)
- Payment integration

## Deliverable
A single focused build pass. I'll report back with a checklist of what was broken and what's fixed, organized by page so you can spot-check before submitting.

## Question before I start
There's a lot of surface area here. Do you want me to:
- **(A) Just fix bugs & broken buttons** — fastest, safest, ~1 build cycle
- **(B) Bugs + UI polish** — recommended, ~1-2 cycles
- **(C) Everything above including bilingual + full smoke test** — most thorough

Reply with A, B, or C and I'll start immediately.
