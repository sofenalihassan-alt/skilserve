import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Briefcase } from "lucide-react";
import { providerSchema, getSafeErrorMessage } from "@/lib/validation";
import Seo from "@/components/Seo";

interface ExistingProvider {
  id: string;
  business_name: string;
  category: string;
  hourly_rate: number;
  years_experience: number | null;
  specialization: string | null;
  bio: string | null;
  is_active: boolean | null;
  availability_24_7: boolean;
}

const ProviderRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [availability247, setAvailability247] = useState(false);
  const [existingProvider, setExistingProvider] = useState<ExistingProvider | null>(null);
  const [category, setCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [formValues, setFormValues] = useState({
    businessName: '',
    hourlyRate: '',
    yearsExperience: '',
    specialization: '',
    bio: '',
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchExisting();
    else setFetching(false);
  }, [user]);

  const fetchExisting = async () => {
    if (!user) return;
    const { data } = await supabase.from('service_providers')
      .select('id, business_name, category, hourly_rate, years_experience, specialization, bio, is_active, availability_24_7')
      .eq('user_id', user.id).maybeSingle();
    if (data) {
      setExistingProvider(data);
      setFormValues({
        businessName: data.business_name,
        hourlyRate: String(data.hourly_rate),
        yearsExperience: data.years_experience != null ? String(data.years_experience) : '',
        specialization: data.specialization || '',
        bio: data.bio || '',
      });
      setCategory(data.category);
      setAvailability247(data.availability_24_7);
    }
    setFetching(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      setLoading(false);
      return;
    }

    const validation = providerSchema.safeParse({
      businessName: formValues.businessName,
      hourlyRate: parseFloat(formValues.hourlyRate),
      yearsExperience: parseInt(formValues.yearsExperience) || 0,
      bio: formValues.bio,
      specialization: formValues.specialization,
    });

    if (!validation.success) {
      toast({ title: "Validation Error", description: validation.error.errors[0].message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!category) {
      setCategoryError("Please select a service category.");
      setLoading(false);
      return;
    }
    setCategoryError("");

    const payload = {
      business_name: validation.data.businessName,
      category: category as any,
      hourly_rate: validation.data.hourlyRate,
      years_experience: validation.data.yearsExperience,
      specialization: validation.data.specialization,
      bio: validation.data.bio,
      is_active: true,
      availability_24_7: availability247,
    };

    let error;
    if (existingProvider) {
      ({ error } = await supabase.from("service_providers").update(payload).eq('id', existingProvider.id));
    } else {
      ({ error } = await supabase.from("service_providers").insert([{ ...payload, user_id: user.id }]));
    }

    if (error) {
      toast({ title: "Failed", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({
        title: "Success",
        description: existingProvider
          ? "Provider profile updated!"
          : "Your registration is pending admin approval. You'll be notified once approved.",
      });
      navigate("/profile");
    }

    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isEditing = !!existingProvider;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">

      <Seo title={"Become a Service Provider | Skill Serve"} description={"Join Skill Serve as a verified professional. Create your profile, showcase your work and receive booking requests from local customers."} />
      <Header />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8 border border-primary/20">
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{isEditing ? 'Edit Provider Profile' : 'Provider Registration'}</h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update your service provider information' : 'Complete your profile to start offering services'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input id="businessName" value={formValues.businessName} onChange={(e) => setFormValues({ ...formValues, businessName: e.target.value })} placeholder="Your business or professional name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Service Category *</Label>
              <Select value={category} onValueChange={(value) => { setCategory(value); setCategoryError(""); }}>
                <SelectTrigger id="category" aria-required="true" aria-invalid={!!categoryError} aria-describedby={categoryError ? "category-error" : undefined}><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="carpentry">Carpentry</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="landscaping">Landscaping</SelectItem>
                  <SelectItem value="handyman">Handyman</SelectItem>
                </SelectContent>
              </Select>
              {categoryError && <p id="category-error" role="alert" className="text-sm text-destructive">{categoryError}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (PKR) *</Label>
                <Input id="hourlyRate" value={formValues.hourlyRate} onChange={(e) => setFormValues({ ...formValues, hourlyRate: e.target.value })} type="number" min="0" step="0.01" placeholder="1000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input id="yearsExperience" value={formValues.yearsExperience} onChange={(e) => setFormValues({ ...formValues, yearsExperience: e.target.value })} type="number" min="0" placeholder="5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" value={formValues.specialization} onChange={(e) => setFormValues({ ...formValues, specialization: e.target.value })} placeholder="e.g., Residential Plumbing, Emergency Services" />
            </div>

            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-muted-foreground">
              <p>✅ A unique license number will be auto-generated for your provider profile.</p>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
              <Checkbox id="availability247" checked={availability247} onCheckedChange={(checked) => setAvailability247(checked === true)} />
              <div>
                <Label htmlFor="availability247" className="font-semibold cursor-pointer">Available 24/7 for Emergency Services</Label>
                <p className="text-xs text-muted-foreground">Check this if you are available round the clock for emergency calls</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea id="bio" value={formValues.bio} onChange={(e) => setFormValues({ ...formValues, bio: e.target.value })} placeholder="Tell potential clients about your experience..." className="min-h-[120px]" required />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isEditing ? "Updating..." : "Creating Profile...") : (isEditing ? "Update Profile" : "Complete Registration")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProviderRegistration;
