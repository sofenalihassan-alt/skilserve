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
    <section ref={ref} className="relative z-10 -mt-5 px-4 pb-10 sm:-mt-8 sm:pb-14">
      <div className="container mx-auto max-w-6xl rounded-[2rem] border border-white/60 bg-card/75 p-5 shadow-[0_24px_70px_-38px_hsl(var(--primary)/0.35)] backdrop-blur-2xl ring-1 ring-border/50 sm:p-8 dark:border-white/10">
        <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
          {stats.map((stat, i) => (
            <div key={i} className="group space-y-2 px-3 py-5 text-center transition-transform duration-300 hover:-translate-y-1 sm:px-5 sm:py-3">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary transition-all duration-300 group-hover:rotate-[-5deg] group-hover:scale-110">
                {stat.icon}
              </div>
              <p className="text-3xl font-extrabold tracking-[-0.05em] text-foreground sm:text-4xl md:text-5xl">
                {stat.isStatic ? stat.staticText : `${counts[i].toLocaleString()}${stat.suffix}`}
              </p>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground sm:text-sm">
                {t(stat.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
