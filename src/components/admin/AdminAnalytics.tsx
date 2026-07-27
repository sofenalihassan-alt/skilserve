import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, subMonths, startOfMonth } from 'date-fns';
import { TrendingUp, CalendarCheck, Wallet, Star } from 'lucide-react';

type BookingRow = {
  id: string;
  status: string;
  total_amount: number | null;
  created_at: string;
  provider_id: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(45 93% 47%)',
  confirmed: 'hsl(var(--primary))',
  in_progress: 'hsl(217 91% 60%)',
  completed: 'hsl(160 84% 39%)',
  cancelled: 'hsl(var(--destructive))',
};

export const AdminAnalyticsTab = () => {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<{ name: string; providers: number }[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const since = subMonths(startOfMonth(new Date()), 5).toISOString();

      const [bookingsRes, providersRes, reviewsRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('id, status, total_amount, created_at, provider_id')
          .gte('created_at', since)
          .order('created_at', { ascending: true }),
        supabase.from('service_providers').select('category'),
        supabase.from('reviews').select('rating'),
      ]);

      if (!active) return;

      setBookings((bookingsRes.data as BookingRow[]) || []);

      const counts = new Map<string, number>();
      (providersRes.data || []).forEach((p: { category: string | null }) => {
        if (!p.category) return;
        counts.set(p.category, (counts.get(p.category) || 0) + 1);
      });
      setCategoryCounts(
        Array.from(counts.entries())
          .map(([name, providers]) => ({ name, providers }))
          .sort((a, b) => b.providers - a.providers)
          .slice(0, 8)
      );

      const ratings = (reviewsRes.data || []) as { rating: number }[];
      setAvgRating(ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const monthly = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => startOfMonth(subMonths(new Date(), 5 - i)));
    return months.map((m) => {
      const key = format(m, 'yyyy-MM');
      const inMonth = bookings.filter((b) => format(new Date(b.created_at), 'yyyy-MM') === key);
      const completed = inMonth.filter((b) => b.status === 'completed');
      return {
        month: format(m, 'MMM'),
        bookings: inMonth.length,
        completed: completed.length,
        revenue: completed.reduce((sum, b) => sum + Number(b.total_amount || 0), 0),
      };
    });
  }, [bookings]);

  const statusData = useMemo(() => {
    const counts = new Map<string, number>();
    bookings.forEach((b) => counts.set(b.status, (counts.get(b.status) || 0) + 1));
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const totals = useMemo(() => {
    const completed = bookings.filter((b) => b.status === 'completed');
    const revenue = completed.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    const rate = bookings.length ? Math.round((completed.length / bookings.length) * 100) : 0;
    return { revenue, rate, total: bookings.length, completed: completed.length };
  }, [bookings]);

  if (loading) {
    return <div className="py-16 text-center text-muted-foreground animate-pulse">Loading analytics…</div>;
  }

  const stats = [
    { label: 'Bookings (6 mo)', value: totals.total.toString(), icon: CalendarCheck },
    { label: 'Completed', value: `${totals.completed} (${totals.rate}%)`, icon: TrendingUp },
    { label: 'Revenue (completed)', value: `Rs. ${totals.revenue.toLocaleString()}`, icon: Wallet },
    { label: 'Avg. provider rating', value: avgRating ? avgRating.toFixed(1) : '—', icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{label}</p>
                  <p className="text-lg font-bold truncate">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings & revenue trend</CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 12,
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" fill="url(#bookingsFill)" />
              <Area type="monotone" dataKey="revenue" stroke="hsl(160 84% 39%)" fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking status mix</CardTitle>
            <CardDescription>Share of bookings by status</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || 'hsl(var(--muted-foreground))'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 12,
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top categories</CardTitle>
            <CardDescription>Registered providers per service</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {categoryCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No providers yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryCounts} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 12,
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="providers" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
