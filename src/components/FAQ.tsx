import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const faqs = [
  {
    question: "What is Skill Serve?",
    answer:
      "Skill Serve connects customers with local service providers for home, business, and emergency services.",
  },
  {
    question: "How do I find a service provider?",
    answer:
      "Search for the service you need, enter your location, and browse available providers near you.",
  },
  {
    question: "Are service providers verified?",
    answer:
      "Skill Serve is designed to help customers find trusted professionals. Verification information is displayed on provider profiles where available.",
  },
  {
    question: "How close are the service providers to me?",
    answer:
      "Skill Serve helps you discover service providers based on your location and the service you are looking for.",
  },
  {
    question: "Can I contact a service provider before booking?",
    answer:
      "Yes. You can communicate with providers through the platform where messaging is available.",
  },
  {
    question: "Does Skill Serve offer emergency services?",
    answer:
      "Yes. Skill Serve has a dedicated emergency-services area for customers who need urgent assistance.",
  },
  {
    question: "Can I become a service provider on Skill Serve?",
    answer:
      "Yes. Professionals can register as service providers and offer their skills to customers through the platform.",
  },
  {
    question: "Can I leave a review after receiving a service?",
    answer:
      "Yes, where reviews are enabled, customers can share their experience to help other users choose providers.",
  },
  {
    question: "Is Skill Serve available 24/7?",
    answer:
      "The platform is available online at any time. Individual providers may have their own availability and working hours.",
  },
  {
    question: "How does Skill Serve protect my information?",
    answer:
      "Skill Serve uses account authentication and access controls designed to help protect user information and platform data.",
  },
];

export const FAQ = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            FAQ
          </span>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Find answers to common questions about Skill Serve, service
            providers, bookings, and emergency services.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground sm:px-6 sm:py-5 sm:text-base">
                <span>{faq.question}</span>

                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>

              <div className="px-5 pb-5 text-sm leading-6 text-muted-foreground sm:px-6 sm:pb-6 sm:leading-7">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};