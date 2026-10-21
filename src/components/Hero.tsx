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
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="block">{t("hero_title_1")}</span>
          <span className="block text-primary">
            {t("hero_title_2")}
          </span>
        </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {t("hero_subtitle")}
          </p>

          <div className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:mt-10 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("search_placeholder")}
                aria-label={t("search_placeholder")}
                className="h-12 ps-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="relative md:w-64">
              <MapPin className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("location_placeholder")}
                aria-label={t("location_placeholder")}
                className="h-12 ps-10"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

                          <Button
                size="lg"
                className="h-12 w-full px-8 md:w-auto"
                onClick={handleSearch}
              >
                {t("search")}
              </Button>
          </div>
        </div>
      </div>
    </section>
  );
};