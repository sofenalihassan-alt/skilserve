import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StatsCounter } from "@/components/StatsCounter";
import { ServiceCategories } from "@/components/ServiceCategories";
import { Testimonials } from "@/components/Testimonials";
import { EmergencyServices } from "@/components/EmergencyServices";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import Seo from "@/components/Seo";

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
      
      <section className="py-12 sm:py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            {t('why_choose')}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-12">
            <div className="space-y-3">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl sm:text-3xl">✓</span>
              </div>
              <h3 className="font-bold text-base sm:text-lg">{t('verified_providers')}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {t('verified_desc')}
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl sm:text-3xl">🔒</span>
              </div>
              <h3 className="font-bold text-base sm:text-lg">{t('secure_contact')}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {t('secure_desc')}
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl sm:text-3xl">⚡</span>
              </div>
              <h3 className="font-bold text-base sm:text-lg">{t('quick_response')}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {t('quick_desc')}
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
