import { motion } from 'framer-motion';
import { House, ShieldCheck, Wrench } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  let isUrdu = false;
  try {
    isUrdu =
      window.localStorage.getItem('skillserve-language') === 'ur' ||
      document.documentElement.dir === 'rtl';
  } catch {
    isUrdu = document.documentElement.dir === 'rtl';
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.6, times: [0, 0.08, 0.95, 1], ease: 'easeInOut' }}
        onAnimationComplete={onComplete}
      >
        <motion.div
          className="mb-5 flex items-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -8] }}
          transition={{ duration: 2.3, times: [0, 0.12, 0.92, 1], ease: 'easeInOut' }}
        >
          {[House, Wrench, ShieldCheck].map((Icon, index) => (
            <motion.span
              key={Icon.displayName ?? index}
              className={`flex h-11 w-11 items-center justify-center rounded-full border border-primary/70 bg-primary/20 ${index === 1 ? 'text-accent' : 'text-primary'}`}
              initial={{ opacity: 0, scale: 0.72 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.72, 1, 1, 0.82] }}
              transition={{
                delay: index * 0.12,
                duration: 1.9,
                times: [0, 0.12, 0.9, 1],
                ease: 'easeOut',
              }}
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2.2} />
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10, scale: 0.94 }}
          animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -3], scale: [0.94, 1, 1, 1] }}
          transition={{ delay: 0.7, duration: 1.8, times: [0, 0.2, 0.9, 1], ease: 'easeOut' }}
        >
          <img src="/logo.webp" alt="" width={176} height={176} loading="eager" decoding="async" className="h-16 w-16 object-contain" />
          <motion.span
            className={`font-heading text-2xl font-bold text-foreground ${isUrdu ? 'font-urdu leading-loose' : ''}`}
            dir={isUrdu ? 'rtl' : 'ltr'}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.65, ease: 'easeOut' }}
          >
            {isUrdu ? 'سکل سرو' : 'Skill Serve'}
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const shouldShowSplash = () => {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (sessionStorage.getItem('splash_seen')) return false;
    sessionStorage.setItem('splash_seen', '1');
    return true;
  } catch {
    return false;
  }
};
