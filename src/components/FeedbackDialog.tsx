import { authRedirect } from "@/lib/authRedirect";
import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "website" | "provider";
  providerName?: string;
  providerId?: string;
}

export const FeedbackDialog = ({ open, onOpenChange, type, providerName, providerId }: FeedbackDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      navigate(authRedirect());
      return;
    }
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    if (type === "website") {
      const { error } = await supabase.from("website_feedback").insert({
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
        page: "providers",
      });

      if (error) {
        toast({ title: "Error", description: "Failed to submit feedback", variant: "destructive" });
      } else {
        toast({ title: "Thank you!", description: "Your feedback has been submitted." });
        onOpenChange(false);
        setRating(0);
        setComment("");
      }
    } else {
      // Provider feedback - needs a completed booking
      toast({
        title: "Booking Required",
        description: "You can review a provider after completing a booking with them.",
        variant: "destructive",
      });
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {type === "website" ? "Website Feedback" : `Review ${providerName}`}
          </DialogTitle>
          <DialogDescription>
            {type === "website"
              ? "Help us improve! Share your experience with SkillServe."
              : "Share your experience with this service provider."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    i < (hoverRating || rating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Tell us more about your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
