# Splash Screen Finish

## What will change
- Refine the service-to-logo reveal so the animation is slower and the brand remains visible long enough to recognize, while keeping it brief and once per visit.
- Show the saved Urdu brand name in Urdu and sequence the service icons right-to-left when Urdu is selected.
- Improve the service-symbol contrast in light and dark themes without adding glow or decorative effects.

## Verification
- Check first visit, repeat visit, and reduced-motion behavior.
- Check Urdu and English, light and dark themes, and narrow phone widths (320px and 390px), including clipping and RTL order.
- Review the latest preview/build and runtime diagnostics after the changes; correct any splash-related errors found.

## Technical details
- Use the existing saved language key (`skillserve-language`), theme tokens, logo, and reduced-motion behavior.
- The current splash uses a hard-coded English name and a 1.18-second main animation; no preview diagnostic logs were available during this review.
