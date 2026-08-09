import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, Phone, Clock, MapPin, MessageSquareText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Seo from "@/components/Seo";

interface EmergencyProvider {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  hourly_rate: number;
  years_experience: number;
  specialization: string;
  availability_24_7: boolean;
  avatar_url: string | null;
}

const Emergency = () => {
  const [providers, setProviders] = useState<EmergencyProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { fetchEmergencyProviders(); }, []);

  const fetchEmergencyProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("public_service_providers")
      .select("*")
      .eq("is_active", true)
      .eq("availability_24_7", true);

    if (error) {
      toast({ title: "Error", description: "Failed to load emergency providers", variant: "destructive" });
    } else {
      setProviders((data as any[]) || []);
    }
    setLoading(false);
  };

  const handleEmergencyCall = async (provider: EmergencyProvider) => {
    const { data } = await supabase.from('profiles').select('phone').eq('id', provider.user_id).maybeSingle();
    const phone = data?.phone;
    if (!phone) {
      toast({ title: "No Phone", description: "This provider hasn't added a phone number yet.", variant: "destructive" });
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      window.open(`tel:${cleanPhone}`, '_self');
    } else {
      window.open(`https://wa.me/${cleanPhone.replace('+', '')}`, '_blank');
    }
    toast({ title: "Emergency Call", description: `Connecting you with ${provider.business_name}...` });
  };

  const getInitials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Seo title={"24/7 Emergency Services | Skill Serve"} description={"Need urgent help? Find verified 24/7 emergency plumbers, electricians and repair professionals available right now in your area."} />
      <Header />
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <AlertCircle className="h-8 w-8 text-emergency" />
            <h1 className="text-3xl md:text-4xl font-bold text-center">24/7 Emergency Services</h1>
          </div>
          <Card className="p-6 mb-12 bg-emergency/5 border-emergency/20">
            <p className="text-center text-lg">
              Need urgent help? Our verified emergency service providers are available round the clock.
              Only providers who have opted in for 24/7 availability are shown here.
            </p>
          </Card>

          {loading ? (
            <div className="text-center py-12"><p className="text-muted-foreground">Loading emergency providers...</p></div>
          ) : providers.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Emergency Providers Available</h3>
              <p className="text-muted-foreground">No providers have opted for 24/7 emergency availability yet.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Card key={provider.id} className="p-6 border-2 border-emergency/20 hover:border-emergency/40 transition-all hover:shadow-lg hover:shadow-emergency/20">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={provider.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary font-bold">{getInitials(provider.business_name || "?")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg">{provider.business_name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{provider.category?.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Badge className="bg-success">
                        <Clock className="h-3 w-3 mr-1" />24/7
                      </Badge>
                    </div>
                    {provider.specialization && (
                      <p className="text-sm text-muted-foreground">{provider.specialization}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />Nearby</span>
                      {provider.years_experience && <span>{provider.years_experience} years exp</span>}
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground mb-2">PKR {provider.hourly_rate}/hour</p>
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-emergency hover:bg-emergency/90" onClick={() => handleEmergencyCall(provider)}>
                          <Phone className="h-4 w-4 mr-2" />Call
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => {
                          if (!user) { navigate('/auth'); return; }
                          navigate('/messages', { state: { providerId: provider.user_id, providerName: provider.business_name } });
                        }}>
                          <MessageSquareText className="h-4 w-4 mr-2" />Msg
                        </Button>
                      </div>
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
