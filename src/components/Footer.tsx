import { Phone, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card/80 backdrop-blur border-t border-border mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold gradient-text">Skill Serve</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('skill_serve')} — Your trusted platform for professional services.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Contact</h4>
            <a href="tel:03024942710" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
              <Phone className="h-4 w-4" />
              0302-4942710
            </a>
            <a href="mailto:alihassan39se@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
              <Mail className="h-4 w-4" />
              alihassan39se@gmail.com
            </a>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Quick Links</h4>
            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <Link to="/providers" className="hover:text-primary transition-colors">{t('find_services')}</Link>
              <Link to="/emergency" className="hover:text-primary transition-colors">{t('emergency')}</Link>
              <Link to="/provider-registration" className="hover:text-primary transition-colors">{t('become_provider')}</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} Skill Serve. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}>
            Created with <Heart className="h-3 w-3 text-destructive fill-destructive inline animate-pulse" /> by
            <span className="font-semibold text-foreground/90 tracking-wide">Ali Virk</span> &
            <span className="font-semibold text-foreground/90 tracking-wide">Noman Ahmad</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
