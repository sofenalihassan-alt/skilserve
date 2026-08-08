import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Wallet } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Booking {
  id: string;
  status: string;
  total_amount: number | null;
  scheduled_date: string;
  service_description: string;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--muted-foreground))', 'hsl(var(--destructive))', 'hsl(var(--secondary))'];

const currency = (n: number) => `Rs. ${Math.round(n).toLocaleString()}`;

export const ProviderEarnings = ({ providerId }: { providerId: string }) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data }, { data: reviews }] = await Promise.all([
        supabase
          .from('bookings')
          .select('id, status, total_amount, scheduled_date, service_description')
          .eq('provider_id', providerId)
          .order('scheduled_date', { ascending: false }),
        supabase.from('reviews').select('rating').eq('provider_id', providerId),
      ]);
      setBookings((data as Booking[]) || []);
      if (reviews && reviews.length > 0) {
        setAvgRating(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length);
      } else {
        setAvgRating(null);
      }
      setLoading(false);
    };
    load();
  }, [providerId]);

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader><CardTitle>{t('earnings')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    );
  }

  const completed = bookings.filter((b) => b.status === 'completed');
  const pending = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress');
  const totalEarned = completed.reduce((s, b) => s + Number(b.total_amount || 0), 0);
  const pendingAmount = pending.reduce((s, b) => s + Number(b.total_amount || 0), 0);

  const now = new Date();
  const thisMonth = completed
    .filter((b) => {
      const d = new Date(b.scheduled_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, b) => s + Number(b.total_amount || 0), 0);

  const avgJob = completed.length > 0 ? totalEarned / completed.length : 0;

  // Last 6 months earnings
  const months: { label: string; earnings: number; jobs: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString(undefined, { month: 'short' });
    const inMonth = completed.filter((b) => {
      const bd = new Date(b.scheduled_date);
      return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
    });
    months.push({
      label,
      earnings: inMonth.reduce((s, b) => s + Number(b.total_amount || 0), 0),
      jobs: inMonth.length,
    });
  }

  const statusCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: t('total_earned'), value: currency(totalEarned) },
    { label: t('this_month'), value: currency(thisMonth) },
    { label: t('upcoming_earnings'), value: currency(pendingAmount) },
    { label: t('jobs_completed'), value: String(completed.length) },
    { label: t('average_job_value'), value: currency(avgJob) },
    { label: t('average_rating'), value: avgRating ? avgRating.toFixed(1) : '—' },
  ];

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10"><Wallet className="h-5 w-5 text-accent" /></div>
          <div>
            <CardTitle>{t('earnings')}</CardTitle>
            <CardDescription>{t('earnings_desc')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg md:text-xl font-bold mt-1 break-words">{s.value}</p>
            </div>
          ))}
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-lg">
            <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{t('no_earnings_yet')}</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium mb-3">{t('earnings_last_6_months')}</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} width={56} />
                    <Tooltip formatter={(v: number) => currency(Number(v))} />
                    <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">{t('booking_status_mix')}</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={70} label>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">{t('recent_completed_jobs')}</p>
              {completed.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
                  {t('no_completed_jobs')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-start">
                        <th className="text-start font-medium py-2">{t('service')}</th>
                        <th className="text-start font-medium py-2">{t('date')}</th>
                        <th className="text-end font-medium py-2">{t('amount')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completed.slice(0, 8).map((b) => (
                        <tr key={b.id} className="border-t">
                          <td className="py-2 pe-3 max-w-[200px] truncate">{b.service_description}</td>
                          <td className="py-2 pe-3 whitespace-nowrap">{new Date(b.scheduled_date).toLocaleDateString()}</td>
                          <td className="py-2 text-end whitespace-nowrap">{currency(Number(b.total_amount || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
