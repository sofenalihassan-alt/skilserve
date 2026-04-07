import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [expired, setExpired] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecovered(true);
      }
    });

    // Also check URL hash for recovery type
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") === "recovery") {
      setRecovered(true);
    }

    const timeout = setTimeout(() => {
      setExpired(prev => prev); // trigger re-render check
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Show expired after 5s if not recovered
  useEffect(() => {
    if (recovered) return;
    const timer = setTimeout(() => setExpired(true), 5000);
    return () => clearTimeout(timer);
  }, [recovered]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const validation = resetSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } else {
      setSuccess(true);
      toast({ title: "Success", description: "Password updated successfully!" });
      setTimeout(() => navigate("/auth"), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold mb-2">Password Updated!</h1>
            <p className="text-muted-foreground">Redirecting you to login...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!recovered && expired) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold mb-2">Invalid or Expired Link</h1>
            <p className="text-muted-foreground mb-6">
              This password reset link is no longer valid. Please request a new one.
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Back to Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!recovered) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" strokeWidth={1.5} />
            <p className="text-muted-foreground">Verifying your reset link...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8">
          <div className="text-center mb-8">
            <Lock className="h-12 w-12 text-primary mx-auto mb-4" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
            <p className="text-muted-foreground">Enter your new password below</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" placeholder="Min 8 characters" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
