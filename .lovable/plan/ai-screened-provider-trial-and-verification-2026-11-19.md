# AI-screened provider trial and verification

## Goal
Providers who pass an automated profile screen can start taking bookings on a clearly labeled Trial basis. AI may flag document quality or inconsistencies, but only an admin can confirm identity and award Fully Verified status.

## Work
1. Update provider registration to require business name, valid category, specialization, sensible hourly rate, years of experience, bio, and a valid phone number. Reuse saved profile phone details where available and ask for them when missing.
2. Add a server-side screening flow that validates the signed-in provider and submission, applies deterministic completeness/category/price checks, then uses Lovable AI to flag spam, profanity, or suspicious/mismatched profile text. Only clear passes receive trial access; failed, uncertain, or unavailable AI results remain unavailable or pending admin review rather than being auto-approved.
3. Make trial approval server-controlled so providers cannot approve themselves or change their review tier from the browser. Record the trial state, keep approved trial providers searchable and bookable, and show a distinct Trial Provider badge. Preserve full approval controls for admins.
4. Extend document review so AI can identify image-quality issues or possible inconsistencies and surface those flags to admins. Keep the existing admin review as the required final step for the gold Fully Verified badge; providers can upload documents later.
5. Send the admin the requested “approved on Trial by AI” alert and send the provider a welcome/status notification using the existing in-app notification flow.
6. Add focused checks for required fields, pass/flag/uncertain screening outcomes, trial visibility and badge, notification recipients, and the rule that AI alone never grants Fully Verified status.

## Technical approach
Use the existing provider registration, verification center, admin verification area, notifications, and public provider listing. Add only the database fields and protected server-side approval path needed to distinguish trial providers; preserve existing row-level protections and private document storage. Keep AI calls and prompts in an authenticated server-side function, validate all inputs and structured AI results, and never trust a browser-supplied approval decision.

## Safety boundary
AI screening is a fraud and quality signal, not proof of identity or document originality. A human admin remains responsible for final document verification and the gold badge.
