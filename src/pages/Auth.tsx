import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REFERRAL_STORAGE_KEY } from "@/hooks/useReferralCapture";
import { Label } from "@/components/ui/label";
import { User, Briefcase, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { loginSchema, signupSchema, getSafeErrorMessage } from "@/lib/validation";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";

const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [userType, setUserType] = useState<"user" | "provider">("user");
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const nextPath = safeNext(new URLSearchParams(window.location.search).get("next"));
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && /^SS-[A-Z0-9]{4,12}$/i.test(ref.trim())) {
      try { localStorage.setItem(REFERRAL_STORAGE_KEY, ref.trim().toUpperCase()); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate(nextPath);
    }
  }, [user, navigate, nextPath]);

  const handleForgotPassword = async () => {
    const emailInput = document.getElementById("login-email") as HTMLInputElement;
    const email = emailInput?.value?.trim();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check Your Email",
        description: "A password reset link has been sent to your email.",
      });
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(nextPath)}`,
    });
    if (error) {
      toast({
        title: "Google Sign-In Failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate input with zod
    const validation = loginSchema.safeParse({ email, password });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      setValidationMessage(firstError.message);
      const invalidField = String(firstError.path[0]);
      const formElement = e.currentTarget;
      window.setTimeout(() => formElement.querySelector<HTMLInputElement>(`[name="${invalidField}"]`)?.focus(), 0);
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    setValidationMessage("");
    const { error } = await signIn(validation.data.email, validation.data.password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: getSafeErrorMessage(error),
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Logged in successfully"
      });
      navigate(nextPath);
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;

    // Validate input with zod
    const validation = signupSchema.safeParse({ email, password, fullName, phone });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    setValidationMessage("");
    const { error } = await signUp(
      validation.data.email, 
      validation.data.password, 
      validation.data.fullName, 
      validation.data.phone, 
      userType
    );
    
    if (error) {
      toast({
        title: "Signup Failed",
        description: getSafeErrorMessage(error),
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: userType === "provider" 
          ? "Account created! Please complete your provider profile." 
          : "Account created successfully! You can now log in."
      });
      
      if (userType === "provider") {
        navigate("/provider-registration");
      } else {
        setActiveTab("login");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Seo title={"Sign In or Create an Account | Skill Serve"} description={"Log in or sign up for Skill Serve to book verified local professionals, manage your bookings and chat with service providers."} noindex />
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {activeTab === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground">
              {activeTab === "login" ? "Login to continue" : "Sign up to get started"}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <div className="mb-6">
              <Label className="mb-2 block">Account Type</Label>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Account type">
                <Button
                  type="button"
                  variant={userType === "user" ? "default" : "outline"}
                  onClick={() => setUserType("user")}
                  aria-pressed={userType === "user"}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  User
                </Button>
                <Button
                  type="button"
                  variant={userType === "provider" ? "default" : "outline"}
                  onClick={() => setUserType("provider")}
                  aria-pressed={userType === "provider"}
                  className="flex items-center gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  Provider
                </Button>
              </div>
            </div>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                {validationMessage && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{validationMessage}</p>}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    name="email"
                    type="email" 
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    name="password"
                    type="password" 
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm text-muted-foreground h-auto"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    Forgot Password?
                  </Button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4" noValidate>
                {validationMessage && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{validationMessage}</p>}
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input 
                    id="signup-name" 
                    name="fullName"
                    type="text" 
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    name="email"
                    type="email" 
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone (Optional)</Label>
                  <Input 
                    id="signup-phone" 
                    name="phone"
                    type="tel" 
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    name="password"
                    type="password" 
                    placeholder="Create a password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
