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

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Seo title={"Skill Serve — Find Trusted Service Providers Near You"} description={"Book verified plumbers, electricians, cleaners and more near you. Compare ratings, chat with pros and get 24/7 emergency help on Skill Serve."} />
      <Header />
      <Hero />
      <StatsCounter />
      <ServiceCategories />
      <Testimonials />
      <EmergencyServices />
      <FAQ />
      
        <section className="relative overflow-hidden bg-primary/5 px-4 py-16 sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="container relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Why Skill Serve
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("why_choose")}
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Find trusted professionals with confidence through a platform built
              around verification, privacy, and fast connections.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            <div className="group rounded-2xl border border-border/60 bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 sm:p-7">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
                ✓
              </div>

              <h3 className="mt-5 text-base font-bold text-card-foreground sm:text-lg">
                {t("verified_providers")}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("verified_desc")}
              </p>
            </div>

            <div className="group rounded-2xl border border-border/60 bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 sm:p-7">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
                🔒
              </div>

              <h3 className="mt-5 text-base font-bold text-card-foreground sm:text-lg">
                {t("secure_contact")}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("secure_desc")}
              </p>
            </div>

            <div className="group rounded-2xl border border-border/60 bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 sm:p-7">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
                ⚡
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

      <Footer />
    </div>
  );
};

export default Index;
