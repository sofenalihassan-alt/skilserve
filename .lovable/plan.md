# Professional Skill Serve Splash

## Goal
Replace the plain text-and-logo splash with a short, polished service sequence that fits Skill Serve’s blue/cyan marketplace brand, while keeping the app quick to reach and usable.

## Changes
- Animate a small sequence of service symbols into the existing connected-people Skill Serve logo, then reveal the name with restrained motion.
- Use the existing theme surfaces and blue/cyan accents; avoid decorative glow, floating particles, or looping animation.
- Keep the existing once-per-browser-visit behavior and brief duration, and continue skipping the splash when reduced motion is preferred.
- Preserve the provider-discovery redesign already completed; limit this pass to the splash experience.

## Verification
- Check the first visit, a second visit in the same browser session, and reduced-motion behavior.
- Inspect phone and desktop layouts in both light and dark themes; confirm the transition finishes cleanly without blocking app interaction.
- Review runtime/build signals after implementation.

## Technical details
- Update the existing splash component and its timing only as needed; use the current logo asset and semantic theme tokens.
