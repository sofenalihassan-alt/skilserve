import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label={t('close')}
        className="absolute top-4 end-4 h-10 w-10 rounded-full bg-muted text-foreground flex items-center justify-center"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + images.length) % images.length); }}
          aria-label={t('previous')}
          className="absolute start-4 h-10 w-10 rounded-full bg-muted text-foreground flex items-center justify-center"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <img
        src={images[index]}
        alt={t('chat_photo')}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-full rounded-lg object-contain"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % images.length); }}
            aria-label={t('next')}
            className="absolute end-4 h-10 w-10 rounded-full bg-muted text-foreground flex items-center justify-center"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <p className="absolute bottom-6 text-sm text-muted-foreground">{index + 1} / {images.length}</p>
        </>
      )}
    </div>
  );
};
