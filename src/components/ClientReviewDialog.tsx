import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  providerId: string;
  clientId: string;
  clientName?: string;
  onSaved?: () => void;
}

export const ClientReviewDialog = ({
  open,
  onOpenChange,
  bookingId,
  providerId,
  clientId,
  clientName,
  onSaved,
}: ClientReviewDialogProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('client_reviews')
        .select('id, rating, comment')
        .eq('booking_id', bookingId)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setExistingId(data.id);
        setRating(data.rating);
        setComment(data.comment || '');
      } else {
        setExistingId(null);
        setRating(0);
        setComment('');
      }
    })();
    return () => {
      active = false;
    };
  }, [open, bookingId]);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast({ title: 'Rating required', description: 'Please select 1 to 5 stars.', variant: 'destructive' });
      return;
    }
    if (comment.length > 500) {
      toast({ title: 'Comment too long', description: 'Please keep it under 500 characters.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      booking_id: bookingId,
      provider_id: providerId,
      client_id: clientId,
      rating,
      comment: comment.trim() || null,
    };
    const { error } = existingId
      ? await supabase.from('client_reviews').update({ rating, comment: comment.trim() || null }).eq('id', existingId)
      : await supabase.from('client_reviews').insert(payload);
    setSaving(false);

    if (error) {
      toast({ title: 'Could not save review', description: 'Please try again later.', variant: 'destructive' });
      return;
    }
    toast({ title: existingId ? 'Review updated' : 'Review submitted', description: 'Thanks for rating this customer.' });
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {clientName || 'this customer'}</DialogTitle>
          <DialogDescription>
            Your rating helps other providers know what to expect. Only completed jobs can be rated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1" role="group" aria-label="Rating" onMouseLeave={() => setHovered(0)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value > 1 ? 's' : ''}`}
                  aria-pressed={rating === value}
                  onMouseEnter={() => setHovered(value)}
                  onClick={() => setRating(value)}
                  className="p-1 transition-transform hover:scale-110 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Star
                    className={`h-7 w-7 ${
                      (hovered || rating) >= value
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-review-comment">Comment (optional)</Label>
            <Textarea
              id="client-review-comment"
              value={comment}
              maxLength={500}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Was the customer clear, punctual and respectful?"
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-end">{comment.length}/500</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : existingId ? 'Update review' : 'Submit review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
