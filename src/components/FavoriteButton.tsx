import { authRedirect } from "@/lib/authRedirect";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { PressButton as Button } from "@/components/PressButton";
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setIsFav(false);
    if (!user || !providerId) return;
    let active = true;
    (supabase as any)
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider_id", providerId)
      .maybeSingle()
      .then(({ data }: any) => {
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
      navigate(authRedirect());
      return;
    }
    if (busy) return;
    setBusy(true);
    const prev = isFav;
    setIsFav(!prev);
    try {
      if (prev) {
        const { error } = await (supabase as any).from("favorites").delete().eq("user_id", user.id).eq("provider_id", providerId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("favorites").insert({ user_id: user.id, provider_id: providerId });
        if (error) throw error;
        toast({ title: t('saved') });
      }
      setBurst(value => value + 1);
    } catch {
      setIsFav(prev);
      toast({ title: t('error'), description: t('favorite_error'), variant: "destructive" });
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
      disabled={busy}
      aria-pressed={isFav}
      aria-label={t(isFav ? 'remove_favorite' : 'add_favorite')}
      className={cn("relative shrink-0", className)}
    >
      <AnimatePresence>
        {burst > 0 && !reducedMotion && <motion.span key={burst} aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.55 }}>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = i * Math.PI / 4;
            return <motion.span key={i} className={cn('absolute h-1 w-1 rounded-full', isFav ? 'bg-emergency' : 'bg-accent')} initial={{ x: 0, y: 0, scale: 0.5 }} animate={{ x: Math.cos(angle) * 15, y: Math.sin(angle) * 15, scale: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} />;
          })}
        </motion.span>}
      </AnimatePresence>
      <motion.span key={`heart-${burst}`} className="flex" animate={reducedMotion || !burst ? undefined : { scale: [1, 1.3, 1] }} transition={{ duration: 0.35 }}>
      <Heart
        className={cn("h-4 w-4 transition-colors", isFav ? "fill-emergency text-emergency" : "text-muted-foreground")}
        strokeWidth={1.5}
      />
      </motion.span>
    </Button>
  );
};
