# Fix provider review, Trial access, alerts, and mobile terms acceptance

## Confirmed from the screenshots and current database
- There are two active providers awaiting approval and two active approved providers, but no verification documents have been uploaded. The dashboard count is about provider approval, while the Verification tab only lists uploaded documents.
- The Providers tab tries to join provider owners to profiles using a relationship that points to authentication users, so the list query fails instead of showing those provider rows.
- No provider-registration alert is currently generated.
- The terms acceptance screen has a per-user save rule and signed-in access. The screenshot does not reveal the exact save error, so reproduce the real mobile submission before choosing a fix.

## Work
1. **Make admin review accurate.** Load provider records and owner names through valid separate reads, show Pending / Trial / Fully Verified / Expired states, and show useful loading, empty, and error states instead of silently displaying “No providers.” Keep the Verification tab focused on actual uploaded documents.
2. **Add AI-screened Trial approval.** Require business name, category, specialization, hourly rate, experience, bio, and phone. Validate required fields, supported service categories, and the existing price limits on the server. Screen profile text for spam, profanity, and suspicious content with Lovable AI. Only clear passes may activate Trial access; failed, uncertain, or unavailable screening stays unavailable for bookings and is sent to admin review. An AI failure must never create an approval.
3. **Make Trial time-limited and visible.** A clear submission receives a searchable, bookable Trial Provider badge for 30 days. If the provider submits the complete required identity-document set before the deadline, keep Trial access while an admin reviews it. If the deadline passes without those documents, remove the provider from search and block new bookings until review is resolved. Providers cannot set their own approval, trial, or verification status.
4. **Keep the gold badge under human control.** AI may flag document image quality or possible inconsistencies for the admin. It cannot certify originality or award Fully Verified. An admin must review the documents and approve them before the gold badge appears. Providers can submit documents later through the existing Verification Center.
5. **Notify the right people.** On every provider submission, send admins an in-app alert stating whether AI granted Trial access or sent the application for review. Send the provider a welcome message when Trial access is granted and clear status guidance if it is not. Use the existing notification center and protect recipient selection on the server.
6. **Fix mobile terms acceptance based on evidence.** Reproduce acceptance with a signed-in account at phone size, capture the actual save response, and inspect the current version and existing acceptance row. Make saving safe to repeat for the same user and terms version if the duplicate record is the cause; otherwise fix the observed failure without weakening the per-user rule. Keep acceptance records inaccessible to anonymous users.
7. **Verify the central flows.** Check provider submission, admin provider visibility, admin and provider alerts, Trial badges, expiry and booking blocking, admin-only gold verification, and the mobile Accept & Continue flow. Use simulated AI outcomes for automated tests and avoid unnecessary live AI requests or test data in production.

## Technical approach
Use the existing registration, admin, document-review, notification, and provider-listing flows. Keep screening and approval decisions in authenticated server-side code; validate inputs and AI output, and use protected database rules so a browser cannot approve itself. Store a Trial expiry date and enforce it in both public provider results and new bookings. Preserve private document storage and per-user ownership rules for acceptance records.

## Safety boundary
AI screening is a risk and quality signal—not identity proof. Only an admin can confirm submitted documents and grant Fully Verified status. Existing customers and bookings are not changed by Trial expiry; it only pauses new discovery and booking access.
