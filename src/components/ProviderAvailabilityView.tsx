import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Slot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Props {
  providerId: string;
  compact?: boolean;
}

export const ProviderAvailabilityView = ({ providerId, compact = false }: Props) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("provider_availability")
      .select("day_of_week, start_time, end_time, is_available")
      .eq("provider_id", providerId)
      .eq("is_available", true)
      .is("specific_date", null)
      .order("day_of_week")
      .then(({ data }) => {
        setSlots(data || []);
        setLoading(false);
      });
  }, [providerId]);

  if (loading) return null;
  if (slots.length === 0) return <p className="text-xs text-muted-foreground">No availability set</p>;

  const grouped = DAYS.map((day, i) => ({
    day,
    slots: slots.filter((s) => s.day_of_week === i),
  })).filter((g) => g.slots.length > 0);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {grouped.map((g) => (
          <span key={g.day} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            <Clock className="h-2.5 w-2.5" />
            {g.day} {g.slots[0].start_time.slice(0, 5)}-{g.slots[0].end_time.slice(0, 5)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground mb-1">Available Hours</p>
      {grouped.map((g) => (
        <div key={g.day} className="flex items-center gap-2 text-sm">
          <span className="w-8 font-medium text-xs">{g.day}</span>
          {g.slots.map((s, i) => (
            <span key={i} className="text-xs text-muted-foreground">
              {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
