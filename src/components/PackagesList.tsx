import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface ServicePackage {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

interface Props {
  providerId: string;
  onSelect?: (pkg: ServicePackage) => void;
  selectedId?: string;
}

export const PackagesList = ({ providerId, onSelect, selectedId }: Props) => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("service_packages")
      .select("*")
      .eq("provider_id", providerId)
      .eq("is_active", true)
      .order("price", { ascending: true })
      .then(({ data }) => {
        if (active) {
          setPackages((data as ServicePackage[]) || []);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [providerId]);

  if (loading) return <Skeleton className="h-20 w-full" />;
  if (packages.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No packages offered yet.</p>;
  }

  return (
    <div className="space-y-2">
      {packages.map((p) => {
        const selected = selectedId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect?.(p)}
            disabled={!onSelect}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/30"
            } ${!onSelect ? "cursor-default" : "cursor-pointer"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
                  <span className="font-semibold text-sm truncate">{p.title}</span>
                </div>
                {p.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                )}
                <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" strokeWidth={1.5} />
                  {p.duration_minutes} min
                </div>
              </div>
              <span className="text-base font-bold text-primary shrink-0">Rs. {p.price}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
