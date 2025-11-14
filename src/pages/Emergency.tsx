import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Phone, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EmergencyProvider {
  id: string;
  business_name: string;
  category: string;
  hourly_rate: number;
  years_experience: number;
  specialization: string;
}

const Emergency = () => {
  const [providers, setProviders] = useState<EmergencyProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencyProviders();
  }, []);

  const fetchEmergencyProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("is_active", true)
      .in("category", ["plumbing", "electrical", "hvac"])
      .limit(6);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load emergency providers",
        variant: "destructive"
      });
    } else {
      setProviders(data || []);
    }
    setLoading(false);
  };

  const handleEmergencyCall = (provider: EmergencyProvider) => {
    toast({
      title: "Emergency Service",
      description: `Connecting you with ${provider.business_name}...`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <AlertCircle className="h-8 w-8 text-emergency" />
            <h1 className="text-3xl md:text-4xl font-bold text-center">
              24/7 Emergency Services
            </h1>
          </div>
          
          <Card className="p-6 mb-12 bg-emergency/5 border-emergency/20">
            <p className="text-center text-lg">
              Need urgent help? Our verified emergency service providers are available round the clock.
              All providers are background-checked and ready to respond immediately.
            </p>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading emergency providers...</p>
            </div>
          ) : providers.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Emergency Providers Available</h3>
              <p className="text-muted-foreground">
                Please check back later or contact support for immediate assistance.
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Card key={provider.id} className="p-6 border-2 border-emergency/20 hover:border-emergency/40 transition-all hover:shadow-lg hover:shadow-emergency/20">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{provider.business_name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{provider.category.replace('_', ' ')}</p>
                      </div>
                      <Badge className="bg-success">
                        <Clock className="h-3 w-3 mr-1" />
                        24/7
                      </Badge>
                    </div>
                    
                    {provider.specialization && (
                      <p className="text-sm text-muted-foreground">
                        {provider.specialization}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Nearby
                      </span>
                      {provider.years_experience && (
                        <span>{provider.years_experience} years exp</span>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        PKR {provider.hourly_rate}/hour
                      </p>
                      <Button 
                        className="w-full bg-emergency hover:bg-emergency/90"
                        onClick={() => handleEmergencyCall(provider)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Emergency Call
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Emergency;
