

# Command Palette (Cmd+K) Search

## Overview
Create a global command palette accessible via `Cmd+K` / `Ctrl+K` shortcut or clicking the search button in the header. Uses the existing `cmdk` library and `CommandDialog` component already installed.

## 1. Create CommandPalette Component
**New file:** `src/components/CommandPalette.tsx`

- Register global `keydown` listener for `Cmd+K` / `Ctrl+K` to toggle open
- On open, show two default sections:
  - **Recent Searches** -- stored in `localStorage`, max 5 items, with a clock icon
  - **Popular Categories** -- hardcoded list: Electrician, Plumber, Carpenter, Painter, Cleaner, HVAC, Landscaping, Handyman
- As the user types, query `public_service_providers` view live via Supabase with `.ilike()` on `business_name`, `category`, `specialization`
- **Instant Results** show: small avatar thumbnail (40px circle), business name, category badge, hourly rate
- **Emergency highlight**: providers with `availability_24_7 = true` get a pulsing red dot before their name using a CSS `animate-pulse` on a `bg-red-500` circle with "Live" text
- Selecting a provider navigates to `/providers?search=<name>`
- Selecting a category navigates to `/providers?category=<value>`
- Save search term to localStorage on selection

## 2. Mount in App.tsx
Add `<CommandPalette />` inside `LanguageProvider` so it's globally available on all pages.

## 3. Header Search Integration
Update the header's existing search icon/button to also open the command palette by exposing an open state setter or using a custom event.

## Technical Details
- Uses existing `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandEmpty` from `src/components/ui/command.tsx`
- Debounce search input by 300ms before querying Supabase
- All Lucide icons at `strokeWidth={1.5}` for consistency
- Pulsing red dot: `<span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" /></span>`

## Files
- **Create:** `src/components/CommandPalette.tsx`
- **Edit:** `src/App.tsx` (mount component), `src/components/Header.tsx` (wire search button)
- No database changes needed

