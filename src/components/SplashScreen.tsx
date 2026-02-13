import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'init' | 'logo' | 'text' | 'fade'>('init');

  useEffect(() => {
    const t0 = setTimeout(() => setPhase('logo'), 100);
    const t1 = setTimeout(() => setPhase('text'), 900);
    const t2 = setTimeout(() => setPhase('fade'), 2400);
    const t3 = setTimeout(onComplete, 3000);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ${
        phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, hsl(258 90% 25% / 0.8), hsl(230 25% 5%) 70%)',
      }}
    >
      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="absolute w-48 h-48 rounded-full border-2 border-primary/30 animate-ping"
          style={{ animationDuration: '2s' }}
        />
        <div
          className="absolute w-72 h-72 rounded-full border border-accent/20 animate-ping"
          style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}
        />
        <div
          className="absolute w-96 h-96 rounded-full border border-primary/10 animate-ping"
          style={{ animationDuration: '3s', animationDelay: '0.6s' }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
          style={{
            top: `${20 + i * 12}%`,
            left: `${15 + i * 13}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${1.5 + i * 0.3}s`,
          }}
        />
      ))}

      {/* Logo */}
      <div
        className={`relative transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          phase === 'init' ? 'scale-0 opacity-0 rotate-180' : 'scale-100 opacity-100 rotate-0'
        }`}
      >
        <div className="absolute -inset-8 blur-3xl bg-primary/40 rounded-full animate-pulse" />
        <div className="relative p-4 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/10 backdrop-blur-sm border border-primary/20">
          <img src={logo} alt="Skill Serve" className="relative w-20 h-20 sm:w-28 sm:h-28 drop-shadow-2xl" />
        </div>
      </div>

      {/* Text */}
      <div
        className={`mt-8 text-center transition-all duration-600 ease-out ${
          phase === 'text' || phase === 'fade'
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6'
        }`}
      >
        <h1 className="text-3xl sm:text-5xl font-extrabold gradient-text tracking-tight">
          Skill Serve
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-3 tracking-[0.3em] uppercase font-light">
          Your Trusted Service Platform
        </p>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-20 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-12 w-52 h-1 bg-muted/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all ease-out"
          style={{
            width: phase === 'init' ? '0%' : phase === 'logo' ? '30%' : phase === 'text' ? '70%' : '100%',
            transitionDuration: phase === 'text' ? '1500ms' : '600ms',
          }}
        />
      </div>
    </div>
  );
};
