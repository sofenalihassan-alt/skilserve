/**
 * Builds the sign-in URL for a gated action, remembering the current page so
 * the user is returned here after authenticating.
 */
export const authRedirect = (next?: string) => {
  const target =
    next ?? `${window.location.pathname}${window.location.search}`;
  if (!target || target === "/auth") return "/auth";
  return `/auth?next=${encodeURIComponent(target)}`;
};
