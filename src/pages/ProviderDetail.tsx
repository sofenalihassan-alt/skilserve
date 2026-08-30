import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Star, Briefcase, ShieldCheck, Clock, Phone, MessageSquareText,
  CalendarPlus, Lock,
} from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { BookingDialog } from "@/components/BookingDialog";
import { PackagesList } from "@/components/PackagesList";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { ProviderAvailabilityView } from "@/components/ProviderAvailabilityView";
import { useLanguage } from "@/contexts/LanguageContext";
import Seo from "@/components/Seo";

const ProviderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [provider, setProvider] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewerNames, setReviewerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [hasConfirmedBooking, setHasConfirmedBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const { data: p } = await supabase
        .from("public_service_providers")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      setProvider(p);

      const { data: r } = await supabase
        .from("reviews")
        .select("*")
        .eq("provider_id", id)
        .order("created_at", { ascending: false })
        .limit(20);
      setReviews(r || []);

      const reviewerIds = (r || []).map((x: any) => x.user_id);
      if (reviewerIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", reviewerIds);
        const map: Record<string, string> = {};
        (profs || []).forEach((pr: any) => (map[pr.id] = pr.full_name || "User"));
        setReviewerNames(map);
      }

      if (user) {
        const { data: bk } = await supabase
          .from("bookings")
          .select("id")
          .eq("user_id", user.id)
          .eq("provider_id", id)
          .in("status", ["confirmed", "in_progress"])
          .limit(1);
        setHasConfirmedBooking(!!(bk && bk.length));
      }

      setLoading(false);
    };
    load();
  }, [id, user]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const canMessage = provider?.availability_24_7 || hasConfirmedBooking;

  const handleCall = async () => {
    if (!user) { navigate("/auth"); return; }
    const { data } = await supabase.from("profiles").select("phone").eq("id", provider.user_id).maybeSingle();
    const phone = data?.phone;
    if (!phone) {
      toast({ title: "No Phone", description: "Provider has not added a phone number.", variant: "destructive" });
      return;
    }
    const clean = phone.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${clean.replace("+", "")}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">{t("provider_not_found")}</p>
          <Button onClick={() => navigate("/providers")} className="mt-4">{t("browse_providers")}</Button>
        </div>
      </div>
    );
  }

  const initials = (provider.business_name || "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const seoTitle = `${provider.business_name} — ${provider.category} | Skill Serve`.slice(0, 60);
  const seoDescription = `Book ${provider.business_name}, a verified ${provider.category} professional on Skill Serve. View services, portfolio, reviews and availability.`.slice(0, 158);
  const providerJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: provider.business_name,
    description: provider.description || seoDescription,
    serviceType: provider.category,
    url: `https://skilserve.lovable.app/provider/${id}`,
    ...(provider.avatar_url ? { image: provider.avatar_url } : {}),
    ...(reviews.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(avgRating.toFixed(1)),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Seo title={seoTitle} description={seoDescription} type="profile" jsonLd={providerJsonLd} />
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </Button>

        {/* Hero */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <Avatar className="h-24 w-24 ring-2 ring-border">
                <AvatarImage src={provider.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold">{provider.business_name}</h1>
                    <p className="text-muted-foreground capitalize">{provider.category}{provider.specialization && ` · ${provider.specialization}`}</p>
                  </div>
                  <FavoriteButton providerId={provider.id} />
                </div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} />
                  ))}
                  <span className="text-sm text-muted-foreground">{avgRating > 0 ? avgRating.toFixed(1) : t("new_provider")} ({reviews.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {provider.verification_status === "verified" && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/30">
                      <ShieldCheck className="h-3 w-3" /> {t("verified")}
                    </span>
                  )}
                  {provider.insurance_verified && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                      <ShieldCheck className="h-3 w-3" /> {t("insured")}
                    </span>
                  )}
                  {provider.availability_24_7 && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-orange-500/10 text-orange-600">
                      <Clock className="h-3 w-3" /> 24/7
                    </span>
                  )}
                  {provider.years_experience && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary">
                      <Briefcase className="h-3 w-3" /> {provider.years_experience}y exp
                    </span>
                  )}
                </div>
              </div>
            </div>

            {provider.bio && <p className="text-sm text-muted-foreground mt-5 leading-relaxed">{provider.bio}</p>}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
              <span className="text-2xl font-bold text-primary">
                Rs. {provider.hourly_rate}<span className="text-xs font-normal text-muted-foreground">/hr</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => user ? setBookingOpen(true) : navigate("/auth")} className="gap-2">
                  <CalendarPlus className="h-4 w-4" /> {t("book")}
                </Button>
                <Button variant="outline" onClick={handleCall} className="gap-2">
                  <Phone className="h-4 w-4" /> {t("call")}
                </Button>
                {canMessage ? (
                  <Button variant="outline" onClick={() => navigate("/messages", { state: { providerId: provider.user_id, providerName: provider.business_name } })} className="gap-2">
                    <MessageSquareText className="h-4 w-4" /> {t("message")}
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="gap-2 opacity-50">
                    <Lock className="h-4 w-4" /> {t("message")}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Packages */}
        <Card>
          <CardHeader><CardTitle className="text-lg">{t("service_packages")}</CardTitle></CardHeader>
          <CardContent>
            <PackagesList providerId={provider.id} />
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardHeader><CardTitle className="text-lg">{t("portfolio")}</CardTitle></CardHeader>
          <CardContent>
            <PortfolioGallery providerId={provider.id} />
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Availability</CardTitle></CardHeader>
          <CardContent>
            <ProviderAvailabilityView providerId={provider.id} />
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader><CardTitle className="text-lg">{t("reviews")} ({reviews.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("no_reviews")}</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{reviewerNames[r.user_id] || "User"}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

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
    </div>
  );
};

export default ProviderDetail;
