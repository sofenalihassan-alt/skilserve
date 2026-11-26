import { useEffect, useState, useCallback } from "react";
import { Star, Quote } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

const fallbackTestimonials: Testimonial[] = [
  {
    name: "Sarah Ahmed",
    role: "Homeowner",
    quote:
      "Found an amazing electrician within minutes. The service was professional and affordable. Highly recommended!",
    rating: 5,
  },
  {
    name: "Muhammad Ali",
    role: "Business Owner",
    quote:
      "SkillServe made it easy to find reliable contractors for our office renovation. Great platform!",
    rating: 5,
  },
  {
    name: "Fatima Hassan",
    role: "Apartment Resident",
    quote:
      "Quick response time and verified professionals. I feel safe using this platform for home services.",
    rating: 4,
  },
  {
    name: "Omar Sheikh",
    role: "Property Manager",
    quote:
      "Managing multiple properties became easier with SkillServe. Quality service providers every time!",
    rating: 5,
  },
  {
    name: "Ayesha Khan",
    role: "Restaurant Owner",
    quote:
      "From plumbing to electrical, all our maintenance needs are covered. Excellent service!",
    rating: 5,
  },
];

export const Testimonials = () => {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(fallbackTestimonials);
  const [totalCount, setTotalCount] = useState(
    fallbackTestimonials.length
  );

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setTestimonials(
          data.map((item) => ({
            name: item.name,
            role: item.role,
            quote: item.quote,
            rating: item.rating,
          }))
        );

        setTotalCount(data.length);
      }
    };

    fetchTestimonials();
  }, []);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;

    onSelect();
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    if (!api) return;

    const timer = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [api]);

  const displayCount = Math.max(totalCount, 120);

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:py-28">
      <div className="container mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-primary/10 bg-gradient-to-br from-primary/15 to-accent/10 text-primary shadow-inner">
            <Quote className="h-6 w-6" />
          </div>

          <h2 className="text-4xl font-extrabold tracking-[-0.045em] text-foreground sm:text-5xl">
            {t("testimonials_title")}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Trusted by {displayCount}+ satisfied customers across Pakistan
          </p>
        </div>

        <Carousel
          opts={{
            loop: true,
            align: "center",
          }}
          setApi={setApi}
          className="mx-auto w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-5">
            {testimonials.map((item, i) => (
              <CarouselItem
                key={`${item.name}-${i}`}
                className="pl-3 sm:basis-1/2 md:pl-5 lg:basis-1/3"
              >
                <Card className="group relative h-full overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/75 shadow-[0_16px_50px_-34px_hsl(var(--foreground)/0.3)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_26px_60px_-32px_hsl(var(--primary)/0.3)]">
                  <CardContent className="flex h-full flex-col p-7 sm:p-8">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Quote className="h-5 w-5" />
                      </div>

                      <div
                        className="flex gap-0.5"
                        aria-label={`${item.rating} out of 5 stars`}
                      >
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${
                              s < item.rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="flex-1 text-base leading-8 tracking-[-0.01em] text-foreground/90">
                      "{item.quote}"
                    </p>

                    <div className="mt-6 border-t border-border/60 pt-4">
                      <p className="text-sm font-semibold text-card-foreground">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((item, i) => (
            <button
              key={`${item.name}-dot-${i}`}
              type="button"
              onClick={() => api?.scrollTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
};