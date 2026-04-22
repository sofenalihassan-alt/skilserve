import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvoiceGenerator } from '@/components/InvoiceGenerator';
import { DisputeDialog } from '@/components/DisputeDialog';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  PlayCircle,
  FileText,
  User,
  Phone,
  Filter,
  Inbox,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type BookingStatus = Database['public']['Enums']['booking_status'];

interface Booking {
  id: string;
  scheduled_date: string;
  estimated_duration: number;
  total_amount: number | null;
  notes: string | null;
  service_description: string;
  status: BookingStatus;
  created_at: string;
  provider_id: string;
  user_id: string;
  provider?: {
    business_name: string;
    category: string;
    hourly_rate: number;
    user_id: string;
  };
  profile?: {
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
  };
}

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30', icon: <AlertCircle className="h-4 w-4" strokeWidth={1.5} /> },
  confirmed: { label: 'Confirmed', color: 'bg-primary/20 text-primary border-primary/30', icon: <CheckCircle className="h-4 w-4" strokeWidth={1.5} /> },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: <PlayCircle className="h-4 w-4" strokeWidth={1.5} /> },
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: <CheckCircle className="h-4 w-4" strokeWidth={1.5} /> },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: <XCircle className="h-4 w-4" strokeWidth={1.5} /> },
};

