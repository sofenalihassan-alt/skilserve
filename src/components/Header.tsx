import { authRedirect } from "@/lib/authRedirect";
import { useState, useEffect } from "react";
import { User, Globe, LogOut, MessageSquareText, Home, Search, AlertTriangle, Briefcase, CalendarDays, Phone, Shield } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import logo from "@/assets/logo-header.webp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProvider, setIsProvider] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('avatar_url, full_name').eq('id', user.id).maybeSingle()
        .then(({ data }) => {
          if (data) { setAvatarUrl(data.avatar_url); setFullName(data.full_name || ''); }
        });
      supabase.from('service_providers').select('id').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => { setIsProvider(!!data); });
      fetchUnread();
      const channel = supabase.channel('unread-header')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => fetchUnread())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } else {
      setIsProvider(false);
    }
  }, [user]);

  const fetchUnread = async () => {
    if (!user) return;
    const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id).eq('is_read', false);
    setUnreadCount(count || 0);
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

 const NavButton = ({
  icon: Icon,
  label,
  onClick,
  title,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  title?: string;
  badge?: number;
}) => (
  <Button
    variant="ghost"
    onClick={onClick}
    title={title || label}
    className="relative gap-2"
  >
    <Icon className="h-4 w-4 shrink-0" />
    <span>{label}</span>

    {badge !== undefined && badge > 0 && (
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
        {badge > 99 ? "99+" : badge}
      </span>
    )}
  </Button>
);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            aria-label={t('skill_serve')}
            className="flex shrink-0 items-center gap-2 h-auto p-0 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center md:h-10 md:w-10">
              <img src={logo} alt="" width={176} height={176} className="h-full w-full object-contain" />
            </span>
            <span className="font-heading text-lg md:text-xl font-bold text-foreground">
              {t('skill_serve')}
            </span>
          </Button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavButton icon={Home} label={t('home')} onClick={() => navigate("/")} />
            <NavButton icon={Search} label={t('find_services')} onClick={() => window.dispatchEvent(new Event('open-command-palette'))} />
            <NavButton icon={AlertTriangle} label={t('emergency')} onClick={() => navigate("/emergency")} />
            {!isProvider && (
              <NavButton icon={Briefcase} label={t('become_provider')} onClick={() => user ? navigate("/provider-registration") : navigate(authRedirect("/provider-registration"))} />
            )}
            {user && <NavButton icon={MessageSquareText} label={t('messages')} onClick={() => navigate("/messages")} badge={unreadCount} />}
            {user && <NotificationCenter />}
            {isAdmin && <NavButton icon={Shield} label="Admin" onClick={() => navigate("/admin")} />}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Change language"><Globe className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ur")}>اردو</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label={t('account')} className="flex items-center gap-2 rounded-full border border-border p-1 pe-3 hover:bg-accent/10 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">{fullName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden lg:inline">{fullName || t('account')}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}><User className="h-4 w-4 me-2" />{t('profile')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")}><MessageSquareText className="h-4 w-4 me-2" />{t('messages')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/bookings")}><CalendarDays className="h-4 w-4 me-2" />{t('my_bookings')}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}><LogOut className="h-4 w-4 me-2" />{t('logout')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate(authRedirect())}><User className="h-4 w-4 me-2" /><span className="hidden lg:inline">{t('login')}</span></Button>
            )}
          </nav>

          {/* Mobile: search + theme + notifications in a compact glass pill */}
          <div className="flex md:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
              title={t('find_services')}
              aria-label={t('find_services')}
              className="h-10 w-10 text-foreground"
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>

            <ThemeToggle />

            {user && (
              <div className="relative">
                <NotificationCenter />
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
