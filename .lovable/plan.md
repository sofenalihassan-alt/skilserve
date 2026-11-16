# Finish the Provider Discovery Redesign

## Goal
Make the provider search screen feel polished and dependable on phones and laptops, completing the checks left open after the redesign.

## Work
1. Verify the existing search, filter drawer, dynamic “Show N Providers” count, clear-all action, saved filters, sorting, and map toggle.
2. Fix only issues found in the provider screen and provider cards, preserving the chosen search-first layout and single clear booking action.
3. Check phone widths (390px and 320px) and laptop layout for readable controls, usable drawer scrolling and sticky action, and no horizontal overflow.

## Technical details
- Keep changes limited to `Providers.tsx`, `ProviderCard.tsx`, and directly necessary presentation styles.
- Reuse existing design tokens and controls; do not add map services or integrations, backend changes, or payment features.
- Validate the public provider-discovery flow and review build/runtime diagnostics before finishing.
