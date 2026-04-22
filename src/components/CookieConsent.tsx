import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "ss_cookie_consent_v1";

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setShow(false);
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[60] rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-4 md:p-5 animate-in slide-in-from-bottom-5 fade-in"
    >
      <div className="flex gap-3">
        <div className="shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Cookie className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">We use cookies</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            We use essential cookies to keep you signed in and improve your experience. See our{" "}
            <Link to="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={accept} className="flex-1">
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={reject} className="flex-1">
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
