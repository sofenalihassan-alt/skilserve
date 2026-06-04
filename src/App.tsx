import { useState, useCallback } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SplashScreen } from "@/components/SplashScreen";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { CommandPalette } from "@/components/CommandPalette";
import { BottomNav } from "@/components/BottomNav";
import { TermsAcceptanceDialog } from "@/components/TermsAcceptanceDialog";
import { CookieConsent } from "@/components/CookieConsent";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index";
import Providers from "./pages/Providers";
import ProviderDetail from "./pages/ProviderDetail";
import Auth from "./pages/Auth";
import ProviderRegistration from "./pages/ProviderRegistration";
import Emergency from "./pages/Emergency";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PushNotificationInit = ({ children }: { children: React.ReactNode }) => {
  usePushNotifications();
  return <>{children}</>;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
          <SmoothScrollProvider>
          <BrowserRouter>
            <AuthProvider>
              <LanguageProvider>
                <CommandPalette />
                <BottomNav />
                <TermsAcceptanceDialog />
                <CookieConsent />
                <PushNotificationInit>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/providers" element={<ProtectedRoute><Providers /></ProtectedRoute>} />
                    <Route path="/provider/:id" element={<ProtectedRoute><ProviderDetail /></ProtectedRoute>} />
                    <Route path="/provider-registration" element={<ProtectedRoute><ProviderRegistration /></ProtectedRoute>} />
                    <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                    <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PushNotificationInit>
              </LanguageProvider>
            </AuthProvider>
          </BrowserRouter>
          </SmoothScrollProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
