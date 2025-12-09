import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface Provider {
  id: string;
  business_name: string;
  category: string;
  hourly_rate: number;
  specialization: string;
}

const ProvidersMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      const { data } = await supabase
        .from('service_providers')
        .select('id, user_id, business_name, category, hourly_rate, bio, years_experience, specialization, is_active, insurance_verified')
        .eq('is_active', true)
        .limit(20);
      
      if (data) setProviders(data);
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [73.0479, 33.6844], // Islamabad, Pakistan
      zoom: 12,
      pitch: 45,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add random markers for providers around Islamabad
    providers.forEach((provider, index) => {
      const offset = 0.02;
      const randomLng = 73.0479 + (Math.random() - 0.5) * offset;
      const randomLat = 33.6844 + (Math.random() - 0.5) * offset;

      const el = document.createElement('div');
      el.className = 'provider-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = 'hsl(217 91% 60%)';
      el.style.border = '3px solid hsl(180 100% 50%)';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 0 10px hsl(217 91% 60% / 0.5)';

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="color: hsl(222 47% 11%); padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${provider.business_name}</h3>
          <p style="font-size: 12px; margin-bottom: 4px;">${provider.category}</p>
          <p style="font-size: 12px;">PKR ${provider.hourly_rate}/hr</p>
          ${provider.specialization ? `<p style="font-size: 11px; color: hsl(222 47% 30%);">${provider.specialization}</p>` : ''}
        </div>`
      );

      new mapboxgl.Marker(el)
        .setLngLat([randomLng, randomLat])
        .setPopup(popup)
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
          <h3 className="text-xl font-bold">Enable Map View</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter your Mapbox public token to view providers on the map. Get your free token at{' '}
            <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              mapbox.com
            </a>
          </p>
          <div className="max-w-md mx-auto">
            <Input
              type="text"
              placeholder="pk.eyJ1Ij..."
              onChange={(e) => setMapboxToken(e.target.value)}
              className="text-center"
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-primary/20">
      <div ref={mapContainer} className="w-full h-[600px]" />
    </Card>
  );
};

export default ProvidersMap;
