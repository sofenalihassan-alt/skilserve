

# Implementation Plan

## 1. Skeleton Loaders for Provider Cards and Map

Create a `ProviderCardSkeleton` component that mirrors the exact bento-style card shape: avatar circle, name/category text bars, badge pills row, bio lines, price bar, and 3 action buttons. Use the existing `Skeleton` component from `src/components/ui/skeleton.tsx`.

Create a `MapSkeleton` that matches the 600px-tall map card shape.

Update `src/pages/Providers.tsx` to render a grid of 4-6 skeleton cards while `loading` is true, and a map skeleton when `showMap` is true during loading.

**Files:** New `src/components/ProviderCardSkeleton.tsx`, edit `src/pages/Providers.tsx`

## 2. Smooth Language Cross-fade Transition

Update `src/contexts/LanguageContext.tsx` to add CSS transition properties on the wrapper div. When language changes:
- Apply `transition: opacity 0.3s ease, transform 0.3s ease` on the wrapper
- Briefly fade out (opacity 0), swap language + dir attribute, then fade back in
- Use a small state flag (`isTransitioning`) to control the opacity class
- The `dir` attribute change (ltr/rtl) will be covered by the same 0.3s transition so the RTL flip animates smoothly

Add CSS transition for direction-dependent properties:
```css
.language-transition {
  transition: opacity 0.3s ease, direction 0.3s ease;
}
```

Since CSS `direction` isn't animatable, the smooth feel comes from fading out content, swapping dir, then fading back in -- so the layout "snap" is hidden behind the crossfade.

**File:** `src/contexts/LanguageContext.tsx`

## Summary
- Create: `src/components/ProviderCardSkeleton.tsx`
- Edit: `src/pages/Providers.tsx`, `src/contexts/LanguageContext.tsx`
- No database changes

