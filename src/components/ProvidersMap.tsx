import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Phone, MessageCircle, CalendarPlus } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';

interface Provider {
  id: string;
  user_id: string | null;
  business_name: string;
  category: string;
  hourly_rate: number;
  specialization: string;
  availability_24_7: boolean | null;
  avatar_url: string | null;
  bio: string | null;
  years_experience: number | null;
}

// Public Mapbox token supplied by the app owner via environment config.
const mapboxToken = (import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN as string | undefined) ?? '';

const ProvidersMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviders = async () => {
      const { data } = await supabase
        .from('public_service_providers')
        .select('*')
        .limit(20);
      if (data) setProviders(data as Provider[]);
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [73.0479, 33.6844],
      zoom: 12,
      pitch: 45,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    providers.forEach((provider) => {
      const offset = 0.02;
      const randomLng = 73.0479 + (Math.random() - 0.5) * offset;
      const randomLat = 33.6844 + (Math.random() - 0.5) * offset;

      const el = document.createElement('div');
      el.className = 'provider-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = 'hsl(var(--primary))';
      el.style.border = '3px solid hsl(var(--accent))';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 0 10px hsl(var(--primary) / 0.5)';

      el.addEventListener('click', () => {
        setSelectedProvider(provider);
        setDrawerOpen(true);
      });

      new mapboxgl.Marker(el)
        .setLngLat([randomLng, randomLat])
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, providers]);

  if (!mapboxToken) {
    return (
      <Card className="p-8 border border-primary/20">
        <div className="text-center space-y-4">
          <MapPin className="h-12 w-12 text-primary mx-auto" />
          <h3 className="text-xl font-bold">Map view unavailable</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            The map is not configured yet. Please browse providers in list view.
          </p>
        </div>
      </Card>
    );
  }


  return (
    <>
      <Card className="overflow-hidden border border-primary/20">
        <div ref={mapContainer} className="w-full h-[600px]" />
      </Card>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          {selectedProvider && (
            <>
              <DrawerHeader className="text-left">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/30">
                    <AvatarImage src={selectedProvider.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                      {selectedProvider.business_name?.charAt(0)?.toUpperCase() || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <DrawerTitle className="truncate">{selectedProvider.business_name}</DrawerTitle>
                      {selectedProvider.availability_24_7 && (
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                      )}
                    </div>
                    <DrawerDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="capitalize text-xs">{selectedProvider.category}</Badge>
                      <span className="text-sm font-medium text-primary">PKR {selectedProvider.hourly_rate}/hr</span>
                    </DrawerDescription>
                  </div>
                </div>
              </DrawerHeader>

              <div className="px-4 pb-2 space-y-3">
                {selectedProvider.specialization && (
                  <p className="text-sm text-muted-foreground">{selectedProvider.specialization}</p>
                )}
                {selectedProvider.bio && (
                  <p className="text-sm text-foreground/80">{selectedProvider.bio}</p>
                )}
                {selectedProvider.years_experience && (
                  <p className="text-xs text-muted-foreground">{selectedProvider.years_experience} years experience</p>
                )}
              </div>

              <DrawerFooter className="flex-row gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Phone className="h-4 w-4" />Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => {
                  setDrawerOpen(false);
                  navigate('/messages', { state: { providerId: selectedProvider.user_id, providerName: selectedProvider.business_name } });
                }}>
                  <MessageCircle className="h-4 w-4" />Message
                </Button>
                <Button size="sm" className="flex-1 gap-2" onClick={() => {
                  setDrawerOpen(false);
                  navigate(`/providers?search=${encodeURIComponent(selectedProvider.business_name)}`);
                }}>
                  <CalendarPlus className="h-4 w-4" />Book
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ProvidersMap;
