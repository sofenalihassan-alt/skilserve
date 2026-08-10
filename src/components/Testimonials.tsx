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
    <section className="bg-muted/20 px-4 py-16 sm:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Quote className="h-6 w-6" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("testimonials_title")}
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
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
                <Card className="group h-full border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
                  <CardContent className="flex h-full flex-col p-6">
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

                    <p className="flex-1 text-sm leading-7 text-foreground/90">
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