import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "./search-providers";

export default defineTool({
  name: "list_my_bookings",
  title: "List my bookings",
  description:
    "List the signed-in user's Skill Serve bookings, newest first, optionally filtered by status.",
  inputSchema: {
    status: z
      .string()
      .optional()
      .describe("pending, confirmed, in_progress, completed or cancelled."),
    limit: z.number().optional().describe("Max results, default 20."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("bookings")
      .select(
        "id, provider_id, service_description, scheduled_date, estimated_duration, status, total_amount, notes, created_at",
      )
      .order("scheduled_date", { ascending: false })
      .limit(Math.min(limit ?? 20, 50));

    if (status) q = q.eq("status", status);

    const { data, error } = await q;
    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data ?? []) }],
          structuredContent: { bookings: data ?? [] },
        };
  },
});
