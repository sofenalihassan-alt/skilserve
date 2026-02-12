import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-12 sm:py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground">
            {t('hero_title_1')}
            <span className="block text-primary mt-2">{t('hero_title_2')}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('hero_subtitle')}
          </p>
          
          <div className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto mt-8">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder={t('search_placeholder')} 
                className="ps-10 h-12"
              />
            </div>
            <div className="relative md:w-64">
              <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder={t('location_placeholder')} 
                className="ps-10 h-12"
              />
            </div>
            <Button size="lg" className="h-12 px-8">
              {t('search')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
