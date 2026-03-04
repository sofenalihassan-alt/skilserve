import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (locationQuery.trim()) params.set("location", locationQuery.trim());
    navigate(`/providers?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-8 sm:py-14 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-3 sm:space-y-5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            {t('hero_title_1')}
            <span className="block text-primary mt-1">{t('hero_title_2')}</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('hero_subtitle')}
          </p>
          
          <div className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto mt-8">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder={t('search_placeholder')} 
                className="ps-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="relative md:w-64">
              <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder={t('location_placeholder')} 
                className="ps-10 h-12"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button size="lg" className="h-12 px-8" onClick={handleSearch}>
              {t('search')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