const Bookings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProvider, setIsProvider] = useState(false);
  const [activeTab, setActiveTab] = useState('my-bookings');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
      checkIfProvider();
    }
  }, [user]);

  const checkIfProvider = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    setIsProvider(!!data);
    if (data) fetchProviderBookings(data.id);
  };

  const fetchBookings = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else if (data) {
      const bookingsWithProviders = await Promise.all(
        data.map(async (booking) => {
          const { data: provider } = await supabase
            .from('service_providers')
            .select('business_name, category, hourly_rate, user_id')
            .eq('id', booking.provider_id)
            .maybeSingle();
          let profile = null;
          if (provider) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, phone')
              .eq('id', provider.user_id)
              .maybeSingle();
            profile = profileData;
          }
          return { ...booking, provider: provider || undefined, profile: profile || undefined };
        })
      );
      setBookings(bookingsWithProviders);
    }
    setLoading(false);
  };

  const fetchProviderBookings = async (providerId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching provider bookings:', error);
    } else if (data) {
      const bookingsWithProfiles = await Promise.all(
        data.map(async (booking) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, phone')
            .eq('id', booking.user_id)
            .maybeSingle();
          return { ...booking, profile: profile || undefined };
        })
      );
      setProviderBookings(bookingsWithProfiles);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update booking status.', variant: 'destructive' });
    } else {
      toast({
        title: 'Updated',
        description: `Booking ${newStatus === 'confirmed' ? 'confirmed' : newStatus === 'cancelled' ? 'declined' : newStatus === 'in_progress' ? 'started' : 'completed'} successfully!`,
      });
      fetchBookings();
      if (isProvider) {
        const { data } = await supabase
          .from('service_providers')
          .select('id')
          .eq('user_id', user?.id)
          .maybeSingle();
        if (data) fetchProviderBookings(data.id);
      }
    }
  };

  // Provider stats
  const providerStats = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, in_progress: 0, completed: 0, cancelled: 0 };
    providerBookings.forEach((b) => { counts[b.status]++; });
    return counts;
  }, [providerBookings]);

  const filteredProviderBookings = useMemo(() => {
    if (statusFilter === 'all') return providerBookings;
    return providerBookings.filter((b) => b.status === statusFilter);
  }, [providerBookings, statusFilter]);

  const canMessageBooking = (booking: Booking, isProviderView: boolean) => {
    return ['confirmed', 'in_progress', 'completed'].includes(booking.status);
  };

  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [disputeAgainstUserId, setDisputeAgainstUserId] = useState<string>('');

  const renderBookingCard = (booking: Booking, isProviderView: boolean = false) => {
    const status = statusConfig[booking.status];
    const showMessage = canMessageBooking(booking, isProviderView);
    const canDispute = ['in_progress', 'completed', 'cancelled'].includes(booking.status);
    const otherPartyId = isProviderView ? booking.user_id : booking.provider?.user_id || '';
    return (
      <Card key={booking.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-border group-hover:border-primary/50 transition-colors">
                  <AvatarImage src={booking.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {isProviderView 
                      ? booking.profile?.full_name?.charAt(0)?.toUpperCase() || 'U'
                      : booking.provider?.business_name?.charAt(0)?.toUpperCase() || 'P'
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card border border-border">
                  {status.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {isProviderView 
                    ? booking.profile?.full_name || 'Customer'
                    : booking.provider?.business_name || 'Provider'
                  }
                </h3>
                {!isProviderView && booking.provider && (
                  <p className="text-sm text-muted-foreground capitalize">{booking.provider.category}</p>
                )}
                {/* Show phone for confirmed+ provider-side bookings */}
                {isProviderView && showMessage && booking.profile?.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" strokeWidth={1.5} />
                    {booking.profile.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span>{format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <span>{booking.estimated_duration} hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                <span>Rs. {booking.total_amount || (booking.provider?.hourly_rate || 0) * booking.estimated_duration}</span>
              </div>
              <Badge variant="outline" className={`${status.color} border w-fit`}>
                {status.label}
              </Badge>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium">Service Description</p>
                <p className="text-sm text-muted-foreground mt-1">{booking.service_description}</p>
              </div>
            </div>
            {booking.notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">Note: {booking.notes}</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 justify-end">
            {isProviderView && booking.status === 'pending' && (
              <>
                <Button size="sm" onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="gap-2">
                  <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                  Confirm
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="gap-2">
                  <XCircle className="h-4 w-4" strokeWidth={1.5} />
                  Decline
                </Button>
              </>
            )}
            {isProviderView && booking.status === 'confirmed' && (
              <Button size="sm" onClick={() => updateBookingStatus(booking.id, 'in_progress')} className="gap-2">
                <PlayCircle className="h-4 w-4" strokeWidth={1.5} />
                Start Work
              </Button>
            )}
            {isProviderView && booking.status === 'in_progress' && (
              <Button size="sm" onClick={() => updateBookingStatus(booking.id, 'completed')} className="gap-2">
                <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                Mark Complete
              </Button>
            )}
            {!isProviderView && booking.status === 'pending' && (
              <Button size="sm" variant="destructive" onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="gap-2">
                <XCircle className="h-4 w-4" strokeWidth={1.5} />
                Cancel
              </Button>
            )}
            {showMessage && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/messages', { 
                  state: { 
                    providerId: isProviderView ? booking.user_id : booking.provider?.user_id,
                    providerName: isProviderView ? booking.profile?.full_name : booking.provider?.business_name
                  } 
                })}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                Message
              </Button>
            )}
            {booking.status === 'completed' && (
              <InvoiceGenerator
                booking={booking}
                customerName={isProviderView ? booking.profile?.full_name : undefined}
              />
            )}
            {canDispute && otherPartyId && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={() => {
                  setDisputeBookingId(booking.id);
                  setDisputeAgainstUserId(otherPartyId);
                }}
              >
                <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
                Report Issue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-xl" />
              <Card className="relative border-primary/20 bg-card/80 backdrop-blur-sm">
                <CardContent className="py-8">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                      <Calendar className="h-8 w-8 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">{t('my_bookings')}</h1>
                      <p className="text-muted-foreground mt-1">Manage your service appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content */}
          {isProvider ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-card border border-border">
                <TabsTrigger value="my-bookings" className="gap-2">
                  <User className="h-4 w-4" />
                  My Bookings
                </TabsTrigger>
                <TabsTrigger value="provider-bookings" className="gap-2 relative">
                  <Inbox className="h-4 w-4" />
                  Client Requests
                  {providerStats.pending > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {providerStats.pending}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-bookings" className="space-y-4">
                {bookings.length === 0 ? (
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="py-16 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
                      <h3 className="text-lg font-semibold">No bookings yet</h3>
                      <p className="text-muted-foreground mt-2">Browse providers and book a service</p>
                      <Button onClick={() => navigate('/providers')} className="mt-4">Find Providers</Button>
                    </CardContent>
                  </Card>
                ) : (
                  bookings.map((booking) => renderBookingCard(booking, false))
                )}
              </TabsContent>

              <TabsContent value="provider-bookings" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Pending', count: providerStats.pending, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10' },
                    { label: 'Confirmed', count: providerStats.confirmed, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'In Progress', count: providerStats.in_progress, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Completed', count: providerStats.completed, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                  ].map((stat) => (
                    <Card key={stat.label} className="border-border/50">
                      <CardContent className="p-4 text-center">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* List */}
                {filteredProviderBookings.length === 0 ? (
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="py-16 text-center">
                      <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
                      <h3 className="text-lg font-semibold">
                        {statusFilter === 'all' ? 'No client requests' : `No ${statusFilter} requests`}
                      </h3>
                      <p className="text-muted-foreground mt-2">
                        {statusFilter === 'all' ? "You haven't received any booking requests yet" : 'Try a different filter'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredProviderBookings.map((booking) => renderBookingCard(booking, true))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="py-16 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
                    <h3 className="text-lg font-semibold">No bookings yet</h3>
                    <p className="text-muted-foreground mt-2">Browse providers and book a service</p>
                    <Button onClick={() => navigate('/providers')} className="mt-4">Find Providers</Button>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking) => renderBookingCard(booking, false))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Bookings;
