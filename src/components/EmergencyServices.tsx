import { AlertCircle, Clock, ShieldCheck, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { MagneticButton } from "@/components/MagneticButton";

export const EmergencyServices = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-emergency/25 bg-[radial-gradient(ellipse_at_85%_15%,hsl(var(--emergency)/0.16),transparent_42%),linear-gradient(135deg,hsl(var(--emergency)/0.07),hsl(var(--card)/0.88))] px-5 py-12 shadow-[0_28px_80px_-42px_hsl(var(--emergency)/0.5)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl sm:px-12 sm:py-16 dark:ring-white/10">\n          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full border border-emergency/15 shadow-[0_0_0_32px_hsl(var(--emergency)/0.035),0_0_0_64px_hsl(var(--emergency)/0.025)]" />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-emergency/15 bg-emergency/10 text-emergency shadow-inner sm:h-[4.5rem] sm:w-[4.5rem]">
              <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emergency/20 bg-background/60 px-3 py-1.5 text-xs font-semibold text-emergency backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emergency" />
              <Clock className="h-3.5 w-3.5" />
              {t("emergency_24_7")}
            </div>

            <h2 className="text-4xl font-extrabold tracking-[-0.045em] text-foreground sm:text-5xl">
              {t("emergency_24_7")}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
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
            <div className="mt-8 w-full">
              <MagneticButton className="block w-full max-w-full">
                <Button
                  size="lg"
                  className="h-14 w-full max-w-full rounded-2xl bg-emergency px-4 text-sm font-bold text-emergency-foreground shadow-lg shadow-emergency/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emergency/90 hover:shadow-xl hover:shadow-emergency/30 sm:px-8 sm:text-base"
                  onClick={() => navigate("/emergency")}
                >
                  <AlertCircle className="me-2 h-5 w-5 shrink-0" />
                  <span className="truncate">
                    {t("view_emergency")}
                  </span>
                </Button>
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};