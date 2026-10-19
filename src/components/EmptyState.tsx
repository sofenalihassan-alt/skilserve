import { ArrowRight } from 'lucide-react';
import { PressButton } from '@/components/PressButton';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  kind: 'bookings' | 'messages' | 'favorites';
  title: string;
  description: string;
  action: string;
  onAction: () => void;
  compact?: boolean;
}

export const EmptyState = ({ kind, title, description, action, onAction, compact }: EmptyStateProps) => (
  <section className={cn('flex flex-col items-center justify-center px-5 py-12 text-center', compact && 'px-4 py-6')}>
    <svg viewBox="0 0 160 120" fill="none" aria-hidden="true" className={cn('mb-5 h-28 w-40 shrink-0', compact && 'mb-3 h-20 w-28')}>
      <path d="M22 98h116M28 107h16m73 0h12" className="stroke-border" strokeWidth="2" strokeLinecap="round" />
      {kind === 'bookings' && <>
        <rect x="37" y="23" width="83" height="74" rx="8" className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <path d="M37 44h83M57 16v15m42-15v15" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
        <path d="M53 59h10m15 0h10M53 75h10" className="stroke-primary/50" strokeWidth="4" strokeLinecap="round" />
        <circle cx="113" cy="81" r="19" className="fill-card stroke-accent" strokeWidth="2" />
        <path d="m105 81 5 5 10-11" className="stroke-accent" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </>}
      {kind === 'messages' && <>
        <path d="M32 25h77a8 8 0 0 1 8 8v43a8 8 0 0 1-8 8H58L36 99V84h-4a8 8 0 0 1-8-8V33a8 8 0 0 1 8-8Z" className="fill-primary/10 stroke-primary" strokeWidth="2" strokeLinejoin="round" />
        <path d="M44 46h53M44 59h34" className="stroke-primary/50" strokeWidth="4" strokeLinecap="round" />
        <path d="M94 65h35a7 7 0 0 1 7 7v16a7 7 0 0 1-7 7h-2v10l-15-10H94a7 7 0 0 1-7-7V72a7 7 0 0 1 7-7Z" className="fill-card stroke-accent" strokeWidth="2" strokeLinejoin="round" />
        <path d="M101 80h21" className="stroke-accent" strokeWidth="3" strokeLinecap="round" />
      </>}
      {kind === 'favorites' && <>
        <rect x="43" y="21" width="76" height="77" rx="8" transform="rotate(8 43 21)" className="fill-accent/10 stroke-accent/50" strokeWidth="2" />
        <rect x="31" y="24" width="76" height="77" rx="8" className="fill-card stroke-primary" strokeWidth="2" />
        <path d="M69 74 50 56c-13-13 8-27 19-12 11-15 32-1 19 12L69 74Z" className="fill-emergency/15 stroke-emergency" strokeWidth="2" strokeLinejoin="round" />
        <path d="M52 88h34M123 32v12m-6-6h12" className="stroke-accent" strokeWidth="3" strokeLinecap="round" />
      </>}
    </svg>
    <h2 className={cn('font-heading text-xl font-semibold text-foreground', compact && 'text-base')}>{title}</h2>
    <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
    <PressButton onClick={onAction} className="mt-5 h-auto min-h-11 max-w-full whitespace-normal py-2.5">
      {action}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 rtl:rotate-180" />
    </PressButton>
  </section>
);