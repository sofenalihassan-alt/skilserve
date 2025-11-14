import { useState } from "react";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import ProvidersMap from "@/components/ProvidersMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Map, Filter } from "lucide-react";

const mockProviders = [
  {
    id: 1,
    name: "Ahmed Hassan",
    service: "Master Electrician",
    rating: 4.9,
    reviews: 127,
    distance: "1.2 km",
    hourlyRate: 800,
    experience: "8 years",
    specialization: ["Wiring", "Solar", "Industrial"],
    available: true,
    emergency: true,
  },
  {
    id: 2,
    name: "Fatima Malik",
    service: "Professional Plumber",
    rating: 4.8,
    reviews: 98,
    distance: "2.5 km",
    hourlyRate: 700,
    experience: "6 years",
    specialization: ["Pipework", "Drainage", "Bathroom"],
    available: true,
    emergency: false,
  },
  {
    id: 3,
    name: "Usman Ali",
    service: "Carpenter & Furniture",
    rating: 4.7,
    reviews: 85,
    distance: "3.8 km",
    hourlyRate: 650,
    experience: "10 years",
    specialization: ["Custom Furniture", "Doors", "Cabinets"],
    available: false,
    emergency: false,
  },
  {
    id: 4,
    name: "Aisha Khan",
    service: "House Cleaning Expert",
    rating: 4.9,
    reviews: 156,
    distance: "1.5 km",
    hourlyRate: 500,
    experience: "5 years",
    specialization: ["Deep Clean", "Sanitization", "Commercial"],
    available: true,
    emergency: true,
  },
];

const Providers = () => {
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showMap, setShowMap] = useState(false);

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
                <Button variant="ghost" size="sm">Clear</Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="electrician">Electrician</SelectItem>
                    <SelectItem value="plumber">Plumber</SelectItem>
                    <SelectItem value="carpenter">Carpenter</SelectItem>
                    <SelectItem value="cleaner">Cleaner</SelectItem>
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
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-4">Service Providers Near You</h1>
              <p className="text-muted-foreground">
                Found {mockProviders.length} providers within 5 km
              </p>
            </div>

            {showMap && (
              <div className="mb-6">
                <ProvidersMap />
              </div>
            )}

            <div className="grid gap-6">
              {mockProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Providers;
