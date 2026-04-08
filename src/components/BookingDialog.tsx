import { useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { CalendarIcon, Clock, AlertTriangle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const bookingSchema = z.object({
  description: z.string().trim().min(10, "Describe the problem in at least 10 characters").max(1000),
  date: z.date({ required_error: "Please pick a date" }),
  duration: z.number().min(1).max(8),
  notes: z.string().max(500).optional(),
  urgent: z.boolean(),
});

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: {
    id: string | null;
    business_name: string | null;
    category: string | null;
    hourly_rate: number | null;
  };
}

export const BookingDialog = ({ open, onOpenChange, provider }: BookingDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>();
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const estimatedCost = (provider.hourly_rate || 0) * duration;

  const handleSubmit = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const result = bookingSchema.safeParse({ description, date, duration, notes, urgent });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      provider_id: provider.id!,
      service_description: `${urgent ? "[URGENT] " : ""}${description}`,
      scheduled_date: date!.toISOString(),
      estimated_duration: duration,
      total_amount: estimatedCost,
      notes: notes || null,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: "Failed to create booking. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Booking Sent! ✓", description: `Your request has been sent to ${provider.business_name}. They'll respond soon.` });
      onOpenChange(false);
      setDescription("");
      setDate(undefined);
      setDuration(1);
      setNotes("");
      setUrgent(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Book {provider.business_name}</DialogTitle>
          <DialogDescription className="capitalize">{provider.category} Service</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Problem Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Describe the Problem *</Label>
            <Textarea
              id="description"
              placeholder="e.g. My kitchen sink is leaking and needs repair..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Preferred Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Estimated Duration</Label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {h} hour{h > 1 ? "s" : ""}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Urgency */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" strokeWidth={1.5} />
              <Label htmlFor="urgent" className="cursor-pointer">Mark as Urgent</Label>
            </div>
            <Switch id="urgent" checked={urgent} onCheckedChange={setUrgent} />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any extra details, preferred time, access instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          {/* Estimated Cost */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimated Cost</span>
              <span className="text-2xl font-bold text-primary">Rs. {estimatedCost}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rs. {provider.hourly_rate}/hr × {duration} hr{duration > 1 ? "s" : ""}
            </p>
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2" size="lg">
            <Send className="h-4 w-4" strokeWidth={1.5} />
            {submitting ? "Sending Request..." : "Send Booking Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
