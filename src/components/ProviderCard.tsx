import { Star, MapPin, Clock, Briefcase, Phone, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

// Safe provider type that excludes sensitive license_number field
type SafeServiceProvider = Omit<Database['public']['Tables']['service_providers']['Row'], 'license_number'>;

interface ProviderCardProps {
  provider: SafeServiceProvider;
}

export const ProviderCard = ({ provider }: ProviderCardProps) => {
  const navigate = useNavigate();
  return (
    <Card className="p-6 hover:shadow-lg transition-all">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{provider.business_name}</h3>
            </div>
            <p className="text-sm text-muted-foreground capitalize">{provider.category}</p>
            {provider.specialization && (
              <p className="text-xs text-muted-foreground">{provider.specialization}</p>
            )}
          </div>
          <Badge variant={provider.is_active ? "default" : "secondary"}>
            {provider.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {provider.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{provider.bio}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {provider.years_experience && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {provider.years_experience} years
            </div>
          )}
          <div className="font-semibold text-primary">
            Rs. {provider.hourly_rate}/hr
          </div>
          {provider.insurance_verified && (
            <Badge variant="outline" className="text-xs">Verified</Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1" 
            size="sm"
            onClick={() => navigate('/messages')}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button 
            variant="outline" 
            className="flex-1" 
            size="sm"
            onClick={() => navigate('/messages', { 
              state: { 
                providerId: provider.user_id,
                providerName: provider.business_name 
              }
            })}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
      </div>
    </Card>
  );
};
