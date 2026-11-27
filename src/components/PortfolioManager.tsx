import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Images } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Item {
  id: string;
  image_url: string;
  caption: string | null;
}

const MAX_ITEMS = 12;

export const PortfolioManager = ({ providerId }: { providerId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await (supabase as any).from("portfolio_items").select("id, image_url, caption").eq("provider_id", providerId).order("created_at", { ascending: false });
    setItems((data as Item[]) || []);
  };

  useEffect(() => { load(); }, [providerId]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (items.length >= MAX_ITEMS) {
      toast({ title: "Limit reached", description: `You can have up to ${MAX_ITEMS} photos.`, variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Too large", description: "Image must be under 5MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("portfolio").upload(path, file);
    if (upErr) {
      setUploading(false);
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(path);
    const { error: insErr } = await (supabase as any).from("portfolio_items").insert({
      provider_id: providerId,
      image_url: pub.publicUrl,
    });
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (insErr) {
      toast({ title: "Error", description: "Could not save image.", variant: "destructive" });
    } else {
      toast({ title: "Uploaded", description: "Photo added to portfolio." });
      load();
    }
  };

  const remove = async (id: string, url: string) => {
    if (!confirm("Delete this photo?")) return;
    await (supabase as any).from("portfolio_items").delete().eq("id", id);
    try {
      const path = url.split("/portfolio/")[1];
      if (path) await supabase.storage.from("portfolio").remove([path]);
    } catch {}
    load();
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10"><Images className="h-5 w-5 text-accent" /></div>
          <div className="flex-1">
            <CardTitle>{t("portfolio")}</CardTitle>
            <CardDescription>{t("portfolio_desc")} ({items.length}/{MAX_ITEMS})</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input ref={inputRef} type="file" accept="image/*" onChange={upload} disabled={uploading || items.length >= MAX_ITEMS} className="sr-only" id="portfolio-upload" aria-label={t("add_photo")} />
          <Button type="button" variant="outline" disabled={uploading || items.length >= MAX_ITEMS} className="w-full gap-2" onClick={() => inputRef.current?.click()} aria-controls="portfolio-upload">
              <Upload className="h-4 w-4" />
              {uploading ? t("uploading") : items.length >= MAX_ITEMS ? t("limit_reached") : t("add_photo")}
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t("no_portfolio")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((it, index) => (
              <div key={it.id} className="relative aspect-square group rounded-lg overflow-hidden border border-border/50">
                <img src={it.image_url} alt={it.caption || `Portfolio photo ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => remove(it.id, it.image_url)}
                  aria-label={`Delete portfolio photo ${index + 1}`}
                  className="absolute top-1 right-1 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
