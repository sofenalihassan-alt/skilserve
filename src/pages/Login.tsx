import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { User, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [activeTab, setActiveTab] = useState<"user" | "provider">("user");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic will be implemented with backend
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Login to continue</p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "user" | "provider")}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                User
              </TabsTrigger>
              <TabsTrigger value="provider" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Provider
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email or Phone</Label>
                  <Input id="user-email" type="text" placeholder="Enter your email or phone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">Password</Label>
                  <Input id="user-password" type="password" placeholder="Enter your password" />
                </div>
                <Button type="submit" className="w-full">Login as User</Button>
                <Button type="button" variant="link" className="w-full">
                  Forgot Password?
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="provider">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-id">Provider ID</Label>
                  <Input id="provider-id" type="text" placeholder="Enter your provider ID" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider-password">Password</Label>
                  <Input id="provider-password" type="password" placeholder="Enter your password" />
                </div>
                <Button type="submit" className="w-full">Login as Provider</Button>
                <Button type="button" variant="link" className="w-full">
                  Forgot Provider ID?
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button variant="link" className="p-0 h-auto">
                Sign Up
              </Button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
