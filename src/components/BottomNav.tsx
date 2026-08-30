import { authRedirect } from "@/lib/authRedirect";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Map, CalendarDays, MessageSquareText, MoreHorizontal, AlertTriangle, Briefcase, Globe, Shield, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProvider, setIsProvider] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('messages').select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id).eq('is_read', false)
      .then(({ count }) => setUnreadCount(count || 0));
    supabase.from('service_providers').select('id').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setIsProvider(!!data));
    const channel = supabase.channel('unread-bottom')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
        supabase.from('messages').select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id).eq('is_read', false)
          .then(({ count }) => setUnreadCount(count || 0));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path.startsWith("/providers")) return location.pathname === "/providers";
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
    { icon: CalendarDays, label: t('my_bookings'), path: "/bookings" },
    ...(user ? [{ icon: MessageSquareText, label: t('messages'), path: "/messages", badge: unreadCount }] : []),
  ];

  const DrawerItem = ({ icon: Icon, label, onClick, destructive }: { icon: React.ElementType; label: string; onClick: () => void; destructive?: boolean }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors hover:bg-accent",
        destructive && "text-destructive"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
      <nav className="fixed inset-x-0 bottom-0 z-50 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ icon: Icon, label, path, badge }: any) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 transition-colors relative",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} strokeWidth={active ? 2.5 : 1.5} />
              {!!badge && badge > 0 && (
                <span className="absolute top-1 right-1/4 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[9px] font-bold">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              <span
                className={cn(
                  "max-w-full truncate px-1 text-[10px]",
                  active ? "font-semibold" : "font-medium"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}

        {/* More drawer trigger */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-muted-foreground transition-colors hover:text-foreground">
              <MoreHorizontal className="h-5 w-5" strokeWidth={1.5} />
              <span className="max-w-full truncate px-1 text-[10px] font-medium">More</span>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Menu</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 space-y-1">
              <DrawerItem icon={AlertTriangle} label={t('emergency')} onClick={() => go("/emergency")} />
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
    </nav>
  );
};
