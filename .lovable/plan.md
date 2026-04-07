

# Password Reset Flow

## 1. Add "Forgot Password?" link to Auth.tsx
Below the password field in the login form, add a button/link that opens a forgot-password dialog or inline form. When clicked, it calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })` and shows a success toast.

**File:** `src/pages/Auth.tsx`

## 2. Create /reset-password page
**New file:** `src/pages/ResetPassword.tsx`

- On mount, listen to `supabase.auth.onAuthStateChange` for `PASSWORD_RECOVERY` event
- When recovery event detected, show a "Set New Password" form (password + confirm password)
- On submit, call `supabase.auth.updateUser({ password })` 
- Show success toast and redirect to `/auth`
- If no recovery event after a few seconds, show "Invalid or expired link" message
- Validate password match and minimum length client-side

## 3. Add route in App.tsx
Add `<Route path="/reset-password" element={<ResetPassword />} />` as a public route (no `ProtectedRoute` wrapper).

**File:** `src/App.tsx`

## Summary
- **Create:** `src/pages/ResetPassword.tsx`
- **Edit:** `src/pages/Auth.tsx` (add forgot password link + handler), `src/App.tsx` (add route)
- No database changes needed

