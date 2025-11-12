import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServiceCategories } from "@/components/ServiceCategories";
import { EmergencyServices } from "@/components/EmergencyServices";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ServiceCategories />
      <EmergencyServices />
      
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Why Choose Skill Serve?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="space-y-3">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="font-bold text-lg">Verified Providers</h3>
              <p className="text-muted-foreground text-sm">
                All service providers are background checked and verified
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="font-bold text-lg">Secure Contact</h3>
              <p className="text-muted-foreground text-sm">
                Your privacy is protected with our secure messaging system
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="font-bold text-lg">Quick Response</h3>
              <p className="text-muted-foreground text-sm">
                Get connected with nearby providers in seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-muted/50 py-8 px-4 mt-16">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Skill Serve. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
