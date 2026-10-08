import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useNavigationBadges(userId: string | undefined) {
  const [counts, setCounts] = useState({ userId, messages: 0, bookings: 0 });

  useEffect(() => {
    if (!userId) return;
    let active = true;
    let version = 0;

    const refresh = async () => {
      const request = ++version;
      const [messages, bookings] = await Promise.all([
        supabase.from("messages").select("id", { count: "exact", head: true })
          .eq("receiver_id", userId).eq("is_read", false),
        supabase.from("notifications").select("id", { count: "exact", head: true })
          .eq("user_id", userId).eq("type", "booking_update").eq("is_read", false),
      ]);
      if (!active || request !== version) return;
      setCounts((previous) => ({
        userId,
        messages: messages.error ? (previous.userId === userId ? previous.messages : 0) : messages.count ?? 0,
        bookings: bookings.error ? (previous.userId === userId ? previous.bookings : 0) : bookings.count ?? 0,
      }));
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const channel = supabase.channel(`navigation-badges-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => void refresh())
      .subscribe((status) => { if (status === "SUBSCRIBED") void refresh(); });

    void refresh();
    // Also recover from missed delete events and interrupted mobile connections.
    const interval = window.setInterval(refreshWhenVisible, 30_000);
    window.addEventListener("focus", refreshWhenVisible);
    window.addEventListener("online", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      window.removeEventListener("online", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return counts.userId === userId && userId ? counts : { messages: 0, bookings: 0 };
}