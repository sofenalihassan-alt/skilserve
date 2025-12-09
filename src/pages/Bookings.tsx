import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  User
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
  };
}

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <AlertCircle className="h-4 w-4" /> },
  confirmed: { label: 'Confirmed', color: 'bg-primary/20 text-primary border-primary/30', icon: <CheckCircle className="h-4 w-4" /> },
  in_progress: { label: 'In Progress', color: 'bg-accent/20 text-accent border-accent/30', icon: <PlayCircle className="h-4 w-4" /> },
  completed: { label: 'Completed', color: 'bg-success/20 text-success border-success/30', icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: <XCircle className="h-4 w-4" /> },
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
    if (data) {
      fetchProviderBookings(data.id);
    }
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
      // Fetch provider details for each booking
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
              .select('full_name, avatar_url')
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
      .order('scheduled_date', { ascending: false });

    if (error) {
      console.error('Error fetching provider bookings:', error);
    } else if (data) {
      // Fetch user profiles for each booking
      const bookingsWithProfiles = await Promise.all(
        data.map(async (booking) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
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
      toast({
        title: 'Error',
        description: 'Failed to update booking status.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `Booking ${newStatus === 'confirmed' ? 'confirmed' : newStatus === 'cancelled' ? 'cancelled' : 'updated'} successfully!`,
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

  const renderBookingCard = (booking: Booking, isProviderView: boolean = false) => {
    const status = statusConfig[booking.status];
    
    return (
      <Card key={booking.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
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
                  <p className="text-sm text-muted-foreground capitalize">
                    {booking.provider.category}
                  </p>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-accent" />
                <span>{booking.estimated_duration} hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-success" />
                <span>${booking.total_amount || (booking.provider?.hourly_rate || 0) * booking.estimated_duration}</span>
              </div>
              <Badge variant="outline" className={`${status.color} border w-fit`}>
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Service Description */}
          <div className="mt-4 p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Service Description</p>
                <p className="text-sm text-muted-foreground mt-1">{booking.service_description}</p>
              </div>
            </div>
            {booking.notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">Note: {booking.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2 justify-end">
            {isProviderView && booking.status === 'pending' && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirm
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </Button>
              </>
            )}
            {isProviderView && booking.status === 'confirmed' && (
              <Button 
                size="sm" 
                onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                className="gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Start Work
              </Button>
            )}
            {isProviderView && booking.status === 'in_progress' && (
              <Button 
                size="sm" 
                onClick={() => updateBookingStatus(booking.id, 'completed')}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark Complete
              </Button>
            )}
            {!isProviderView && booking.status === 'pending' && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
            )}
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
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
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
    <div className="min-h-screen bg-background">
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
                      <Calendar className="h-8 w-8 text-primary" />
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

          {/* Tabs */}
          {isProvider ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-card border border-border">
                <TabsTrigger value="my-bookings" className="gap-2">
                  <User className="h-4 w-4" />
                  My Bookings
                </TabsTrigger>
                <TabsTrigger value="provider-bookings" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Client Requests
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-bookings" className="space-y-4">
                {bookings.length === 0 ? (
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="py-16 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No bookings yet</h3>
                      <p className="text-muted-foreground mt-2">Browse providers and book a service</p>
                      <Button onClick={() => navigate('/providers')} className="mt-4">
                        Find Providers
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  bookings.map((booking) => renderBookingCard(booking, false))
                )}
              </TabsContent>

              <TabsContent value="provider-bookings" className="space-y-4">
                {providerBookings.length === 0 ? (
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="py-16 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No client requests</h3>
                      <p className="text-muted-foreground mt-2">You haven't received any booking requests yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  providerBookings.map((booking) => renderBookingCard(booking, true))
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="py-16 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No bookings yet</h3>
                    <p className="text-muted-foreground mt-2">Browse providers and book a service</p>
                    <Button onClick={() => navigate('/providers')} className="mt-4">
                      Find Providers
                    </Button>
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
