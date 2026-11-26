import { Phone, Mail, Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative overflow-hidden border-t border-border/50 bg-[radial-gradient(ellipse_at_10%_0%,hsl(var(--primary)/0.09),transparent_42%),hsl(var(--card)/0.72)] backdrop-blur-2xl">
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.6fr_0.8fr_0.8fr]">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center text-2xl font-extrabold tracking-[-0.04em] text-foreground"
            >
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Skill Serve
              </span>
            </Link>

            <p className="max-w-md text-sm leading-7 text-muted-foreground">
              {t("skill_serve")} — Your trusted platform for professional
              services.
            </p>

            <div className="space-y-2 pt-1">
              <a
                href="tel:03024942710"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0" />
                <span>0302-4942710</span>
              </a>

              <a
                href="mailto:alihassan39se@gmail.com"
                className="flex items-center gap-2 break-all text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>alihassan39se@gmail.com</span>
              </a>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Pakistan</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Services
            </h4>

            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link
                to="/providers"
                className="transition-colors hover:text-primary"
              >
                {t("find_services")}
              </Link>

              <Link
                to="/emergency"
                className="transition-colors hover:text-primary"
              >
                {t("emergency")}
              </Link>

              <Link
                to="/provider-registration"
                className="transition-colors hover:text-primary"
              >
                {t("become_provider")}
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h4>

            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link
                to="/"
                className="transition-colors hover:text-primary"
              >
                Home
              </Link>

              <Link
                to="/contact"
                className="transition-colors hover:text-primary"
              >
                Contact Us
              </Link>

              <Link
                to="/terms"
                className="transition-colors hover:text-primary"
              >
                Terms of Service
              </Link>

              <Link
                to="/privacy"
                className="transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col gap-4 border-t border-border/60 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            &copy; {new Date().getFullYear()} Skill Serve. All rights reserved.
          </p>

          <p
            className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-end"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontStyle: "italic",
            }}
          >
            <span>Created with</span>
            <Heart className="h-3 w-3 fill-destructive text-destructive" />
            <span>by</span>
            <span className="font-semibold tracking-wide text-foreground/90">
              Ali Virk
            </span>
            <span>&</span>
            <span className="font-semibold tracking-wide text-foreground/90">
              Noman Ahmad
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};