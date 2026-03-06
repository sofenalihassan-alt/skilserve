import { useState, useEffect } from "react";
import { Menu, X, User, Globe, LogOut, MessageSquareText, Home, Search, AlertTriangle, Briefcase, CalendarDays, Phone } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
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
    <Button variant="ghost" onClick={onClick} title={title || label} className="gap-2 relative">
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon"><Globe className="h-4 w-4" /></Button>
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
                  <button className="flex items-center gap-2 rounded-full border border-border p-1 pe-3 hover:bg-accent/10 transition-colors">
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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            {user && (
              <Button variant="ghost" size="icon" onClick={() => navigate("/messages")} title={t('messages')} className="relative">
                <MessageSquareText className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px] font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            )}
            <button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-1">
            {user ? (
              <div className="flex items-center gap-3 px-4 py-3 mb-3 border-b border-border">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">{fullName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{fullName || t('account')}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            ) : null}

            <div className="flex justify-around pb-3 border-b border-border">
              <Button variant="ghost" size="icon" onClick={() => { navigate("/"); setIsMenuOpen(false); }} title={t('home')}><Home className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => { window.dispatchEvent(new Event('open-command-palette')); setIsMenuOpen(false); }} title={t('find_services')}><Search className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => { navigate("/emergency"); setIsMenuOpen(false); }} title={t('emergency')}><AlertTriangle className="h-5 w-5" /></Button>
              {!isProvider && (
                <Button variant="ghost" size="icon" onClick={() => { user ? navigate("/provider-registration") : navigate("/auth"); setIsMenuOpen(false); }} title={t('become_provider')}><Briefcase className="h-5 w-5" /></Button>
              )}
            </div>

            {user ? (
              <div className="space-y-1 pt-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}>
                  <User className="h-4 w-4 me-2" />{t('profile')}
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/bookings"); setIsMenuOpen(false); }}>
                  <CalendarDays className="h-4 w-4 me-2" />{t('my_bookings')}
                </Button>
                <div className="flex gap-2 px-4 py-2">
                  <Button variant="outline" size="sm" onClick={() => setLanguage("en")} className={language === 'en' ? 'border-primary' : ''}>English</Button>
                  <Button variant="outline" size="sm" onClick={() => setLanguage("ur")} className={language === 'ur' ? 'border-primary' : ''}>اردو</Button>
                </div>
                <Button className="w-full" variant="destructive" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 me-2" />{t('logout')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <div className="flex gap-2 px-4 py-2">
                  <Button variant="outline" size="sm" onClick={() => setLanguage("en")}>English</Button>
                  <Button variant="outline" size="sm" onClick={() => setLanguage("ur")}>اردو</Button>
                </div>
                <Button className="w-full" onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}>
                  <User className="h-4 w-4 me-2" />{t('login')}
                </Button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
