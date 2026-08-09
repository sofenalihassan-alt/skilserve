import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarUpload } from '@/components/AvatarUpload';
import { Separator } from '@/components/ui/separator';
import { CountryStateSelector } from '@/components/CountryStateSelector';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { VerificationCenter } from '@/components/VerificationCenter';
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';
import { FavoritesView } from '@/components/FavoritesView';
import { PackagesManager } from '@/components/PackagesManager';
import { PortfolioManager } from '@/components/PortfolioManager';
import { ProviderEarnings } from '@/components/ProviderEarnings';
import { ReferralCard } from '@/components/ReferralCard';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Phone, Mail, Save, Shield, Briefcase, Heart } from 'lucide-react';
import { profileUpdateSchema, getSafeErrorMessage } from '@/lib/validation';
import Seo from "@/components/Seo";

interface ProfileData {
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
}

interface ProviderData {
  id: string;
  business_name: string;
  category: string;
  hourly_rate: number;
  years_experience: number | null;
  specialization: string | null;
  is_active: boolean;
  verification_status: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [providerData, setProviderData] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    avatar_url: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchProviderData();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (!error && data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip_code: data.zip_code || '',
        country: (data as any).country || '',
      });
    }
    setLoading(false);
  };

  const fetchProviderData = async () => {
    if (!user) return;
    const { data } = await supabase.from('service_providers')
      .select('id, business_name, category, hourly_rate, years_experience, specialization, is_active, verification_status')
      .eq('user_id', user.id).maybeSingle();
    if (data) setProviderData(data as ProviderData);
  };

  const handleSave = async () => {
    if (!user) return;
    const validationResult = profileUpdateSchema.safeParse({
      full_name: formData.full_name,
      phone: formData.phone || undefined,
      avatar_url: formData.avatar_url || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      zip_code: formData.zip_code || undefined,
      country: formData.country || undefined,
    });
    if (!validationResult.success) {
      toast({ title: 'Validation Error', description: validationResult.error.errors[0].message, variant: 'destructive' });
      return;
    }
    const d = validationResult.data;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: d.full_name,
      phone: d.phone || null,
      avatar_url: formData.avatar_url || null,
      address: d.address || null,
      city: d.city || null,
      state: d.state || null,
      zip_code: d.zip_code || null,
      country: formData.country || null,
      updated_at: new Date().toISOString(),
    } as any).eq('id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: getSafeErrorMessage(error), variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Profile updated successfully!' });
      fetchProfile();
    }
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
      <Seo title={"My Profile | Skill Serve"} description={"Manage your Skill Serve account details, saved addresses, favourites and notification preferences."} noindex />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-xl" />
            <Card className="relative border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="pt-8 pb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative group">
                    <AvatarUpload
                      userId={user!.id}
                      currentUrl={formData.avatar_url}
                      fallbackText={formData.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      onUploaded={(url) => setFormData({ ...formData, avatar_url: url })}
                      size="lg"
                    />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-bold">{formData.full_name || 'User'}</h1>
                    <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-2">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </p>
                    {providerData && (
                      <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium capitalize">{providerData.category} Provider</span>
                        <span className={`w-2 h-2 rounded-full ${providerData.is_active ? 'bg-success' : 'bg-muted'}`} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Information */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><User className="h-5 w-5 text-primary" /></div>
                <div>
                  <CardTitle>{t('profile')}</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="pl-10 bg-background/50" placeholder="+92 300 1234567" />
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold">Address Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="bg-background/50" placeholder="123 Main Street" />
                  </div>
                  <CountryStateSelector
                    country={formData.country || ''}
                    state={formData.state || ''}
                    onCountryChange={(c) => setFormData({ ...formData, country: c })}
                    onStateChange={(s) => setFormData({ ...formData, state: s })}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input id="zip_code" value={formData.zip_code || ''} onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })} className="bg-background/50" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {providerData && (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10"><Briefcase className="h-5 w-5 text-accent" /></div>
                  <div>
                    <CardTitle>Provider Details</CardTitle>
                    <CardDescription>Your service provider information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-semibold mt-1">{providerData.business_name}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-semibold mt-1 capitalize">{providerData.category}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                    <p className="text-sm text-muted-foreground">Hourly Rate</p>
                    <p className="font-semibold mt-1">Rs. {providerData.hourly_rate}/hr</p>
                  </div>
                  {providerData.years_experience && (
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-semibold mt-1">{providerData.years_experience} years</p>
                    </div>
                  )}
                  {providerData.specialization && (
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50 md:col-span-2">
                      <p className="text-sm text-muted-foreground">Specialization</p>
                      <p className="font-semibold mt-1">{providerData.specialization}</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="outline" onClick={() => navigate('/provider-registration')} className="gap-2">
                    <Shield className="h-4 w-4" />
                    Edit Provider Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {providerData && (
            <VerificationCenter
              providerId={providerData.id}
              verificationStatus={providerData.verification_status || 'unverified'}
            />
          )}

          {providerData && (
            <AvailabilityCalendar providerId={providerData.id} />
          )}

          {providerData && <ProviderEarnings providerId={providerData.id} />}

          <ReferralCard />

          {providerData && <PackagesManager providerId={providerData.id} />}

          {providerData && <PortfolioManager providerId={providerData.id} />}

          {/* Favorites */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10"><Heart className="h-5 w-5 text-red-500" /></div>
                <div>
                  <CardTitle>My Favorites</CardTitle>
                  <CardDescription>Providers you've saved</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FavoritesView />
            </CardContent>
          </Card>


          <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
