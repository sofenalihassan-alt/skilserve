# Health check and fixes

## What I found

- The app itself builds and runs. The logs show no crashes or failed requests in your last preview session.
- **One backend error is left**: the AI-agent connection (MCP) fails its type check. That's 2 errors in a generated file, and they come from how the helper in `src/lib/mcp/tools/search-providers.ts` is written.
- **One security issue is still open**: provider license numbers can be read straight from the providers table.
- **The map** still has no Mapbox token, so it shows a "map not configured" card.
- The new public pages have not had a full check while signed out.

## Fixes

1. **Fix the agent connection errors.** Rewrite the helper so it accepts a `{ token }` object with defaults and checks the environment values, so the bundled output passes type checking. Update the 3 tools that call it.
2. **Close the license-number leak.** Only the provider who owns a row and admins can read the full providers table. Everyone else goes through the existing safe public view. Then mark the security finding as fixed.
3. **Click-through test.** Use a real browser on desktop and mobile, both signed out and signed in. Visit Home, Providers, Provider detail, Emergency, Contact, Terms, Privacy and Auth. Click every visible button (book, message, favorite, call, filters, language switch, theme, bottom nav, More drawer). Fix every broken button, console error or layout glitch I find.
4. **Re-run the security scan and check the build log** to confirm it's clean.

## Suggestions (not included unless you ask)

- Add a Mapbox public token so the real map appears.
- Show a "provider is offline / reply time" hint in chat.
- Add a guided first-run tour for new users and new providers.
- Add an admin bulk-approve for pending providers.

## Technical notes

- MCP helper: `export function supabaseForUser({ token = "" } = {})`, using `process.env.SUPABASE_URL ?? ""`. Call sites pass `{ token: ctx.getToken() }`. The defaults make the bundled JS infer the types, which removes the TS7006 and TS2345 errors.
- Migration: drop broad SELECT on `service_providers` and add an owner/admin policy using `has_role`. Confirm that `public_service_providers` still serves anon/authenticated reads, and audit the frontend for direct `service_providers` selects done by non-owners.
