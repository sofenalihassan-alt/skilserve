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
import { Map, Filter, Search, MessageSquare, RefreshCw } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Seo
        title={"Browse Service Providers | Skill Serve"}
        description={"Search and filter verified local service providers by category, rating, price and distance. Book trusted professionals in minutes on Skill Serve."}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Service Providers",
          description: "Directory of verified local service providers on Skill Serve.",
          url: "https://skillserveweb.lovable.app/providers",
        }}
      />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80 space-y-6">
            <div className="bg-card rounded-lg p-6 border space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><Filter className="h-5 w-5" strokeWidth={1.5} />Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <Input placeholder="Search providers..." className="ps-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="All Services" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="carpentry">Carpentry</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="landscaping">Landscaping</SelectItem>
                    <SelectItem value="handyman">Handyman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium">Price Range (Rs/hr)</label>
                <Slider value={priceRange} onValueChange={setPriceRange} max={2000} step={50} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Rs. {priceRange[0]}</span>
                  <span>Rs. {priceRange[1]}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Rating</label>
                <Select value={String(minRating)} onValueChange={(v) => setMinRating(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="3">3★ &amp; up</SelectItem>
                    <SelectItem value="4">4★ &amp; up</SelectItem>
                    <SelectItem value="4.5">4.5★ &amp; up</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Experience</label>
                <Select value={String(minExperience)} onValueChange={(v) => setMinExperience(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any experience</SelectItem>
                    <SelectItem value="1">1+ years</SelectItem>
                    <SelectItem value="3">3+ years</SelectItem>
                    <SelectItem value="5">5+ years</SelectItem>
                    <SelectItem value="10">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label htmlFor="verified-only" className="text-sm font-medium">Verified providers only</label>
                <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <label htmlFor="available-247" className="text-sm font-medium">Available 24/7</label>
                <Switch id="available-247" checked={available247} onCheckedChange={setAvailable247} />
              </div>

              <div className="pt-2 border-t">
                <SavedSearches currentFilters={currentFilters} onApply={applySavedFilters} />
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowMap(!showMap)}>
              <Map className="h-4 w-4 mr-2" strokeWidth={1.5} />{showMap ? "Hide Map" : "Show Map View"}
            </Button>
          </aside>
          <main className="flex-1" ref={listRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            {/* Pull-to-refresh indicator */}
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
                    <RefreshCw className={`h-6 w-6 text-primary ${pullDistance > 60 ? 'text-primary' : 'text-muted-foreground'}`} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Service Providers Near You</h1>
                <p className="text-muted-foreground">
                  {loading ? 'Loading...' : `Found ${filteredProviders.length} providers`}
                  {category !== "all" && ` in ${category}`}
                </p>
              </div>
              <div className="w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {showMap && (loading ? <div className="mb-6"><MapSkeleton /></div> : <div className="mb-6"><ProvidersMap /></div>)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {loading ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProviderCardSkeleton key={i} />
                  ))}
                </>
              ) : filteredProviders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No providers found matching your filters</p>
              ) : (
                <AnimatePresence mode="wait">
                  {filteredProviders.map((provider, index) => (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
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
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
        aria-label="Give website feedback"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        type="website"
      />

      <LiveActivityToast />
    </div>
  );
};

export default Providers;
