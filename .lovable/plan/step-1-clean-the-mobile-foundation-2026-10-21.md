# Step 1: Clean the mobile foundation

Goal: the app should feel calm and professional from the first second on a phone.

## 1. Brief splash, once per visit
- Show the splash only on the first page load of a browser visit; never again while the user moves around or refreshes in the same visit.
- Shorten it from 3 seconds to about 0.8 seconds: logo fades in, then fades out.
- Remove the pulsing rings, bouncing dots, floating particles, and progress bar.
- Skip it entirely for users who prefer reduced motion.
- It never blocks taps.

## 2. Less decoration
- Splash: plain theme background instead of the dark purple radial glow.
- Home: remove the blurred glow circle behind "Why Skill Serve"; replace the emoji icons with clean line icons; keep card hover lift subtle.
- Remove the magnetic pull on the home Search button (a desktop effect that feels gimmicky on phones).
- Keep blue/cyan gradient only on the brand name and one highlighted headline word; other gradients become solid colors.
- Tone down big glows and decorative animation in Emergency, Bookings, and Profile sections.
- Keep useful feedback: tap compressions, heart burst, tab pill.

## 3. Consistent spacing, type, and buttons
- One page rhythm on mobile: 16px side margins, consistent section spacing (48px phone, 80px desktop).
- Fixed type scale: page title, section title, card title, body, small text — applied to Home, Providers, Emergency, Bookings, Messages, Profile.
- Buttons: 44px minimum height on phones, consistent rounding, one main button style per area.
- Inputs match button height (48px in search).

## 4. Clean, stable header on every page
- Same height (56px phone / 64px desktop) and the same look on every page; nothing shifts while loading.
- Solid background with a thin bottom line instead of a heavy transparent blur, so text is always readable over content.
- Brand name in readable dark text with the logo carrying the color, or a gentle gradient — tested for contrast in light and dark mode.
- Right side: search, theme, and notifications as clean icon buttons without the glass pill frame.
- Fix the logo loading warning shown in the browser console.

## Check before finishing
- Phone (390 and 320 wide) and desktop screenshots of Home, Providers, Emergency, Auth, Bookings, Messages.
- English and Urdu (right-to-left).
- Light and dark mode, no sideways scrolling, no console warnings.

## Technical details
- SplashScreen: gate with `sessionStorage` flag in App.tsx; honor `prefers-reduced-motion`.
- Add shared tokens/utilities in `src/index.css` (section spacing, type scale classes) and use them in pages instead of ad-hoc sizes.
- Header.tsx: remove `fetchPriority` prop warning (use lowercase attribute or drop it), switch to `bg-background` + `border-b`.
- Update mem://design/visual-aesthetic to the calmer direction.
