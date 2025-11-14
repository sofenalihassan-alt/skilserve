import { useState } from "react";
import { Menu, X, User, Globe, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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
              {language === "en" ? "Skill Serve" : "سکل سرو"}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={() => navigate("/providers")}>
              {language === "en" ? "Find Services" : "خدمات تلاش کریں"}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/emergency")}>
              {language === "en" ? "Emergency" : "ایمرجنسی"}
            </Button>
            <Button variant="ghost">
              {language === "en" ? "Become a Provider" : "فراہم کنندہ بنیں"}
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
                    {language === "en" ? "Account" : "اکاؤنٹ"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    {language === "en" ? "Profile" : "پروفائل"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/bookings")}>
                    {language === "en" ? "My Bookings" : "میری بکنگز"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {language === "en" ? "Logout" : "لاگ آؤٹ"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/auth")}>
                <User className="h-4 w-4 mr-2" />
                {language === "en" ? "Login" : "لاگ ان"}
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/providers")}>
              {language === "en" ? "Find Services" : "خدمات تلاش کریں"}
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/emergency")}>
              {language === "en" ? "Emergency" : "ایمرجنسی"}
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              {language === "en" ? "Become a Provider" : "فراہم کنندہ بنیں"}
            </Button>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setLanguage("en")}>
                English
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLanguage("ur")}>
                اردو
              </Button>
            </div>
            {user ? (
              <>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/profile")}>
                  {language === "en" ? "Profile" : "پروفائل"}
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/bookings")}>
                  {language === "en" ? "My Bookings" : "میری بکنگز"}
                </Button>
                <Button className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {language === "en" ? "Logout" : "لاگ آؤٹ"}
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={() => navigate("/auth")}>
                <User className="h-4 w-4 mr-2" />
                {language === "en" ? "Login" : "لاگ ان"}
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
