import { useState, useEffect } from "react";
import { Menu, X, User, Globe, LogOut, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('avatar_url, full_name').eq('id', user.id).maybeSingle()
        .then(({ data }) => {
          if (data) {
            setAvatarUrl(data.avatar_url);
            setFullName(data.full_name || '');
          }
        });
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">SS</span>
            </div>
            <span className="text-xl font-bold">
              {t('skill_serve')}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={() => navigate("/providers")}>
              {t('find_services')}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/emergency")}>
              {t('emergency')}
            </Button>
            <Button variant="ghost" onClick={() => user ? navigate("/provider-registration") : navigate("/auth")}>
              {t('become_provider')}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ur")}>
                  اردو
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border p-1 pe-3 hover:bg-accent transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                        {fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden lg:inline">{fullName || t('account')}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 me-2" />
                    {t('profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")}>
                    <MessageCircle className="h-4 w-4 me-2" />
                    {t('messages')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/bookings")}>
                    {t('my_bookings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 me-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/auth")}>
                <User className="h-4 w-4 me-2" />
                {t('login')}
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start rtl:justify-end" onClick={() => { navigate("/providers"); setIsMenuOpen(false); }}>
              {t('find_services')}
            </Button>
            <Button variant="ghost" className="w-full justify-start rtl:justify-end" onClick={() => { navigate("/emergency"); setIsMenuOpen(false); }}>
              {t('emergency')}
            </Button>
            <Button variant="ghost" className="w-full justify-start rtl:justify-end" onClick={() => { user ? navigate("/provider-registration") : navigate("/auth"); setIsMenuOpen(false); }}>
              {t('become_provider')}
            </Button>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setLanguage("en")}>
                English
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLanguage("ur")}>
                اردو
              </Button>
            </div>
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                      {fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{fullName || t('account')}</span>
                </div>
                <Button variant="ghost" className="w-full justify-start rtl:justify-end" onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}>
                  <User className="h-4 w-4 me-2" />
                  {t('profile')}
                </Button>
                <Button variant="ghost" className="w-full justify-start rtl:justify-end" onClick={() => { navigate("/messages"); setIsMenuOpen(false); }}>
                  <MessageCircle className="h-4 w-4 me-2" />
                  {t('messages')}
                </Button>
                <Button variant="ghost" className="w-full justify-start rtl:justify-end" onClick={() => { navigate("/bookings"); setIsMenuOpen(false); }}>
                  {t('my_bookings')}
                </Button>
                <Button className="w-full" variant="destructive" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 me-2" />
                  {t('logout')}
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}>
                <User className="h-4 w-4 me-2" />
                {t('login')}
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
