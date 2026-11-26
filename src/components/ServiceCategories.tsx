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
    <section className="relative overflow-hidden bg-muted/25 px-4 py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Find the right professional
          </p>

          <h2 className="text-4xl font-extrabold tracking-[-0.045em] text-foreground sm:text-5xl">
            Popular Services
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Browse trusted professionals by service category and find the help
            you need near you.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
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
                className={`group relative min-h-40 cursor-pointer overflow-hidden rounded-[1.6rem] border border-border/60 bg-card/75 p-5 shadow-[0_8px_30px_-22px_hsl(var(--foreground)/0.24)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/35 hover:bg-card hover:shadow-[0_22px_55px_-25px_hsl(var(--primary)/0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-44 sm:p-6 ${category.key === "electrical" || category.key === "plumbing" ? "sm:col-span-1 lg:min-h-52" : ""}`}`
              >
                <div className="relative flex h-full flex-col items-start text-start">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/15 to-accent/10 text-primary shadow-inner transition-all duration-500 group-hover:rotate-[-6deg] group-hover:scale-110 group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground sm:h-14 sm:w-14">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>

                  <h3 className="line-clamp-1 text-base font-bold tracking-tight text-card-foreground sm:text-lg">
                    {category.name}
                  </h3>

                  <p className="mt-2 text-xs font-medium text-muted-foreground sm:text-sm">
                    {providerCount.toLocaleString()}+ providers
                  </p>

                  <div className="mt-auto flex items-center gap-1 pt-5 text-xs font-bold text-primary transition-all duration-300 group-hover:translate-x-1">
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
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-5 py-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary"
          >
            View all service providers
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};