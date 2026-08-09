import { useState, useEffect } from "react";
import { Menu, X, User, Globe, LogOut, MessageSquareText, Home, Search, AlertTriangle, Briefcase, CalendarDays, Phone, Shield } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const NavButton = ({ icon: Icon, label, onClick, title, badge }: { icon: React.ElementType; label: string; onClick: () => void; title?: string; badge?: number }) => (
  <Button
      variant="ghost"
      onClick={onClick}
      title={title || label}
      className="gap-2 relative"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
      <Icon className="h-4 w-4" />
      <span className="hidden lg:inline">{label}</span>
      {!!badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px] font-bold">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="Skill Serve" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-xl font-bold hidden sm:inline">{t('skill_serve')}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavButton icon={Home} label={t('home')} onClick={() => navigate("/")} />
            <NavButton icon={Search} label={t('find_services')} onClick={() => window.dispatchEvent(new Event('open-command-palette'))} />
            <NavButton icon={AlertTriangle} label={t('emergency')} onClick={() => navigate("/emergency")} />
            {!isProvider && (
              <NavButton icon={Briefcase} label={t('become_provider')} onClick={() => user ? navigate("/provider-registration") : navigate("/auth")} />
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
              <Button onClick={() => navigate("/auth")}><User className="h-4 w-4 me-2" /><span className="hidden lg:inline">{t('login')}</span></Button>
            )}
          </nav>

                    {/* Mobile: search + theme + notifications */}
          <div className="flex md:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
              title={t('find_services')}
              aria-label={t('find_services')}
              className="h-9 w-9"
            >
              <Search className="h-5 w-5" />
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
