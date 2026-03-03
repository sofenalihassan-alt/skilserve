import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Clock, Heart, Layers } from 'lucide-react';

interface StatItem {
  icon: React.ReactNode;
  target: number;
  suffix: string;
  labelKey: string;
  isStatic?: boolean;
  staticText?: string;
}

const stats: StatItem[] = [
  { icon: <Users className="h-6 w-6" />, target: 500, suffix: '+', labelKey: 'stat_providers' },
  { icon: <Clock className="h-6 w-6" />, target: 0, suffix: '', labelKey: 'stat_emergency', isStatic: true, staticText: '24/7' },
  { icon: <Heart className="h-6 w-6" />, target: 10000, suffix: '+', labelKey: 'stat_customers' },
  { icon: <Layers className="h-6 w-6" />, target: 50, suffix: '+', labelKey: 'stat_categories' },
];

export const StatsCounter = () => {
  const { t } = useLanguage();
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    const duration = 1500;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounts(stats.map((s) => Math.round(s.target * Math.min(progress, 1))));
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [hasAnimated]);

  return (
    <section ref={ref} className="py-12 sm:py-16 px-4 bg-primary/5">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                {stat.icon}
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                {stat.isStatic ? stat.staticText : `${counts[i].toLocaleString()}${stat.suffix}`}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                {t(stat.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
