import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";

interface Item {
  id: string;
  image_url: string;
  caption: string | null;
}

export const PortfolioGallery = ({ providerId, max }: { providerId: string; max?: number }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<Item | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("portfolio_items")
      .select("id, image_url, caption")
      .eq("provider_id", providerId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active) {
          setItems((data as Item[]) || []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [providerId]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No portfolio photos yet.</p>
      </div>
    );
  }

  const shown = max ? items.slice(0, max) : items;
  const extra = max && items.length > max ? items.length - max : 0;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {shown.map((it, i) => (
          <button
            key={it.id}
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightbox(it); }}
            className="relative aspect-square overflow-hidden rounded-lg group"
          >
            <img src={it.image_url} alt={it.caption || "Portfolio"} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            {extra > 0 && i === shown.length - 1 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">
                +{extra}
              </div>
            )}
          </button>
        ))}
      </div>

      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl p-2">
          {lightbox && (
            <div className="space-y-2">
              <img src={lightbox.image_url} alt={lightbox.caption || ""} className="w-full max-h-[80vh] object-contain rounded" />
              {lightbox.caption && <p className="text-sm text-center text-muted-foreground px-4 pb-2">{lightbox.caption}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
