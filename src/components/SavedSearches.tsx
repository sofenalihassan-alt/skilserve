import { useEffect, useState, useCallback } from 'react';
import { Bookmark, BookmarkPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export interface SearchFilters {
  searchQuery: string;
  category: string;
  priceRange: number[];
  minRating: number;
  verifiedOnly: boolean;
  available247: boolean;
  minExperience: number;
  sortBy: string;
}

interface SavedSearchRow {
  id: string;
  name: string;
  filters: SearchFilters;
}

interface SavedSearchesProps {
  currentFilters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
}

export const SavedSearches = ({ currentFilters, onApply }: SavedSearchesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [rows, setRows] = useState<SavedSearchRow[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from('saved_searches')
      .select('id, name, filters')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setRows((data as SavedSearchRow[]) || []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast({ title: t('error'), description: t('name_required'), variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any)
      .from('saved_searches')
      .insert({ user_id: user.id, name: trimmed.slice(0, 60), filters: currentFilters });
    setSaving(false);
    if (error) {
      toast({ title: t('error'), description: t('save_search_failed'), variant: 'destructive' });
      return;
    }
    toast({ title: t('saved'), description: t('search_saved') });
    setName('');
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from('saved_searches').delete().eq('id', id);
    if (error) {
      toast({ title: t('error'), description: t('delete_failed'), variant: 'destructive' });
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  if (!user) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <Bookmark className="h-4 w-4" strokeWidth={1.5} />{t('saved_searches')}
        </label>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="gap-1">
          <BookmarkPlus className="h-4 w-4" />{t('save')}
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('no_saved_searches')}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {rows.map((r) => (
            <Badge key={r.id} variant="secondary" className="gap-1 pe-1 max-w-full">
              <button
                type="button"
                className="truncate max-w-[140px]"
                onClick={() => onApply({ ...currentFilters, ...r.filters })}
              >
                {r.name}
              </button>
              <button
                type="button"
                aria-label={t('delete')}
                onClick={() => remove(r.id)}
                className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('save_this_search')}</DialogTitle>
            <DialogDescription>{t('save_search_desc')}</DialogDescription>
          </DialogHeader>
          <Input
            value={name}
            maxLength={60}
            placeholder={t('search_name_placeholder')}
            onChange={(e) => setName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t('cancel')}</Button>
            <Button onClick={save} disabled={saving}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
