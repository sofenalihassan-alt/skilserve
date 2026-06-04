import { useEffect, useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Pkg {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

export const PackagesManager = ({ providerId }: { providerId: string }) => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", price: "", duration_minutes: "60" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("service_packages").select("*").eq("provider_id", providerId).order("created_at", { ascending: false });
    setPackages((data as Pkg[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [providerId]);

  const add = async () => {
    const price = parseFloat(form.price);
    const dur = parseInt(form.duration_minutes);
    if (!form.title.trim() || isNaN(price) || price <= 0 || isNaN(dur) || dur <= 0) {
      toast({ title: "Invalid input", description: "Title, valid price and duration are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("service_packages").insert({
      provider_id: providerId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      price,
      duration_minutes: dur,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Could not save package.", variant: "destructive" });
    } else {
      setForm({ title: "", description: "", price: "", duration_minutes: "60" });
      toast({ title: "Added", description: "Package created." });
      load();
    }
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("service_packages").update({ is_active: active }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    await supabase.from("service_packages").delete().eq("id", id);
    load();
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary" /></div>
          <div>
            <CardTitle>Service Packages</CardTitle>
            <CardDescription>Offer fixed-price bundles to attract more bookings</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-lg border border-border/50 bg-background/30">
          <div className="space-y-2 md:col-span-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Basic Plumbing Check" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's included…" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Price (Rs.)</Label>
            <Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input type="number" min="1" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </div>
          <Button onClick={add} disabled={saving} className="md:col-span-2 gap-2">
            <Plus className="h-4 w-4" /> {saving ? "Adding…" : "Add Package"}
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : packages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No packages yet. Add your first above.</p>
        ) : (
          <div className="space-y-2">
            {packages.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background/30">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">Rs. {p.price} · {p.duration_minutes} min</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={p.is_active} onCheckedChange={(v) => toggle(p.id, v)} />
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
