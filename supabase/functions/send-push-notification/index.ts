import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendWebPush } from "../_shared/webpush.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  // Generic form
  user_id?: string;
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
  // Legacy message form
  receiver_id?: string;
  sender_name?: string;
  message_preview?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Authentication: internal service-role calls, or a signed-in user ---
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.slice("Bearer ".length).trim();
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const isInternal = token === serviceRoleKey;

    let callerId: string | null = null;
    if (!isInternal) {
      const authClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
      );
      const { data, error } = await authClient.auth.getClaims(token);
      if (error || !data?.claims?.sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      callerId = data.claims.sub as string;
    }

    const payload = (await req.json()) as Body;

    const userId = payload.user_id ?? payload.receiver_id;
    const title = payload.title ?? (payload.sender_name ? `Message from ${payload.sender_name}` : "SkillServe");
    const body = payload.body ?? payload.message_preview ?? "";
    const url = payload.url ?? (payload.receiver_id ? "/messages" : "/");
    const tag = payload.tag ?? `ss-${userId}`;

    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Signed-in users may only trigger notifications for themselves; this
    // prevents enumerating which accounts have push subscriptions.
    if (!isInternal && userId !== callerId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const subject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:support@example.com";

    if (!publicKey || !privateKey) {
      return new Response(JSON.stringify({ error: "VAPID keys not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscription found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    for (const sub of subs) {
      const result = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        { title, body: body.slice(0, 160), url, tag },
        { publicKey, privateKey, subject },
      );
      if (result.ok) sent++;
      if (result.expired) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Push notification error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
