import { useState } from "react";
import { Menu, X, User, Globe, LogOut, MessageCircle } from "lucide-react";
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
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

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
                  <Button>
                    <User className="h-4 w-4 mr-2" />
                    {t('account')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    {t('profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t('messages')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/bookings")}>
                    {t('my_bookings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/auth")}>
                <User className="h-4 w-4 mr-2" />
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
                <Button variant="ghost" className="w-full justify-start rtl:justify-end" onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}>
                  {t('profile')}
                </Button>
                <Button variant="ghost" className="w-full justify-start rtl:justify-end" onClick={() => { navigate("/messages"); setIsMenuOpen(false); }}>
                  <MessageCircle className="h-4 w-4 me-2" />
                  {t('messages')}
                </Button>
                <Button variant="ghost" className="w-full justify-start rtl:justify-end" onClick={() => { navigate("/bookings"); setIsMenuOpen(false); }}>
                  {t('my_bookings')}
                </Button>
                <Button className="w-full" onClick={handleSignOut}>
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
