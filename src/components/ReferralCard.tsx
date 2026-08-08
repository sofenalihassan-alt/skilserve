import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Gift, Copy, Share2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReferralRow {
  id: string;
  status: string;
  created_at: string;
  qualified_at: string | null;
}

const generateCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  bytes.forEach((b) => { out += alphabet[b % alphabet.length]; });
  return `SS-${out}`;
};

export const ReferralCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [code, setCode] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const db = supabase as any;
    setLoading(true);

    let { data: codeRow } = await db
      .from('referral_codes')
      .select('code')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!codeRow) {
      for (let attempt = 0; attempt < 3 && !codeRow; attempt++) {
        const candidate = generateCode();
        const { data: inserted, error } = await db
          .from('referral_codes')
          .insert({ user_id: user.id, code: candidate })
          .select('code')
          .maybeSingle();
        if (!error && inserted) codeRow = inserted;
      }
    }

    const [{ data: pointRow }, { data: refRows }] = await Promise.all([
      db.from('user_points').select('balance').eq('user_id', user.id).maybeSingle(),
      db.from('referrals').select('id, status, created_at, qualified_at')
        .eq('referrer_id', user.id).order('created_at', { ascending: false }),
    ]);

    setCode(codeRow?.code ?? null);
    setPoints(pointRow?.balance ?? 0);
    setReferrals((refRows as ReferralRow[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const shareLink = code ? `${window.location.origin}/auth?ref=${code}` : '';

  const copy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({ title: t('copied'), description: t('referral_link_copied') });
    } catch {
      toast({ title: t('error'), description: t('copy_failed'), variant: 'destructive' });
    }
  };

  const shareWhatsApp = () => {
    if (!shareLink) return;
    const text = `${t('referral_share_text')} ${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const qualified = referrals.filter((r) => r.status === 'qualified').length;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Gift className="h-5 w-5 text-primary" /></div>
          <div>
            <CardTitle>{t('referrals')}</CardTitle>
            <CardDescription>{t('referrals_desc')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-sm text-muted-foreground">{t('your_points')}</p>
                <p className="text-2xl font-bold mt-1 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />{points}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-sm text-muted-foreground">{t('people_invited')}</p>
                <p className="text-2xl font-bold mt-1">{referrals.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-sm text-muted-foreground">{t('rewarded_referrals')}</p>
                <p className="text-2xl font-bold mt-1">{qualified}</p>
              </div>
            </div>

            {code ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t('your_referral_code')}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="px-4 py-2 rounded-lg bg-muted font-mono text-lg tracking-wider">{code}</code>
                  <Button variant="outline" size="sm" onClick={copy} className="gap-2">
                    <Copy className="h-4 w-4" />{t('copy_link')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareWhatsApp} className="gap-2">
                    <Share2 className="h-4 w-4" />{t('share')}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('referral_code_unavailable')}</p>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">{t('invited_people')}</p>
              {referrals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
                  {t('no_referrals_yet')}
                </p>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {referrals.map((r) => (
                    <li key={r.id} className="flex items-center justify-between p-3 text-sm">
                      <span className="text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant={r.status === 'qualified' ? 'default' : 'secondary'}>
                        {r.status === 'qualified' ? t('rewarded') : t('pending_first_booking')}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-xs text-muted-foreground">{t('referral_rules')}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
