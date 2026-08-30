import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Returns a guard for actions that need an account.
 * Call `requireAuth()` — it returns true when the user is signed in, and
 * otherwise sends them to /auth with a `next` param back to this page.
 */
export const useRequireAuth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = useCallback(() => {
    if (user) return true;
    const next = `${location.pathname}${location.search}`;
    navigate(`/auth?next=${encodeURIComponent(next)}`);
    return false;
  }, [user, navigate, location.pathname, location.search]);

  return { user, requireAuth };
};
