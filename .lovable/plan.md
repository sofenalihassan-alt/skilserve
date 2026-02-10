

## Enable Leaked Password Protection

This change will enable the leaked password protection feature in the authentication settings. This prevents users from signing up or changing their password to one that has appeared in known data breaches.

### What will change

A single configuration update to the authentication system to enable the "HaveIBeenPwned" leaked password protection. When enabled, any signup or password change attempt will be checked against a database of known compromised passwords and rejected if a match is found.

### Technical Details

- Update `supabase/config.toml` to set `[auth.password]` section with `min_length = 8` and enable the hibp (HaveIBeenPwned) provider under `[auth.password.leaked_password_protection]`
- After applying, the `leaked_password_protection` security warning will be resolved and deleted from the security findings

### User Impact

- Users attempting to sign up with a password known to be compromised will receive an error asking them to choose a different password
- Existing users are not affected unless they try to change their password to a compromised one
- No UI changes are needed -- the error will surface through the existing toast notification system

