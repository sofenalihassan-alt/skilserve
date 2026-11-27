import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import ProvidersMap from "@/components/ProvidersMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Map,
  Filter,
  Search,
  MessageSquare,
  RefreshCw,
  SlidersHorizontal,
  X,
  ArrowUpDown,
} 
from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { LiveActivityToast } from "@/components/LiveActivityToast";
import { useToast } from "@/hooks/use-toast";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { ProviderCardSkeleton, MapSkeleton } from "@/components/ProviderCardSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { SavedSearches, type SearchFilters } from "@/components/SavedSearches";
import Seo from "@/components/Seo";

interface ProviderWithAvatar {
  id: string | null;
  user_id: string | null;
  business_name: string | null;
  category: string | null;
  specialization: string | null;
  bio: string | null;
  hourly_rate: number | null;
  years_experience: number | null;
  is_active: boolean | null;
  insurance_verified: boolean | null;
  availability_24_7: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  avatar_url: string | null;
  is_approved: boolean | null;
  verification_status?: string | null;
}

interface ReviewStats {
  [providerId: string]: { avg: number; count: number };
}

const Providers = () => {
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState<ProviderWithAvatar[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderWithAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showMap, setShowMap] = useState(false);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [available247, setAvailable247] = useState(false);
  const [minExperience, setMinExperience] = useState(0);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (listRef.current && listRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || isRefreshing) return;
    if (listRef.current && listRef.current.scrollTop === 0) {
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0) setPullDistance(Math.min(delta * 0.5, 100));
    }
  }, [isMobile, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(60);
      await Promise.all([fetchProviders(), fetchReviewStats()]);
      setIsRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, isRefreshing]);

  useEffect(() => {
    const cat = searchParams.get("category");
    const search = searchParams.get("search");
    if (cat) setCategory(cat);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => { fetchProviders(); fetchReviewStats(); }, []);
  useEffect(() => { applyFiltersAndSort(); }, [providers, category, priceRange, sortBy, searchQuery, reviewStats, minRating, verifiedOnly, available247, minExperience]);

  const fetchProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('public_service_providers')
      .select('*');

    if (error) {
      toast({ title: 'Error', description: 'Failed to load providers', variant: 'destructive' });
    } else {
      setProviders((data as ProviderWithAvatar[]) || []);
    }
    setLoading(false);
  };

  const fetchReviewStats = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('provider_id, rating');

    if (!error && data) {
      const stats: ReviewStats = {};
      for (const r of data) {
        if (!stats[r.provider_id]) {
          stats[r.provider_id] = { avg: 0, count: 0 };
        }
        stats[r.provider_id].count++;
        stats[r.provider_id].avg += r.rating;
      }
      // Convert sum to average
      for (const key of Object.keys(stats)) {
        stats[key].avg = stats[key].avg / stats[key].count;
      }
      setReviewStats(stats);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...providers];
    if (category !== "all") filtered = filtered.filter(p => p.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.business_name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.specialization?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q)
      );
    }
    filtered = filtered.filter(p => (p.hourly_rate ?? 0) >= priceRange[0] && (p.hourly_rate ?? 0) <= priceRange[1]);
    if (minRating > 0) filtered = filtered.filter(p => (reviewStats[p.id || '']?.avg || 0) >= minRating);
    if (verifiedOnly) filtered = filtered.filter(p => p.verification_status === 'verified');
    if (available247) filtered = filtered.filter(p => p.availability_24_7 === true);
    if (minExperience > 0) filtered = filtered.filter(p => (p.years_experience || 0) >= minExperience);
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0);
        case 'price-high': return (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0);
        case 'experience': return (b.years_experience || 0) - (a.years_experience || 0);
        case 'newest': return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'rating':
          return (reviewStats[b.id || '']?.avg || 0) - (reviewStats[a.id || '']?.avg || 0);
        default: return 0;
      }
    });
    setFilteredProviders(filtered);
  };

  const currentFilters: SearchFilters = {
    searchQuery, category, priceRange, minRating, verifiedOnly, available247, minExperience, sortBy,
  };

  const applySavedFilters = (f: SearchFilters) => {
    setSearchQuery(f.searchQuery ?? "");
    setCategory(f.category ?? "all");
    setPriceRange(Array.isArray(f.priceRange) && f.priceRange.length === 2 ? f.priceRange : [0, 2000]);
    setMinRating(f.minRating ?? 0);
    setVerifiedOnly(!!f.verifiedOnly);
    setAvailable247(!!f.available247);
    setMinExperience(f.minExperience ?? 0);
    setSortBy(f.sortBy ?? "rating");
  };

  const clearFilters = () => {
    setCategory("all");
    setPriceRange([0, 2000]);
    setSortBy("rating");
    setSearchQuery("");
    setMinRating(0);
    setVerifiedOnly(false);
    setAvailable247(false);
    setMinExperience(0);
  };

  const activeFilterCount =
    (category !== "all" ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) + (minExperience > 0 ? 1 : 0) + (verifiedOnly ? 1 : 0) + (available247 ? 1 : 0);
  const n = filteredProviders.length;
  const showLabel = loading ? "Loading providers…" : `Show ${n} Provider${n === 1 ? "" : "s"}`;
  const categories = ["all","electrical","plumbing","carpentry","cleaning","painting","hvac","landscaping","handyman"];
  const chip = (active: boolean) =>
    `h-9 rounded-full border px-3.5 text-sm font-medium transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/40"}`;

  const filterFields = (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Service</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className={chip(category === c) + " capitalize"} aria-pressed={category === c}>
              {c === "all" ? "All" : c === "hvac" ? "HVAC" : c}
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Price per hour</h3>
          <span className="text-sm text-muted-foreground">Rs. {priceRange[0]} – {priceRange[1]}</span>
        </div>
        <Slider value={priceRange} onValueChange={setPriceRange} max={2000} step={50} aria-label="Price range" />
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Minimum rating</h3>
        <div className="flex flex-wrap gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button key={r} type="button" onClick={() => setMinRating(r)} className={chip(minRating === r)} aria-pressed={minRating === r}>
              {r === 0 ? "Any" : `${r}★ & up`}
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Experience</h3>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 3, 5, 10].map((y) => (
            <button key={y} type="button" onClick={() => setMinExperience(y)} className={chip(minExperience === y)} aria-pressed={minExperience === y}>
              {y === 0 ? "Any" : `${y}+ yrs`}
            </button>
          ))}
        </div>
      </section>
      <section className="divide-y divide-border rounded-xl border border-border">
        <label htmlFor="verified-only" className="flex min-h-12 items-center justify-between px-4">
          <span className="text-sm font-medium">Verified providers only</span>
          <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
        </label>
        <label htmlFor="available-247" className="flex min-h-12 items-center justify-between px-4">
          <span className="text-sm font-medium">Available 24/7</span>
          <Switch id="available-247" checked={available247} onCheckedChange={setAvailable247} />
        </label>
      </section>
      <section className="border-t border-border pt-5">
        <SavedSearches currentFilters={currentFilters} onApply={applySavedFilters} />
      </section>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-0">
      <Seo
        title={"Browse Service Providers | Skill Serve"}
        description={"Search and filter verified local service providers by category, rating, price and distance. Book trusted professionals in minutes on Skill Serve."}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Service Providers",
          description: "Directory of verified local service providers on Skill Serve.",
          url: "https://skilserve.lovable.app/providers",
        }}
      />
        <Header />

        <LiveActivityToast />

        <div className="container mx-auto px-4 py-6 md:py-8">
        <div>
        <div className="mb-4">
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Find a provider</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${filteredProviders.length} providers available`}
            {category !== "all" && ` in ${category}`}
          </p>
        </div>

        <div className="sticky top-14 z-30 -mx-4 mb-5 border-b border-border bg-background px-4 py-3 md:top-16">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search plumber, electrician, cleaner…"
              aria-label="Search providers"
              className="h-12 ps-10 pe-10 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} aria-label="Clear search" className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setFiltersOpen(true)} className="h-9 gap-1.5 rounded-full">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ms-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">{activeFilterCount}</span>
              )}
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger aria-label="Sort by" className="h-9 w-auto gap-1.5 rounded-full px-3 text-sm">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top rated</SelectItem>
                <SelectItem value="price-low">Lowest price</SelectItem>
                <SelectItem value="price-high">Highest price</SelectItem>
                <SelectItem value="experience">Most experienced</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
            <Button variant={showMap ? "secondary" : "ghost"} size="sm" onClick={() => setShowMap(!showMap)} className="ms-auto h-9 gap-1.5 rounded-full px-2.5 sm:px-3" aria-pressed={showMap} aria-label={showMap ? "Hide map" : "Show map"}>
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">{showMap ? "Hide map" : "Map"}</span>
            </Button>
          </div>
        </div>

        {isMobile ? (
          <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DrawerContent className="flex max-h-[88dvh] flex-col">
              <DrawerHeader className="flex items-center justify-between pb-2 text-start">
                <DrawerTitle>Filters</DrawerTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button>
              </DrawerHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{filterFields}</div>
              <div className="shrink-0 border-t border-border bg-background p-4 pb-safe">
                <Button className="h-12 w-full text-base" onClick={() => setFiltersOpen(false)} disabled={loading}>{showLabel}</Button>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
              <SheetHeader className="flex-row items-center justify-between space-y-0 border-b border-border p-5">
                <SheetTitle>Filters</SheetTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="me-8">Clear all</Button>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-5">{filterFields}</div>
              <div className="border-t border-border p-5">
                <Button className="h-11 w-full" onClick={() => setFiltersOpen(false)}>{showLabel}</Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
          <main id="main-content" tabIndex={-1} className="flex-1" ref={listRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <AnimatePresence>
              {(pullDistance > 0 || isRefreshing) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: pullDistance || 60 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center overflow-hidden"
                >
                  <motion.div
                    animate={{ rotate: isRefreshing ? 360 : pullDistance * 3 }}
                    transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0 }}
                  >
                    <RefreshCw className={`h-6 w-6 ${pullDistance > 60 ? 'text-primary' : 'text-muted-foreground'}`} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>


            {showMap && (loading ? <div className="mb-6"><MapSkeleton /></div> : <div className="mb-6"><ProvidersMap /></div>)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProviderCardSkeleton key={i} />
                  ))}
                </>
              ) : filteredProviders.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-border py-12 text-center"><p className="font-medium">No providers match your filters</p><Button variant="link" onClick={clearFilters}>Clear all filters</Button></div>
              ) : (
                <AnimatePresence mode="wait">
                  {filteredProviders.map((provider, index) => (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: Math.min(index, 6) * 0.04,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <ProviderCard
                        provider={provider}
                        avgRating={reviewStats[provider.id || '']?.avg || 0}
                        reviewCount={reviewStats[provider.id || '']?.count || 0}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Website Feedback Button */}
      <button
        onClick={() => setFeedbackOpen(true)}
        className="fixed bottom-6 right-6 z-40 hidden md:flex bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
        aria-label="Give website feedback"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        type="website"
      />
    </div>
  );
};

export default Providers;