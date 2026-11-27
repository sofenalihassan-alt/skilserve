import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ChatImageLightboxProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export const ChatImageLightbox = ({ images, startIndex, onClose }: ChatImageLightboxProps) => {
  const [index, setIndex] = useState(startIndex);
  const { t } = useLanguage();

  useEffect(() => setIndex(startIndex), [startIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl border-0 bg-background/95 p-4 shadow-2xl sm:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>Shared image preview</DialogTitle>
          <DialogDescription>Use the previous and next buttons or arrow keys to browse images. Press Escape to close.</DialogDescription>
        </DialogHeader>
        <div className="relative flex min-h-[50vh] items-center justify-center">
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              aria-label={t('previous')}
              className="absolute start-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <img
            src={images[index]}
            alt={t('chat_photo')}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
          />
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              aria-label={t('next')}
              className="absolute end-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
        <p className="text-center text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
          Image {index + 1} of {images.length}
        </p>
      </DialogContent>
    </Dialog>
  );
};
