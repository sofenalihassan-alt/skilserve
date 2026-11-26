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
    <section className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_12%_15%,hsl(var(--primary)/0.16),transparent_38%),radial-gradient(ellipse_at_88%_80%,hsl(var(--accent)/0.12),transparent_34%)]">\n      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[linear-gradient(180deg,hsl(var(--background)/0.2),hsl(var(--background)))]" />\n      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-12 -z-10 h-72 w-72 rounded-full border border-primary/10 shadow-[0_0_0_40px_hsl(var(--primary)/0.025),0_0_0_80px_hsl(var(--primary)/0.02)]" />
      <div className="container mx-auto px-4 pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-28">
        <div className="mx-auto max-w-5xl text-center">
        <h1 className="mx-auto max-w-4xl text-[clamp(2.35rem,6vw,5.25rem)] font-extrabold leading-[1.02] tracking-[-0.055em] text-foreground">
          <span className="block">{t("hero_title_1")}</span>
          <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            {t("hero_title_2")}
          </span>
        </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {t("hero_subtitle")}
          </p>

          <div className="mx-auto mt-10 flex w-full max-w-4xl flex-col gap-2 rounded-[1.75rem] border border-white/60 bg-card/75 p-2.5 shadow-[0_24px_80px_-28px_hsl(var(--primary)/0.32)] ring-1 ring-border/50 backdrop-blur-2xl sm:mt-12 sm:p-3 md:flex-row dark:border-white/10">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("search_placeholder")}
                aria-label={t("search_placeholder")}
                className="h-14 rounded-2xl border-transparent bg-muted/55 ps-11 text-base shadow-none focus-visible:bg-background"
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
                className="h-14 w-full rounded-2xl px-9 text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl md:w-auto"
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