import { Phone, Mail, Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border/60 bg-card/50">
      <div className="container mx-auto px-4 py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center text-xl font-bold tracking-tight text-foreground"
            >
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Skill Serve
              </span>
            </Link>

            <p className="max-w-md text-sm leading-6 text-muted-foreground">
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
        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
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