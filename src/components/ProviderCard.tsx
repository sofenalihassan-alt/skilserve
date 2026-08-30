import { authRedirect } from "@/lib/authRedirect";
import { useState, useMemo, useEffect } from "react";
import { Star, Clock, Briefcase, Phone, MessageSquareText, ThumbsUp, ShieldCheck, Navigation, CalendarPlus, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { BookingDialog } from "@/components/BookingDialog";
import { FavoriteButton } from "@/components/FavoriteButton";

interface ProviderCardProps {
  provider: {
    id: string | null;
    user_id: string | null;
    business_name: string | null;
    category: string | null;
    specialization?: string | null;
    bio?: string | null;
    hourly_rate: number | null;
    years_experience?: number | null;
    is_active?: boolean | null;
    insurance_verified?: boolean | null;
    availability_24_7?: boolean | null;
    avatar_url?: string | null;
    verification_status?: string | null;
  };
  avgRating?: number;
  reviewCount?: number;
}

export const ProviderCard = ({ provider, avgRating = 0, reviewCount = 0 }: ProviderCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [hasConfirmedBooking, setHasConfirmedBooking] = useState(false);

  const isEmergency = provider.availability_24_7;

  // Check if user has a confirmed/in_progress booking with this provider
  useEffect(() => {
    if (!user || !provider.id) return;
    const check = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", user.id)
        .eq("provider_id", provider.id!)
        .in("status", ["confirmed", "in_progress"])
        .limit(1);
      setHasConfirmedBooking(!!(data && data.length > 0));
    };
    check();
  }, [user, provider.id]);

  const canMessage = isEmergency || hasConfirmedBooking;

  const simulatedDistance = useMemo(
    () => Math.floor(Math.random() * 7) + 2,
    [provider.id]
  );

  const initials = (provider.business_name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleCall = async () => {
    if (!user) { navigate(authRedirect()); return; }
    const { data } = await supabase.from('profiles').select('phone').eq('id', provider.user_id!).maybeSingle();
    const phone = data?.phone;
    if (!phone) {
      toast({ title: 'No Phone', description: 'This provider has not added a phone number.', variant: 'destructive' });
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    await supabase.from('call_history').insert({
      caller_id: user.id, receiver_id: provider.user_id!, call_type: isMobile ? 'direct' : 'whatsapp', phone_number: cleanPhone,
    });

    if (isMobile) {
      const useWhatsApp = confirm('Open WhatsApp? (Cancel for direct call)');
      if (useWhatsApp) {
        window.open(`https://wa.me/${cleanPhone.replace('+', '')}`, '_blank');
      } else {
        window.open(`tel:${cleanPhone}`, '_self');
      }
    } else {
      window.open(`https://wa.me/${cleanPhone.replace('+', '')}`, '_blank');
    }
  };

  const handleBook = () => {
    if (!user) { navigate(authRedirect()); return; }
    setBookingOpen(true);
  };

  return (
    <>
      <Card className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-0 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30">
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

        {provider.id && (
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton providerId={provider.id} className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background" />
          </div>
        )}


        <div className="relative p-5 space-y-4">
          {/* Top: Avatar + Info + Badges */}
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-border/50 group-hover:ring-primary/30 transition-all">
              <AvatarImage src={provider.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-base truncate text-foreground hover:text-primary cursor-pointer transition-colors"
                onClick={() => provider.id && navigate(`/provider/${provider.id}`)}
              >
                {provider.business_name}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">
                {provider.category}
              </p>
              {provider.specialization && (
                <p className="text-xs text-muted-foreground/80 truncate">
                  {provider.specialization}
                </p>
              )}

              <div className="flex items-center gap-1 mt-1.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    strokeWidth={1.5}
                    className={`h-3.5 w-3.5 ${
                      s < Math.round(avgRating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground/25"
                    }`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {avgRating > 0 ? avgRating.toFixed(1) : "New"} ({reviewCount})
                </span>
              </div>
            </div>
          </div>

          {/* Pill badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Navigation className="h-3 w-3" strokeWidth={1.5} />
              {simulatedDistance}km Away
            </span>
            {provider.verification_status === 'verified' && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30">
                <ShieldCheck className="h-3 w-3" strokeWidth={1.5} />
                Verified ✓
              </span>
            )}
            {provider.insurance_verified && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" strokeWidth={1.5} />
                Insured
              </span>
            )}
            {provider.availability_24_7 && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Clock className="h-3 w-3" strokeWidth={1.5} />
                24/7
              </span>
            )}
            {provider.is_active && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                Active
              </span>
            )}
          </div>

          {/* Bio */}
          {provider.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {provider.bio}
            </p>
          )}

          {/* Stats + Price */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {provider.years_experience && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" strokeWidth={1.5} />
                  {provider.years_experience}y exp
                </span>
              )}
            </div>
            <span className="text-lg font-bold text-primary">
              Rs. {provider.hourly_rate}
              <span className="text-xs font-normal text-muted-foreground">/hr</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <Button className="flex-1" size="sm" onClick={handleBook}>
              <CalendarPlus className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
              Book
            </Button>
            <Button variant="outline" className="flex-1" size="sm" onClick={handleCall}>
              <Phone className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
              Call
            </Button>

            {canMessage ? (
              <Button variant="outline" className="flex-1" size="sm"
                onClick={() => navigate('/messages', { state: { providerId: provider.user_id, providerName: provider.business_name } })}>
                <MessageSquareText className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
                Message
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="flex-1 opacity-50 cursor-not-allowed" size="sm" disabled>
                      <Lock className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
                      Message
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Book first to message this provider</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setFeedbackOpen(true)}>
              <ThumbsUp className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </Card>

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        type="provider"
        providerName={provider.business_name || "Provider"}
        providerId={provider.id || undefined}
      />

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        provider={{
          id: provider.id,
          business_name: provider.business_name,
          category: provider.category,
          hourly_rate: provider.hourly_rate,
        }}
      />
    </>
  );
};
