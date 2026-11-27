import { authRedirect } from "@/lib/authRedirect";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, CalendarDays, MessageSquareText, MoreHorizontal, AlertTriangle, Briefcase, Globe, Shield, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigationBadges } from "@/hooks/useNavigationBadges";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { t, language, setLanguage } = useLanguage();
  const { messages: unreadCount, bookings: bookingCount } = useNavigationBadges(user?.id);
  const reduceMotion = useReducedMotion();
  const [isProvider, setIsProvider] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setIsProvider(false);
    if (!user) return;
    supabase.from('public_service_providers').select('id').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { if (active) setIsProvider(!!data); });
    return () => { active = false; };
  }, [user]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path.startsWith("/providers")) return location.pathname === "/providers" || location.pathname.startsWith("/provider/");
    return location.pathname === path;
  };

  const go = (path: string) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    setDrawerOpen(false);
    await signOut();
    navigate("/");
  };

  const tabs = [
    { icon: Home, label: t('home'), path: "/" },
    { icon: Map, label: t('find_services'), path: "/providers?view=map" },
    { icon: AlertTriangle, label: t('emergency'), path: "/emergency" },
    { icon: MessageSquareText, label: t('messages'), path: "/messages", badge: unreadCount },
    { icon: CalendarDays, label: t('my_bookings'), path: "/bookings", badge: bookingCount },
  ];

  const DrawerItem = ({ icon: Icon, label, onClick, destructive }: { icon: React.ElementType; label: string; onClick: () => void; destructive?: boolean }) => (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "flex h-auto items-center justify-start gap-3 w-full p-3 rounded-lg text-start transition-colors hover:bg-accent",
        destructive && "text-destructive"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );

  return (
      <nav aria-label={language === "ur" ? "مرکزی نیویگیشن" : "Main navigation"} className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-safe backdrop-blur-xl md:hidden">
        <LayoutGroup id="mobile-navigation">
        <div className="flex items-center h-16 gap-0.5 px-2">
        {tabs.map(({ icon: Icon, label, path, badge }) => {
          const active = isActive(path);
          return (
            <Button
              asChild
              variant="ghost"
              key={path}
              aria-current={active ? "page" : undefined}
              aria-label={`${label}${badge ? ` (${badge})` : ""}`}
              title={label}
              className={cn(
                "relative isolate flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-0 py-1 hover:bg-transparent hover:text-primary",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Link to={path} aria-label={`${label}${badge ? ` (${badge})` : ""}`} title={label}>
              {active && (
                <motion.span
                  layoutId="active-tab-pill"
                  aria-hidden="true"
                  className="absolute inset-x-0 top-1 -z-10 h-9 rounded-full bg-primary/10 ring-1 ring-inset ring-primary/15"
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative flex h-8 w-8 items-center justify-center">
              <Icon className="!h-5 !w-5" strokeWidth={active ? 2.5 : 1.5} />
              {!!badge && badge > 0 && (
                <span aria-hidden="true" className="absolute -top-0.5 -end-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-destructive-foreground ring-2 ring-background">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              </span>
              <span
                className={cn(
                  "block w-full min-w-0 truncate px-0.5 text-[10px] leading-3",
                  active ? "font-semibold" : "font-medium"
                )}
              >
                {label}
              </span>
              </Link>
            </Button>
          );
        })}

        {/* More drawer trigger */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
             <Button variant="ghost" aria-label={language === "ur" ? "مزید" : "More"} className="flex h-14 w-11 shrink-0 flex-col items-center justify-center gap-1 rounded-lg px-0 py-1 text-muted-foreground hover:bg-transparent hover:text-foreground">
               <span className="flex h-8 items-center"><MoreHorizontal className="!h-5 !w-5" strokeWidth={1.5} /></span>
               <span className="text-[10px] font-medium leading-3">{language === "ur" ? "مزید" : "More"}</span>
             </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
               <DrawerTitle>{language === "ur" ? "مینو" : "Menu"}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 space-y-1">
              {user && !isProvider && (
                <DrawerItem icon={Briefcase} label={t('become_provider')} onClick={() => go("/provider-registration")} />
              )}
              {!user && (
                <DrawerItem icon={Briefcase} label={t("become_provider")} onClick={() => go(authRedirect("/provider-registration"))} />
              )}
              {isAdmin && (
                <DrawerItem icon={Shield} label="Admin" onClick={() => go("/admin")} />
              )}
              {user && (
                <DrawerItem icon={User} label={t('profile')} onClick={() => go("/profile")} />
              )}
              <DrawerItem
                icon={Globe}
                label={language === "en" ? "اردو (Urdu)" : "English"}
                onClick={() => { setLanguage(language === "en" ? "ur" : "en"); setDrawerOpen(false); }}
              />
              {user ? (
                <DrawerItem icon={LogOut} label={t('logout')} onClick={handleSignOut} destructive />
              ) : (
                <DrawerItem icon={User} label={t("login")} onClick={() => go(authRedirect())} />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
       </LayoutGroup>
    </nav>
  );
};
