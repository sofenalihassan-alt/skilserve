import { useState, useCallback, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SplashScreen, shouldShowSplash } from "@/components/SplashScreen";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useReferralCapture } from "@/hooks/useReferralCapture";
import { CommandPalette } from "@/components/CommandPalette";
import { BottomNav } from "@/components/BottomNav";
import { TermsAcceptanceDialog } from "@/components/TermsAcceptanceDialog";
import { CookieConsent } from "@/components/CookieConsent";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index";
import Providers from "./pages/Providers";
import ProviderDetail from "./pages/ProviderDetail";
import Auth from "./pages/Auth";
const ProviderRegistration = lazy(() => import("./pages/ProviderRegistration"));
import Emergency from "./pages/Emergency";
const Messages = lazy(() => import("./pages/Messages"));
const Profile = lazy(() => import("./pages/Profile"));
const Bookings = lazy(() => import("./pages/Bookings"));
import ResetPassword from "./pages/ResetPassword";
const Admin = lazy(() => import("./pages/Admin"));
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import OAuthConsent from "./pages/OAuthConsent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
const PushNotificationInit = ({ children }: { children: React.ReactNode }) => {
  usePushNotifications();
  useReferralCapture();
  return <>{children}</>;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(shouldShowSplash);
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
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-3 focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  Skip to main content
                </a>
                <CommandPalette />
                <BottomNav />
                <TermsAcceptanceDialog />
                <CookieConsent />
                <PushNotificationInit>
                  <Suspense fallback={<div role="status" aria-label="Loading" className="flex min-h-screen items-center justify-center bg-background"><Loader2 aria-hidden="true" className="h-8 w-8 animate-spin text-primary motion-reduce:animate-none" /></div>}>
                  <Routes>
                    <Route path="/auth" element={<main id="main-content" tabIndex={-1}><Auth /></main>} />
                    <Route path="/reset-password" element={<main id="main-content" tabIndex={-1}><ResetPassword /></main>} />
                    <Route path="/terms" element={<main id="main-content" tabIndex={-1}><TermsOfService /></main>} />
                    <Route path="/privacy" element={<main id="main-content" tabIndex={-1}><PrivacyPolicy /></main>} />
                    <Route path="/contact" element={<main id="main-content" tabIndex={-1}><Contact /></main>} />
                    <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
                    <Route path="/" element={<Index />} />
                    <Route path="/providers" element={<Providers />} />
                    <Route path="/provider/:id" element={<ProviderDetail />} />
                    <Route path="/provider-registration" element={<ProtectedRoute><main id="main-content" tabIndex={-1}><ProviderRegistration /></main></ProtectedRoute>} />
                    <Route path="/emergency" element={<main id="main-content" tabIndex={-1}><Emergency /></main>} />

                    <Route path="/messages" element={<ProtectedRoute><main id="main-content" tabIndex={-1}><Messages /></main></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                    <Route path="/admin" element={<AdminRoute><main id="main-content" tabIndex={-1}><Admin /></main></AdminRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
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
