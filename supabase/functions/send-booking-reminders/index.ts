import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Window = "24h" | "1h";

const WINDOWS: { key: Window; column: string; leadMs: number; label: string }[] = [
  { key: "24h", column: "reminder_24h_sent_at", leadMs: 24 * 60 * 60 * 1000, label: "tomorrow" },
  { key: "1h", column: "reminder_1h_sent_at", leadMs: 60 * 60 * 1000, label: "in about an hour" },
];

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = Date.now();
  const summary: Record<string, number> = { "24h": 0, "1h": 0 };

  try {
    for (const win of WINDOWS) {
      // Bookings whose start time falls inside the reminder window and that
      // have not been reminded for this window yet.
      const upperBound = new Date(now + win.leadMs).toISOString();
      const lowerBound = new Date(now).toISOString();

      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(
          "id, user_id, provider_id, service_description, scheduled_date, status, reminder_24h_sent_at, reminder_1h_sent_at, service_providers(business_name, user_id)",
        )
        .eq("status", "confirmed")
        .is(win.column, null)
        .gte("scheduled_date", lowerBound)
        .lte("scheduled_date", upperBound)
        .limit(200);

      if (error) {
        console.error("query failed", win.key, error.message);
        continue;
      }

      for (const booking of bookings ?? []) {
        const provider = (booking as Record<string, any>).service_providers as
          | { business_name: string; user_id: string }
          | null;

        const when = formatWhen(booking.scheduled_date as string);
        const service = (booking.service_description as string) ?? "your service";

        const recipients: { user_id: string; title: string; body: string }[] = [
          {
            user_id: booking.user_id as string,
            title: `Booking reminder — ${win.label}`,
            body: `${service} with ${provider?.business_name ?? "your provider"} on ${when}.`,
          },
        ];
        if (provider?.user_id) {
          recipients.push({
            user_id: provider.user_id,
            title: `Job reminder — ${win.label}`,
            body: `${service} scheduled for ${when}.`,
          });
        }

        for (const r of recipients) {
          await supabase.from("notifications").insert({
            user_id: r.user_id,
            type: "booking_update",
            title: r.title,
            body: r.body,
            link: "/bookings",
          });

          // Best-effort push; never blocks the reminder from being marked sent.
          try {
            await supabase.functions.invoke("send-push-notification", {
              body: { user_id: r.user_id, title: r.title, body: r.body, url: "/bookings", tag: `booking-${booking.id}` },
            });
          } catch (err) {
            console.error("push invoke failed", err);
          }
        }

        await supabase
          .from("bookings")
          .update({ [win.column]: new Date().toISOString() })
          .eq("id", booking.id);

        summary[win.key]++;
      }
    }

    return new Response(JSON.stringify({ success: true, ...summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("reminder run failed", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
