import { authRedirect } from "@/lib/authRedirect";
import { useState } from "react";
import { Star, Clock, ShieldCheck, CalendarPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PressButton as Button } from "@/components/PressButton";
import { motion, useReducedMotion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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

const MotionCard = motion.create(Card);

export const ProviderCard = ({ provider, avgRating = 0, reviewCount = 0 }: ProviderCardProps) => {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { user } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);


  const initials = (provider.business_name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleBook = () => {
    if (!user) { navigate(authRedirect()); return; }
    setBookingOpen(true);
  };

  return (
    <>
      <MotionCard whileTap={reducedMotion ? undefined : { scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }} className="group relative overflow-hidden rounded-[1.6rem] border border-border/60 bg-card/80 p-0 shadow-[0_10px_35px_-26px_hsl(var(--foreground)/0.28)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_24px_55px_-28px_hsl(var(--primary)/0.32)]">
        {provider.id && (
          <div className="absolute top-3 end-3 z-10">
            <FavoriteButton providerId={provider.id} className="h-9 w-9 bg-background hover:bg-muted" />
          </div>
        )}
        <div className="space-y-4 p-4">
          <Link to={provider.id ? `/provider/${provider.id}` : "#"} aria-disabled={!provider.id} tabIndex={provider.id ? 0 : -1} className="flex w-full items-start gap-3 pe-10 text-start rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-14 w-14 ring-2 ring-primary/10 ring-offset-2 ring-offset-card transition-transform duration-300 group-hover:scale-105">
              <AvatarImage src={provider.avatar_url || undefined} alt={`${provider.business_name || "Service provider"} profile photo`} />
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-heading text-lg font-bold tracking-tight text-foreground">{provider.business_name}</h3>
              <p className="truncate text-sm capitalize text-muted-foreground">
                {provider.specialization || provider.category}
              </p>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-primary text-primary" strokeWidth={1.5} />
                <span className="font-medium text-foreground">{avgRating > 0 ? avgRating.toFixed(1) : "New"}</span>
                {reviewCount > 0 && <span className="text-muted-foreground">({reviewCount})</span>}
                {provider.years_experience ? <span className="text-muted-foreground">· {provider.years_experience} yrs</span> : null}
              </div>
            </div>
          </Link>

          {(provider.verification_status === 'verified' || provider.availability_24_7) && (
            <div className="flex flex-wrap gap-2">
              {provider.verification_status === 'verified' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} /> Verified
                </span>
              )}
              {provider.availability_24_7 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emergency/10 px-2.5 py-1 text-xs font-medium text-emergency">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.75} /> 24/7
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
            <div>
              <span className="text-xl font-extrabold tracking-tight text-foreground">Rs. {provider.hourly_rate ?? 0}</span>
              <span className="text-sm text-muted-foreground">/hr</span>
            </div>
            <Button className="h-11 px-6" onClick={handleBook}>
              <CalendarPlus className="me-1.5 h-4 w-4" strokeWidth={1.75} /> Book
            </Button>
          </div>
        </div>
      </MotionCard>

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
