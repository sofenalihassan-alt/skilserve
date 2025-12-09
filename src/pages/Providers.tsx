import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import ProvidersMap from "@/components/ProvidersMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Map, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

// Explicitly exclude license_number from public display for security
type ServiceProvider = Omit<Database['public']['Tables']['service_providers']['Row'], 'license_number'>;

const Providers = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showMap, setShowMap] = useState(false);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [availability, setAvailability] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [providers, category, priceRange, sortBy, availability]);

  const fetchProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_providers')
      .select('id, user_id, business_name, category, hourly_rate, bio, years_experience, specialization, is_active, insurance_verified, created_at, updated_at')
      .eq('is_active', true);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load providers',
        variant: 'destructive'
      });
    } else {
      setProviders(data || []);
    }
    setLoading(false);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...providers];

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter(p => p.category === category);
    }

    // Filter by price range
    filtered = filtered.filter(p => 
      p.hourly_rate >= priceRange[0] && p.hourly_rate <= priceRange[1]
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.hourly_rate - b.hourly_rate;
        case 'price-high':
          return b.hourly_rate - a.hourly_rate;
        case 'experience':
          return (b.years_experience || 0) - (a.years_experience || 0);
        default:
          return 0;
      }
    });

    setFilteredProviders(filtered);
  };

  const clearFilters = () => {
    setCategory("all");
    setPriceRange([0, 2000]);
    setAvailability("all");
    setSortBy("rating");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 space-y-6">
            <div className="bg-card rounded-lg p-6 border space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Distance</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Within 5 km" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Within 1 km</SelectItem>
                    <SelectItem value="3">Within 3 km</SelectItem>
                    <SelectItem value="5">Within 5 km</SelectItem>
                    <SelectItem value="10">Within 10 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Price Range (Rs/hr)</label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={2000}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Rs. {priceRange[0]}</span>
                  <span>Rs. {priceRange[1]}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="available">Available Now</SelectItem>
                    <SelectItem value="emergency">24/7 Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowMap(!showMap)}
            >
              <Map className="h-4 w-4 mr-2" />
              {showMap ? "Hide Map" : "Show Map View"}
            </Button>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Service Providers Near You</h1>
                <p className="text-muted-foreground">
                  {loading ? 'Loading...' : `Found ${filteredProviders.length} providers`}
                </p>
              </div>
              <div className="w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showMap && (
              <div className="mb-6">
                <ProvidersMap />
              </div>
            )}

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
