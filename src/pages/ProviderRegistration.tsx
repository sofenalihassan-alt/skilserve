import { useState } from "react";
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

const ProviderRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [availability247, setAvailability247] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const businessName = formData.get("businessName") as string;
    const category = formData.get("category") as string;
    const hourlyRate = parseFloat(formData.get("hourlyRate") as string);
    const yearsExperience = parseInt(formData.get("yearsExperience") as string);
    const specialization = formData.get("specialization") as string;
    const bio = formData.get("bio") as string;
    const licenseNumber = formData.get("licenseNumber") as string;

    if (!user) {
      toast({ title: "Error", description: "You must be logged in to register as a provider", variant: "destructive" });
      setLoading(false);
      return;
    }

    const validation = providerSchema.safeParse({ businessName, hourlyRate, yearsExperience, bio, licenseNumber, specialization });
    
    if (!validation.success) {
      toast({ title: "Validation Error", description: validation.error.errors[0].message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("service_providers")
      .insert([{
        user_id: user.id,
        business_name: validation.data.businessName,
        category: category as any,
        hourly_rate: validation.data.hourlyRate,
        years_experience: validation.data.yearsExperience,
        specialization: validation.data.specialization,
        bio: validation.data.bio,
        license_number: validation.data.licenseNumber,
        is_active: true,
        availability_24_7: availability247,
      }]);

    if (error) {
      toast({ title: "Registration Failed", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Provider profile created successfully!" });
      navigate("/providers");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8 border border-primary/20">
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Provider Registration</h1>
            <p className="text-muted-foreground">
              Complete your profile to start offering services
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input id="businessName" name="businessName" type="text" placeholder="Your business or professional name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Service Category *</Label>
              <Select name="category" required>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (PKR) *</Label>
                <Input id="hourlyRate" name="hourlyRate" type="number" min="0" step="0.01" placeholder="1000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input id="yearsExperience" name="yearsExperience" type="number" min="0" placeholder="5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" name="specialization" type="text" placeholder="e.g., Residential Plumbing, Emergency Services" />
            </div>

            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-muted-foreground">
              <p>✅ A unique license number will be auto-generated for your provider profile.</p>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
              <Checkbox
                id="availability247"
                checked={availability247}
                onCheckedChange={(checked) => setAvailability247(checked === true)}
              />
              <div>
                <Label htmlFor="availability247" className="font-semibold cursor-pointer">
                  Available 24/7 for Emergency Services
                </Label>
                <p className="text-xs text-muted-foreground">
                  Check this if you are available round the clock for emergency calls
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea id="bio" name="bio" placeholder="Tell potential clients about your experience and services..." className="min-h-[120px]" required />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Profile..." : "Complete Registration"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProviderRegistration;
