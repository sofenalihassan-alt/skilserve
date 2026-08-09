import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const REFERRAL_STORAGE_KEY = 'skillserve-referral-code';

/**
 * Turns a stored referral code into a pending referral record once the invited
 * user is signed in. Runs at most once per user; silently no-ops on any issue.
 */
export const useReferralCapture = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const capture = async () => {
      let code: string | null = null;
      try {
        code = localStorage.getItem(REFERRAL_STORAGE_KEY);
      } catch {
        return;
      }
      if (!code) return;

      const db = supabase as any;

      // Already referred? Nothing to do.
      const { data: existing } = await db
        .from('referrals')
        .select('id')
        .eq('referred_id', user.id)
        .maybeSingle();
      if (existing) {
        try { localStorage.removeItem(REFERRAL_STORAGE_KEY); } catch { /* ignore */ }
        return;
      }

      if (cancelled) return;

      // The inviter is resolved server-side from the code; invalid or
      // self-referrals are rejected by the database and ignored here.
      await db.from('referrals').insert({
        referred_id: user.id,
        code: code.trim().toUpperCase(),
      });

      try { localStorage.removeItem(REFERRAL_STORAGE_KEY); } catch { /* ignore */ }
    };

    capture();
    return () => { cancelled = true; };
  }, [user]);
};
