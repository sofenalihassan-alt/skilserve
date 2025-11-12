import { Wrench, Zap, Droplet, Paintbrush, Hammer, Shield, Sparkles, Car } from "lucide-react";
import { Card } from "@/components/ui/card";

const categories = [
  { icon: Zap, name: "Electrician", count: 234, color: "text-yellow-600" },
  { icon: Droplet, name: "Plumber", count: 189, color: "text-blue-600" },
  { icon: Paintbrush, name: "Painter", count: 156, color: "text-purple-600" },
  { icon: Hammer, name: "Carpenter", count: 203, color: "text-orange-600" },
  { icon: Sparkles, name: "Cleaner", count: 312, color: "text-pink-600" },
  { icon: Car, name: "Mechanic", count: 178, color: "text-red-600" },
  { icon: Shield, name: "Security", count: 145, color: "text-green-600" },
  { icon: Wrench, name: "Handyman", count: 267, color: "text-teal-600" },
];

export const ServiceCategories = () => {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Popular Services
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.name}
              className="p-6 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 border-2 hover:border-primary/50"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-4 rounded-full bg-secondary">
                  <category.icon className={`h-8 w-8 ${category.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} providers</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
