import { AlertCircle, Clock, ShieldCheck, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { MagneticButton } from "@/components/MagneticButton";

export const EmergencyServices = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-emergency/20 bg-emergency/5 px-5 py-10 shadow-sm sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emergency/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emergency/10 text-emergency sm:h-16 sm:w-16">
              <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emergency/20 bg-background/60 px-3 py-1.5 text-xs font-semibold text-emergency backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emergency" />
              <Clock className="h-3.5 w-3.5" />
              {t("emergency_24_7")}
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("emergency_24_7")}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              {t("emergency_desc")}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-success" />
                Verified professionals
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />

              <span className="inline-flex items-center gap-1.5">
                <PhoneCall className="h-4 w-4 text-emergency" />
                Fast response
              </span>
            </div>

            <div className="mt-8">
              <MagneticButton className="inline-block">
                <Button
                  size="lg"
                  className="h-12 bg-emergency px-6 text-base font-semibold text-emergency-foreground shadow-lg shadow-emergency/20 transition-all hover:bg-emergency/90 hover:shadow-xl hover:shadow-emergency/25 sm:h-13 sm:px-8 sm:text-lg"
                  onClick={() => navigate("/emergency")}
                >
                  <AlertCircle className="me-2 h-5 w-5" />
                  {t("view_emergency")}
                </Button>
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};