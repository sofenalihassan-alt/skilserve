import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StatsCounter } from "@/components/StatsCounter";
import { ServiceCategories } from "@/components/ServiceCategories";
import { Testimonials } from "@/components/Testimonials";
import { EmergencyServices } from "@/components/EmergencyServices";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import Seo from "@/components/Seo";
import { FAQ } from "@/components/FAQ";
import { ShieldCheck, Lock, Zap } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Seo title={"Skill Serve — Find Trusted Service Providers Near You"} description={"Book verified plumbers, electricians, cleaners and more near you. Compare ratings, chat with pros and get 24/7 emergency help on Skill Serve."} />
      <Header />
      <main id="main-content" tabIndex={-1}>
      <Hero />
      <StatsCounter />
      <ServiceCategories />
      <Testimonials />
      <EmergencyServices />
      <FAQ />
      
        <section className="relative overflow-hidden bg-muted/20 px-4 py-20 sm:py-28">

        <div className="container relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Why Skill Serve
            </p>

            <h2 className="text-4xl font-extrabold tracking-[-0.045em] text-foreground sm:text-5xl">
              {t("why_choose")}
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Find trusted professionals with confidence through a platform built
              around verification, privacy, and fast connections.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:mt-14 md:grid-cols-12 md:gap-5">
            <div className="group relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/75 p-7 shadow-[0_18px_55px_-36px_hsl(var(--foreground)/0.3)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl md:col-span-5 md:p-9">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/15 to-accent/10 text-primary shadow-inner transition-all duration-500 group-hover:rotate-[-6deg] group-hover:scale-110">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>

              <h3 className="mt-6 text-lg font-bold tracking-tight text-card-foreground sm:text-xl">
                {t("verified_providers")}
              </h3>

              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {t("verified_desc")}
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/75 p-7 shadow-[0_18px_55px_-36px_hsl(var(--foreground)/0.3)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl md:col-span-3 md:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary transition-all duration-300">
                <Lock className="h-6 w-6" aria-hidden="true" />
              </div>

              <h3 className="mt-5 text-base font-bold text-card-foreground sm:text-lg">
                {t("secure_contact")}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("secure_desc")}
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/75 p-7 shadow-[0_18px_55px_-36px_hsl(var(--foreground)/0.3)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl md:col-span-4 md:p-9">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary transition-all duration-300">
                <Zap className="h-6 w-6" aria-hidden="true" />
              </div>

              <h3 className="mt-5 text-base font-bold text-card-foreground sm:text-lg">
                {t("quick_response")}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("quick_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default Index;
