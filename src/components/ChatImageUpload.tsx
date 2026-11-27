import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const MAX_CHAT_IMAGES = 3;
export const MAX_CHAT_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

interface ChatImageUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

export const ChatImageUpload = ({ files, onChange, disabled }: ChatImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (picked.length === 0) return;

    const valid: File[] = [];
    for (const file of picked) {
      if (!ALLOWED.includes(file.type)) {
        toast({ title: t('invalid_image'), description: t('invalid_image_desc'), variant: 'destructive' });
        continue;
      }
      if (file.size > MAX_CHAT_IMAGE_BYTES) {
        toast({ title: t('image_too_large'), description: t('image_too_large_desc'), variant: 'destructive' });
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    const next = [...files, ...valid];
    if (next.length > MAX_CHAT_IMAGES) {
      toast({ title: t('too_many_images'), description: t('too_many_images_desc'), variant: 'destructive' });
    }
    onChange(next.slice(0, MAX_CHAT_IMAGES));
  };

  const remove = (index: number) => onChange(files.filter((_, i) => i !== index));

  return (
    <>
      {files.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview of ${file.name}`}
                className="h-16 w-16 rounded-md object-cover border"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`${t('remove_photo')}: ${file.name}`}
                className="absolute -top-2 -end-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleSelect}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        disabled={disabled || files.length >= MAX_CHAT_IMAGES}
        onClick={() => inputRef.current?.click()}
        title={t('attach_photo')}
        aria-label={t('attach_photo')}
      >
        <ImagePlus className="h-4 w-4" />
      </Button>
    </>
  );
};
