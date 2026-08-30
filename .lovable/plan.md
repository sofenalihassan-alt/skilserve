# What's blocking a public launch

Four concrete problems, found by inspecting the app's routing, published URL, build log and environment. Everything else (auth, security, reminders, SEO components) is in place.

## 1. Nobody can see your site without signing up

Every meaningful page is wrapped in a login gate: the homepage `/`, `/providers`, `/emergency`, `/provider/:id` and `/provider-registration`. A first-time visitor (or Google's crawler) lands on the sign-in screen and never sees the product.

Fix: make the marketing/browse surface public and keep only personal data behind login.

- Public: `/`, `/providers`, `/provider/:id`, `/emergency`, `/contact`, `/terms`, `/privacy`
- Stays protected: `/bookings`, `/messages`, `/profile`, `/provider-registration`, `/admin`
- Actions that need an account (book, message, favorite, register as provider) redirect to `/auth` at click time, then return the user to the page they came from.

## 2. Every SEO URL points at the wrong domain

Your published site is `https://skilserve.lovable.app`, but the sitemap, robots.txt, canonical tags, Open Graph URLs and JSON-LD all say `https://skillserveweb.lovable.app`. Google will treat your real site as a duplicate of a domain that isn't yours.

Fix: replace that base URL in `index.html`, `src/components/Seo.tsx`, `scripts/generate-sitemap.ts`, `public/robots.txt` and `public/sitemap.xml`.

## 3. The map is dead in production

`ProvidersMap` reads `VITE_MAPBOX_PUBLIC_TOKEN`, and that variable is not set in this project, so the map renders empty for real users.

Fix: either add the Mapbox public token as a project variable, or hide the map section cleanly (with a friendly "map unavailable" state) instead of showing a blank box. Your call — no code guesswork either way.

## 4. Backend functions fail type checking

The build log shows 6 TypeScript errors in `supabase/functions/_shared/webpush.ts` and `supabase/functions/mcp/index.ts` (byte-array typing on the WebCrypto calls, an untyped `ctx` parameter, and a possibly-undefined `SUPABASE_URL`). The frontend builds fine, but these make push notifications and the agent endpoint fragile to redeploy.

Fix: type the crypto buffers correctly, type `ctx`, and guard the env lookups.

## Order of work

1. Open up the public routes (biggest impact, biggest change)
2. Correct the domain everywhere
3. Clean up the edge-function type errors
4. Decide on the map token

## Technical notes

- Route change lives in `src/App.tsx`; add a small `useRequireAuth()` helper that pushes `/auth?next=<path>` so gated actions stay smooth.
- `Auth.tsx` reads `next` and navigates there after a successful sign-in instead of always going to `/`.
- Public pages must tolerate `user === null` — audit `Index`, `Providers`, `ProviderDetail`, `Emergency` for unguarded `user.id` reads.
- Data is already safe for anonymous reads via the `public_service_providers` / `public_profiles` views; confirm those RLS policies grant `anon` select before flipping routes public.
- After the domain fix, regenerate `public/sitemap.xml` through the existing `predev`/`prebuild` script rather than editing it by hand.
