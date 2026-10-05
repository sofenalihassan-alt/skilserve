import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "./search-providers";

export default defineTool({
  name: "create_booking",
  title: "Create a booking",
  description:
    "Create a pending Skill Serve booking with a provider for the signed-in user.",
  inputSchema: {
    provider_id: z.string().describe("Provider id from search_providers."),
    service_description: z.string().describe("What work is needed."),
    scheduled_date: z
      .string()
      .describe("Requested date/time as an ISO 8601 timestamp."),
    estimated_duration: z.number().describe("Estimated hours of work."),
    notes: z.string().optional().describe("Extra notes for the provider."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser({ token: ctx.getToken() ?? "" });
    const { data: provider } = await supabase
      .from("public_service_providers")
      .select("id, hourly_rate")
      .eq("id", input.provider_id)
      .maybeSingle();

    if (!provider) {
      return {
        content: [{ type: "text", text: "Provider not found or not available." }],
        isError: true,
      };
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: ctx.getUserId(),
        provider_id: input.provider_id,
        service_description: input.service_description,
        scheduled_date: input.scheduled_date,
        estimated_duration: input.estimated_duration,
        notes: input.notes ?? null,
        total_amount: provider.hourly_rate
          ? Number(provider.hourly_rate) * input.estimated_duration
          : null,
      })
      .select()
      .maybeSingle();

    return error
      ? { content: [{ type: "text", text: error.message }], isError: true }
      : {
          content: [{ type: "text", text: JSON.stringify(data) }],
          structuredContent: { booking: data },
        };
  },
});
