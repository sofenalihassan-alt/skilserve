import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Item {
  id: string;
  image_url: string;
  caption: string | null;
}

export const PortfolioGallery = ({ providerId, max }: { providerId: string; max?: number }) => {
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<Item | null>(null);

  useEffect(() => {
    let active = true;
    (supabase as any)
      .from("portfolio_items")
      .select("id, image_url, caption")
      .eq("provider_id", providerId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }: any) => {
        if (active) {
          setItems((data as Item[]) || []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [providerId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">{t("no_portfolio")}</p>
      </div>
    );
  }

  const shown = max ? items.slice(0, max) : items;
  const extra = max && items.length > max ? items.length - max : 0;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {shown.map((it, i) => (
          <button
            key={it.id}
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightbox(it); }}
            className="relative aspect-square overflow-hidden rounded-lg group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`View portfolio image ${i + 1}${it.caption ? `: ${it.caption}` : ""}`}
          >
            <img src={it.image_url} alt={it.caption || `Portfolio photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
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
          <DialogHeader className="sr-only">
            <DialogTitle>Portfolio image preview</DialogTitle>
            <DialogDescription>{lightbox?.caption || "Enlarged portfolio photo"}</DialogDescription>
          </DialogHeader>
          {lightbox && (
            <div className="space-y-2">
              <img src={lightbox.image_url} alt={lightbox.caption || "Enlarged portfolio photo"} className="w-full max-h-[80vh] object-contain rounded" />
              {lightbox.caption && <p className="text-sm text-center text-muted-foreground px-4 pb-2">{lightbox.caption}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
