import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props {
  providerId: string;
  className?: string;
  variant?: "icon" | "ghost";
}

export const FavoriteButton = ({ providerId, className, variant = "icon" }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !providerId) return;
    let active = true;
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider_id", providerId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setIsFav(!!data);
      });
    return () => {
      active = false;
    };
  }, [user, providerId]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }
    if (busy) return;
    setBusy(true);
    const prev = isFav;
    setIsFav(!prev);
    try {
      if (prev) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("provider_id", providerId);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, provider_id: providerId });
        toast({ title: "Saved", description: "Added to your favorites." });
      }
    } catch {
      setIsFav(prev);
      toast({ title: "Error", description: "Could not update favorites.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      className={cn("shrink-0", className)}
    >
      <Heart
        className={cn("h-4 w-4 transition-colors", isFav ? "fill-red-500 text-red-500" : "text-muted-foreground")}
        strokeWidth={1.5}
      />
    </Button>
  );
};
