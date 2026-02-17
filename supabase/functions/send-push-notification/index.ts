import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { receiver_id, sender_name, message_preview } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPrivateKey) {
      return new Response(JSON.stringify({ error: "VAPID keys not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get push subscription for receiver
    const { data: sub } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", receiver_id)
      .maybeSingle();

    if (!sub) {
      return new Response(JSON.stringify({ message: "No subscription found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send push notification using Web Push protocol
    const payload = JSON.stringify({
      title: `Message from ${sender_name}`,
      body: message_preview.substring(0, 100),
      url: "/messages",
      tag: `msg-${receiver_id}`,
    });

    // For now, log the notification attempt
    // Full Web Push requires crypto operations with VAPID keys
    console.log("Push notification payload:", payload, "to:", sub.endpoint);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Push notification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
