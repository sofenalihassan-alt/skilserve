import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Upload } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  bookingId: string;
  againstUserId: string;
}

const REASONS = [
  "Service not completed",
  "Quality issue",
  "Provider didn't show up",
  "Customer didn't show up",
  "Payment dispute",
  "Inappropriate behavior",
  "Other",
];

export const DisputeDialog = ({ open, onOpenChange, bookingId, againstUserId }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const submit = async () => {
    if (!user || !reason || description.trim().length < 10) {
      setValidationError("Please choose a reason and describe what happened in at least 10 characters.");
      window.setTimeout(() => document.getElementById(reason ? "dispute-description" : "dispute-reason")?.focus(), 0);
      toast({ title: "Missing info", description: "Please pick a reason and write at least 10 characters.", variant: "destructive" });
      return;
    }
    setValidationError("");
    setSubmitting(true);
    try {
      const evidenceUrls: string[] = [];
      for (const file of files.slice(0, 3)) {
        if (file.size > 5 * 1024 * 1024) continue;
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${bookingId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error } = await supabase.storage.from("dispute-evidence").upload(path, file);
        if (!error) evidenceUrls.push(path);
      }

      const { error: insertErr } = await supabase.from("disputes").insert({
        booking_id: bookingId,
        raised_by: user.id,
        against_user_id: againstUserId,
        reason,
        description: description.trim(),
        evidence_urls: evidenceUrls,
        status: "pending",
      });

      if (insertErr) throw insertErr;

      toast({ title: "Issue reported", description: "Our team will review it shortly." });
      onOpenChange(false);
      setReason("");
      setDescription("");
      setFiles([]);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Tell us what went wrong. Our team will investigate within 48 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {validationError && <p id="dispute-validation-error" role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{validationError}</p>}
          <div className="space-y-2">
            <Label htmlFor="dispute-reason">Reason</Label>
            <Select value={reason} onValueChange={(value) => { setReason(value); setValidationError(""); }}>
              <SelectTrigger id="dispute-reason" aria-label="Reason for dispute" aria-invalid={!!validationError && !reason} aria-describedby={validationError && !reason ? "dispute-validation-error" : undefined}>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispute-description">Describe what happened</Label>
            <Textarea
              id="dispute-description"
              aria-invalid={!!validationError && description.trim().length < 10}
              aria-describedby={validationError && description.trim().length < 10 ? "dispute-validation-error dispute-description-count" : "dispute-description-count"}
              value={description}
              onChange={(e) => { setDescription(e.target.value); if (e.target.value.trim().length >= 10 && reason) setValidationError(""); }}
              rows={4}
              maxLength={1000}
              placeholder="Provide as much detail as possible…"
            />
            <p id="dispute-description-count" className="text-xs text-muted-foreground text-right" aria-live="polite">{description.length}/1000 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispute-evidence" className="flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Evidence (optional, up to 3 files, 5MB each)
            </Label>
            <Input
              id="dispute-evidence"
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 3))}
            />
            {files.length > 0 && (
              <p className="text-xs text-muted-foreground" role="status">{files.length} file(s) selected</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
