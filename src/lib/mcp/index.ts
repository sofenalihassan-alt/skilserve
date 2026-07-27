import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchProvidersTool from "./tools/search-providers";
import listMyBookingsTool from "./tools/list-my-bookings";
import createBookingTool from "./tools/create-booking";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "skill-serve-mcp",
  title: "Skill Serve",
  version: "0.1.0",
  instructions:
    "Tools for Skill Serve, a local service marketplace. Use `search_providers` to find electricians, plumbers, carpenters and other providers, `create_booking` to book one, and `list_my_bookings` to review the signed-in user's bookings.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchProvidersTool, createBookingTool, listMyBookingsTool],
});
