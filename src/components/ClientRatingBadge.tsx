import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/** Shows the average rating a customer has received from providers. */
export const ClientRatingBadge = ({ clientId }: { clientId: string }) => {
  const [stats, setStats] = useState<{ avg: number; count: number } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('client_reviews')
        .select('rating')
        .eq('client_id', clientId);
      if (!active || !data || data.length === 0) return;
      const avg = data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length;
      setStats({ avg, count: data.length });
    })();
    return () => {
      active = false;
    };
  }, [clientId]);

  if (!stats) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" strokeWidth={1.5} />
      {stats.avg.toFixed(1)} · {stats.count} rating{stats.count > 1 ? 's' : ''}
    </span>
  );
};
