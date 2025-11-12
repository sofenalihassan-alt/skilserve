import { AlertCircle, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const emergencyProviders = [
  {
    id: 1,
    name: "Ahmed Khan",
    service: "Emergency Plumber",
    rating: 4.9,
    distance: "1.2 km",
    experience: "8 years",
    available: true,
  },
  {
    id: 2,
    name: "Fatima Ali",
    service: "Emergency Electrician",
    rating: 4.8,
    distance: "2.5 km",
    experience: "6 years",
    available: true,
  },
  {
    id: 3,
    name: "Hassan Malik",
    service: "Emergency HVAC",
    rating: 4.7,
    distance: "3.1 km",
    experience: "10 years",
    available: true,
  },
];

export const EmergencyServices = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-emergency/5 to-emergency/10">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <AlertCircle className="h-8 w-8 text-emergency" />
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            24/7 Emergency Services
          </h2>
        </div>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Need urgent help? Our verified emergency service providers are available round the clock.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {emergencyProviders.map((provider) => (
            <Card key={provider.id} className="p-6 border-2 border-emergency/20 hover:border-emergency/40 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">{provider.service}</p>
                  </div>
                  <Badge className="bg-success">
                    <Clock className="h-3 w-3 mr-1" />
                    24/7
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    ⭐ {provider.rating}
                  </span>
                  <span>{provider.distance}</span>
                  <span>{provider.experience}</span>
                </div>
                
                <Button className="w-full bg-emergency hover:bg-emergency/90">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
