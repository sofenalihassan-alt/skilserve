import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import ProvidersMap from "@/components/ProvidersMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Map, Filter, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    const cat = searchParams.get("category");
    const search = searchParams.get("search");
    if (cat) setCategory(cat);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => { fetchProviders(); }, []);
  useEffect(() => { applyFiltersAndSort(); }, [providers, category, priceRange, sortBy, searchQuery]);

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
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0);
        case 'price-high': return (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0);
        case 'experience': return (b.years_experience || 0) - (a.years_experience || 0);
        default: return 0;
      }
    });
    setFilteredProviders(filtered);
  };

  const clearFilters = () => { setCategory("all"); setPriceRange([0, 2000]); setSortBy("rating"); setSearchQuery(""); };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80 space-y-6">
            <div className="bg-card rounded-lg p-6 border space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><Filter className="h-5 w-5" />Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowMap(!showMap)}>
              <Map className="h-4 w-4 mr-2" />{showMap ? "Hide Map" : "Show Map View"}
            </Button>
          </aside>
          <main className="flex-1">
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
                  </SelectContent>
                </Select>
              </div>
            </div>
            {showMap && <div className="mb-6"><ProvidersMap /></div>}
            <div className="grid gap-6">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading providers...</p>
              ) : filteredProviders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No providers found matching your filters</p>
              ) : (
                filteredProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Providers;
