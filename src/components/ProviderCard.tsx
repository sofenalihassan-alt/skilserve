import { Star, MapPin, Clock, Briefcase, Phone, MessageSquareText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type SafeServiceProvider = Omit<Database['public']['Tables']['service_providers']['Row'], 'license_number'>;

interface ProviderCardProps {
  provider: SafeServiceProvider;
}

export const ProviderCard = ({ provider }: ProviderCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const is247 = (provider as any).availability_24_7;

  const handleCall = async () => {
    if (!user) { navigate('/auth'); return; }
    // Fetch provider's phone
    const { data } = await supabase.from('profiles').select('phone').eq('id', provider.user_id).maybeSingle();
    const phone = data?.phone;
    if (!phone) {
      toast({ title: 'No Phone', description: 'This provider has not added a phone number.', variant: 'destructive' });
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    // Record call
    await supabase.from('call_history' as any).insert({
      caller_id: user.id, receiver_id: provider.user_id, call_type: isMobile ? 'direct' : 'whatsapp', phone_number: cleanPhone,
    } as any);

    if (isMobile) {
      const useWhatsApp = confirm('Open WhatsApp? (Cancel for direct call)');
      if (useWhatsApp) {
        window.open(`https://wa.me/${cleanPhone.replace('+', '')}`, '_blank');
      } else {
        window.open(`tel:${cleanPhone}`, '_self');
      }
    } else {
      window.open(`https://wa.me/${cleanPhone.replace('+', '')}`, '_blank');
    }
  };

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
          <div className="flex flex-col items-end gap-1">
            <Badge variant={provider.is_active ? "default" : "secondary"}>
              {provider.is_active ? "Active" : "Inactive"}
            </Badge>
            {is247 && (
              <Badge variant="outline" className="text-xs border-accent text-accent">
                <Clock className="h-3 w-3 mr-1" />24/7
              </Badge>
            )}
          </div>
        </div>

        {provider.bio && <p className="text-sm text-muted-foreground line-clamp-2">{provider.bio}</p>}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {provider.years_experience && (
            <div className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{provider.years_experience} years</div>
          )}
          <div className="font-semibold text-primary">Rs. {provider.hourly_rate}/hr</div>
          {provider.insurance_verified && <Badge variant="outline" className="text-xs">Verified</Badge>}
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" size="sm" onClick={handleCall}>
            <Phone className="h-4 w-4 mr-2" />Call
          </Button>
          <Button variant="outline" className="flex-1" size="sm"
            onClick={() => navigate('/messages', { state: { providerId: provider.user_id, providerName: provider.business_name } })}>
            <MessageSquareText className="h-4 w-4 mr-2" />Message
          </Button>
        </div>
      </div>
    </Card>
  );
};
