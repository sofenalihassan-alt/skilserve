import { useState, useEffect } from 'react';
import logo from '@/assets/logo-header.webp';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setVisible(true), 20);
    const t1 = setTimeout(() => setVisible(false), 550);
    const t2 = setTimeout(onComplete, 850);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-center gap-3">
        <img src={logo} alt="" width={176} height={176} className="h-16 w-16 object-contain" />
        <span className="font-heading text-xl font-bold text-foreground">Skill Serve</span>
      </div>
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
