import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Providers from "./pages/Providers";
import Auth from "./pages/Auth";
import ProviderRegistration from "./pages/ProviderRegistration";
import Emergency from "./pages/Emergency";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/provider-registration" element={<ProviderRegistration />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/bookings" element={<Bookings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
