import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

declare const process: { env: Record<string, string | undefined> };


// Defaults keep the bundled (type-stripped) edge function type-safe.
export function supabaseForUser({ token = "" } = {}) {
  return createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
export type { ToolContext };

export default defineTool({
  name: "search_providers",
  title: "Search service providers",
  description:
    "Search approved Skill Serve service providers by keyword, category, or 24/7 availability.",
  inputSchema: {
    query: z
      .string()
      .optional()
      .describe("Free text matched against business name and specialization."),
    category: z
      .string()
      .optional()
      .describe("Service category, e.g. plumbing, electrical, carpentry."),
    only_24_7: z
      .boolean()
      .optional()
      .describe("Only return providers available 24/7 for emergencies."),
    limit: z.number().optional().describe("Max results, default 10."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, only_24_7, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser({ token: ctx.getToken() ?? "" })
      .from("public_service_providers")
      .select(
        "id, business_name, category, specialization, bio, hourly_rate, years_experience, availability_24_7",
      )
      .eq("is_active", true)
      .eq("is_approved", true)
      .limit(Math.min(limit ?? 10, 25));

    if (category) q = q.eq("category", category);
    if (only_24_7) q = q.eq("availability_24_7", true);
    if (query?.trim()) {
      const term = `%${query.trim()}%`;
      q = q.or(`business_name.ilike.${term},specialization.ilike.${term}`);
    }

    const { data, error } = await q;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data ?? []) }],
          structuredContent: { providers: data ?? [] },
        };
  },
});
