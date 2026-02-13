import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'logo' | 'text' | 'fade'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 800);
    const t2 = setTimeout(() => setPhase('fade'), 2200);
    const t3 = setTimeout(onComplete, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-600 ${
        phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, hsl(258 90% 20% / 0.6), hsl(230 25% 7%))',
      }}
    >
      {/* Glow rings */}
      <div className="absolute w-64 h-64 rounded-full border border-primary/20 animate-ping opacity-20" />
      <div className="absolute w-96 h-96 rounded-full border border-accent/10 animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />

      {/* Logo */}
      <div
        className={`relative transition-all duration-700 ease-out ${
          phase === 'logo' ? 'scale-0 opacity-0 rotate-180' : 'scale-100 opacity-100 rotate-0'
        }`}
      >
        <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full scale-150" />
        <img src={logo} alt="Skill Serve" className="relative w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl" />
      </div>

      {/* Text */}
      <div
        className={`mt-8 text-center transition-all duration-500 ease-out ${
          phase === 'text' || phase === 'fade'
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text tracking-tight">
          Skill Serve
        </h1>
        <p className="text-muted-foreground text-sm mt-2 tracking-widest uppercase">
          Your Trusted Service Platform
        </p>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-16 w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-[2000ms] ease-out"
          style={{ width: phase === 'logo' ? '0%' : phase === 'text' ? '60%' : '100%' }}
        />
      </div>
    </div>
  );
};
