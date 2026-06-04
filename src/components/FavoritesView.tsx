import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProviderCard } from "@/components/ProviderCard";
import { ProviderCardSkeleton } from "@/components/ProviderCardSkeleton";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const FavoritesView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data: favs } = await (supabase as any)
        .from("favorites")
        .select("provider_id")
        .eq("user_id", user.id);
      const ids = (favs || []).map((f: any) => f.provider_id);
      if (ids.length === 0) {
        setProviders([]);
        setLoading(false);
        return;
      }
      const { data: provs } = await supabase
        .from("public_service_providers")
        .select("*")
        .in("id", ids);
      const { data: reviews } = await supabase
        .from("reviews")
        .select("provider_id, rating")
        .in("provider_id", ids);
      const s: Record<string, { avg: number; count: number }> = {};
      (reviews || []).forEach((r: any) => {
        if (!s[r.provider_id]) s[r.provider_id] = { avg: 0, count: 0 };
        s[r.provider_id].count++;
        s[r.provider_id].avg += r.rating;
      });
      Object.keys(s).forEach((k) => (s[k].avg = s[k].avg / s[k].count));
      setStats(s);
      setProviders(provs || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map((i) => <ProviderCardSkeleton key={i} />)}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground/40" strokeWidth={1.5} />
        <div>
          <h3 className="font-semibold">No favorites yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Tap the heart on any provider to save them here.</p>
        </div>
        <Button onClick={() => navigate("/providers")}>Browse Providers</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {providers.map((p) => (
        <ProviderCard
          key={p.id}
          provider={p}
          avgRating={stats[p.id]?.avg || 0}
          reviewCount={stats[p.id]?.count || 0}
        />
      ))}
    </div>
  );
};
