import { useEffect, useState } from "react";
import {
  Wrench,
  Zap,
  Droplet,
  Paintbrush,
  Hammer,
  Shield,
  Sparkles,
  Flame,
  Home,
  Bug,
  Settings,
  Truck,
  Camera,
  Grid3X3,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const categoryConfig = [
  { key: "electrical", icon: Zap, name: "Electrician", fallback: 68 },
  { key: "plumbing", icon: Droplet, name: "Plumber", fallback: 55 },
  { key: "painting", icon: Paintbrush, name: "Painter", fallback: 42 },
  { key: "carpentry", icon: Hammer, name: "Carpenter", fallback: 37 },
  { key: "cleaning", icon: Sparkles, name: "Cleaner", fallback: 63 },
  { key: "hvac", icon: Flame, name: "HVAC", fallback: 48 },
  { key: "landscaping", icon: Shield, name: "Landscaping", fallback: 31 },
  { key: "handyman", icon: Wrench, name: "Handyman", fallback: 45 },
  { key: "roofing", icon: Home, name: "Roofing", fallback: 29 },
  { key: "pest_control", icon: Bug, name: "Pest Control", fallback: 34 },
  {
    key: "appliance_repair",
    icon: Settings,
    name: "Appliance Repair",
    fallback: 41,
  },
  {
    key: "moving",
    icon: Truck,
    name: "Movers & Packers",
    fallback: 38,
  },
  {
    key: "security",
    icon: Camera,
    name: "Security & CCTV",
    fallback: 26,
  },
  {
    key: "tiling",
    icon: Grid3X3,
    name: "Tiling & Flooring",
    fallback: 33,
  },
];

export const ServiceCategories = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from("public_service_providers")
        .select("category")
        .eq("is_active", true);

      if (!error && data) {
        const grouped: Record<string, number> = {};

        data.forEach((provider) => {
          if (provider.category) {
            grouped[provider.category] =
              (grouped[provider.category] || 0) + 1;
          }
        });

        setCounts(grouped);
      }
    };

    fetchCounts();
  }, []);

  const handleCategoryClick = (categoryKey: string) => {
    navigate(`/providers?category=${categoryKey}`);
  };

  const handleCategoryKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    categoryKey: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCategoryClick(categoryKey);
    }
  };

  return (
    <section className="bg-muted/30 px-4 py-16 sm:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Find the right professional
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Popular Services
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Browse trusted professionals by service category and find the help
            you need near you.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
          {categoryConfig.map((category) => {
            const Icon = category.icon;
            const providerCount =
              counts[category.key] || category.fallback;

            return (
              <Card
                key={category.key}
                role="button"
                tabIndex={0}
                onClick={() => handleCategoryClick(category.key)}
                onKeyDown={(event) =>
                  handleCategoryKeyDown(event, category.key)
                }
                className="group relative cursor-pointer overflow-hidden border-border/70 bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground sm:h-14 sm:w-14">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>

                  <h3 className="line-clamp-1 text-sm font-semibold text-card-foreground sm:text-base">
                    {category.name}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {providerCount.toLocaleString()}+ providers
                  </p>

                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span>View providers</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate("/providers")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View all service providers
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};