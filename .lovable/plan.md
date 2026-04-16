

# SEO Polish, Error Boundary, and Google Sign-In Check

## Status Check

| Feature | Status |
|---------|--------|
| SEO Meta Tags | 90% done — needs minor fixes |
| Error Boundary | Not implemented |
| Google Sign-In | Already working |

## What needs to be done

### 1. SEO Meta Tag Polish (`index.html`)
- Change OG image to an absolute URL (`https://skillserveweb.lovable.app/favicon.png`) — relative paths don't work for social crawlers
- Add `twitter:title` and `twitter:description` tags (currently missing)
- Add `meta name="keywords"` for search engines
- Add `meta name="robots" content="index, follow"`
- Add structured data (JSON-LD) for LocalBusiness schema to help Google rich results

### 2. Error Boundary (new file + edit `main.tsx`)
- Create `src/components/ErrorBoundary.tsx` — a React class component that catches render errors
- Shows a friendly "Something went wrong" page with a "Reload" button instead of a blank screen
- Wrap `<App />` in `main.tsx` with the ErrorBoundary

### 3. Google Sign-In — Already Done
Google OAuth is already implemented using the managed Lovable Cloud solution (`lovable.auth.signInWithOAuth`). The "Sign in with Google" button is present on both login and signup tabs. No changes needed.

## Files Summary
- **Edit:** `index.html`, `src/main.tsx`
- **Create:** `src/components/ErrorBoundary.tsx`

