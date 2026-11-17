import { motion } from 'framer-motion';
import { House, ShieldCheck, Wrench } from 'lucide-react';
import logo from '@/assets/logo-header.webp';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-background"
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.96, times: [0, 0.12, 0.78, 1], ease: 'easeInOut' }}
        onAnimationComplete={onComplete}
      >
        <motion.div
          className="mb-5 flex items-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -8] }}
          transition={{ duration: 0.58, times: [0, 0.24, 0.72, 1], ease: 'easeInOut' }}
        >
          {[House, Wrench, ShieldCheck].map((Icon, index) => (
            <motion.span
              key={Icon.displayName ?? index}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-primary"
              initial={{ opacity: 0, scale: 0.72 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.72, 1, 1, 0.82] }}
              transition={{
                delay: index * 0.08,
                duration: 0.46,
                times: [0, 0.28, 0.72, 1],
                ease: 'easeOut',
              }}
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.43, duration: 0.36, ease: 'easeOut' }}
        >
          <img src={logo} alt="" width={176} height={176} className="h-16 w-16 object-contain" />
          <motion.span
            className="font-heading text-2xl font-bold text-foreground"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.28, ease: 'easeOut' }}
          >
            Skill Serve
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
