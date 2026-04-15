import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, Trash2, CalendarClock } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

interface Slot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Props {
  providerId: string;
}

export const AvailabilityCalendar = ({ providerId }: Props) => {
  const { toast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, [providerId]);

  const fetchSlots = async () => {
    const { data } = await supabase
      .from("provider_availability")
      .select("*")
      .eq("provider_id", providerId)
      .is("specific_date", null)
      .order("day_of_week");
    setSlots((data || []).map((d: any) => ({
      id: d.id,
      day_of_week: d.day_of_week,
      start_time: d.start_time,
      end_time: d.end_time,
      is_available: d.is_available,
    })));
    setLoading(false);
  };

  const addSlot = (day: number) => {
    setSlots([...slots, { day_of_week: day, start_time: "09:00", end_time: "17:00", is_available: true }]);
  };

  const removeSlot = async (index: number) => {
    const slot = slots[index];
    if (slot.id) {
      await supabase.from("provider_availability").delete().eq("id", slot.id);
    }
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof Slot, value: any) => {
    const updated = [...slots];
    (updated[index] as any)[field] = value;
    setSlots(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    // Delete all existing recurring slots
    await supabase
      .from("provider_availability")
      .delete()
      .eq("provider_id", providerId)
      .is("specific_date", null);

    // Insert all current slots
    if (slots.length > 0) {
      const { error } = await supabase.from("provider_availability").insert(
        slots.map((s) => ({
          provider_id: providerId,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          is_available: s.is_available,
        }))
      );
      if (error) {
        toast({ title: "Error", description: "Failed to save availability", variant: "destructive" });
        setSaving(false);
        return;
      }
    }
    toast({ title: "Saved!", description: "Your availability has been updated." });
    fetchSlots();
    setSaving(false);
  };

  if (loading) return <div className="text-muted-foreground text-center py-8">Loading availability...</div>;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><CalendarClock className="h-5 w-5 text-primary" /></div>
          <div>
            <CardTitle>Availability Schedule</CardTitle>
            <CardDescription>Set your weekly available time slots</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAYS.map((day, dayIndex) => {
          const daySlots = slots.map((s, i) => ({ ...s, _index: i })).filter((s) => s.day_of_week === dayIndex);
          return (
            <div key={dayIndex} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{day}</h4>
                <Button size="sm" variant="ghost" onClick={() => addSlot(dayIndex)} className="gap-1 h-7 text-xs">
                  <Plus className="h-3 w-3" /> Add Slot
                </Button>
              </div>
              {daySlots.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-2">No slots — marked as unavailable</p>
              ) : (
                daySlots.map((slot) => (
                  <div key={slot._index} className="flex items-center gap-2 pl-2 flex-wrap">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <Select value={slot.start_time} onValueChange={(v) => updateSlot(slot._index, "start_time", v)}>
                      <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">to</span>
                    <Select value={slot.end_time} onValueChange={(v) => updateSlot(slot._index, "end_time", v)}>
                      <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      <Switch checked={slot.is_available} onCheckedChange={(v) => updateSlot(slot._index, "is_available", v)} className="scale-75" />
                      <span className="text-xs text-muted-foreground">{slot.is_available ? "Available" : "Blocked"}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeSlot(slot._index)} className="h-7 w-7 p-0">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          );
        })}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Availability"}
        </Button>
      </CardContent>
    </Card>
  );
};
