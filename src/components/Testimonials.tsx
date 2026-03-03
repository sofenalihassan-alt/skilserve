import { useEffect, useState, useCallback } from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  nameKey: string;
  roleKey: string;
  quoteKey: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  { nameKey: 'testimonial_1_name', roleKey: 'testimonial_1_role', quoteKey: 'testimonial_1_quote', rating: 5 },
  { nameKey: 'testimonial_2_name', roleKey: 'testimonial_2_role', quoteKey: 'testimonial_2_quote', rating: 5 },
  { nameKey: 'testimonial_3_name', roleKey: 'testimonial_3_role', quoteKey: 'testimonial_3_quote', rating: 4 },
  { nameKey: 'testimonial_4_name', roleKey: 'testimonial_4_role', quoteKey: 'testimonial_4_quote', rating: 5 },
  { nameKey: 'testimonial_5_name', roleKey: 'testimonial_5_role', quoteKey: 'testimonial_5_quote', rating: 5 },
];

export const Testimonials = () => {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on('select', onSelect);
    return () => { api.off('select', onSelect); };
  }, [api, onSelect]);

  // Auto-scroll
  useEffect(() => {
    if (!api) return;
    const timer = setInterval(() => api.scrollNext(), 4000);
    return () => clearInterval(timer);
  }, [api]);

  return (
    <section className="py-12 sm:py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center space-y-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">{t('testimonials_title')}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">{t('testimonials_subtitle')}</p>

        <Carousel opts={{ loop: true, align: 'center' }} setApi={setApi} className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((item, i) => (
              <CarouselItem key={i} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <Card className="h-full border-border/50 bg-card/80 backdrop-blur">
                  <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                    <Quote className="h-6 w-6 text-primary/40" />
                    <p className="text-sm text-foreground/90 leading-relaxed italic">"{t(item.quoteKey)}"</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={`h-4 w-4 ${s < item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t(item.nameKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(item.roleKey)}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
