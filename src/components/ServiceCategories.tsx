import { useEffect, useState } from "react";
import { Wrench, Zap, Droplet, Paintbrush, Hammer, Shield, Sparkles, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const categoryConfig = [
  { key: "electrical", icon: Zap, name: "Electrician", color: "text-yellow-600" },
  { key: "plumbing", icon: Droplet, name: "Plumber", color: "text-blue-600" },
  { key: "painting", icon: Paintbrush, name: "Painter", color: "text-purple-600" },
  { key: "carpentry", icon: Hammer, name: "Carpenter", color: "text-orange-600" },
  { key: "cleaning", icon: Sparkles, name: "Cleaner", color: "text-pink-600" },
  { key: "hvac", icon: Flame, name: "HVAC", color: "text-red-600" },
  { key: "landscaping", icon: Shield, name: "Landscaping", color: "text-green-600" },
  { key: "handyman", icon: Wrench, name: "Handyman", color: "text-teal-600" },
];

export const ServiceCategories = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from('public_service_providers')
        .select('category')
        .eq('is_active', true);

      if (!error && data) {
        const grouped: Record<string, number> = {};
        data.forEach((p) => {
          if (p.category) {
            grouped[p.category] = (grouped[p.category] || 0) + 1;
          }
        });
        setCounts(grouped);
      }
    };
    fetchCounts();
  }, []);

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Popular Services
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {categoryConfig.map((category) => (
            <Card 
              key={category.key}
              className="p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 border-2 hover:border-primary/50"
              onClick={() => navigate(`/providers?category=${category.key}`)}
            >
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className="p-3 sm:p-4 rounded-full bg-secondary">
                  <category.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${category.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-lg">{category.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {counts[category.key] || 0} providers
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
