import { Star, MapPin, Clock, Briefcase, Phone, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProviderCardProps {
  provider: {
    id: number;
    name: string;
    service: string;
    rating: number;
    reviews: number;
    distance: string;
    hourlyRate: number;
    experience: string;
    specialization: string[];
    available: boolean;
    emergency: boolean;
  };
}

export const ProviderCard = ({ provider }: ProviderCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{provider.name}</h3>
              {provider.emergency && (
                <Badge variant="destructive" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  24/7
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{provider.service}</p>
          </div>
          <Badge variant={provider.available ? "default" : "secondary"}>
            {provider.available ? "Available" : "Busy"}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-semibold">{provider.rating}</span>
            <span className="text-muted-foreground">({provider.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {provider.distance}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            {provider.experience}
          </div>
          <div className="font-semibold text-primary">
            Rs. {provider.hourlyRate}/hr
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {provider.specialization.map((spec) => (
            <Badge key={spec} variant="outline" className="text-xs">
              {spec}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
      </div>
    </Card>
  );
};
