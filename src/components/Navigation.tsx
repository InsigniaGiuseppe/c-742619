
import { useState, useEffect } from "react";
import { Command, Menu, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      navigate('/');
    }
  };

  // Navigation items - only show authenticated routes when user is logged in
  const navItems = [
    { name: "Home", href: "/", isExternal: false, requiresAuth: false },
    ...(user ? [
      { name: "Dashboard", href: "/dashboard", isExternal: false, requiresAuth: true },
      { name: "Trading", href: "/trading", isExternal: false, requiresAuth: true },
      { name: "Wallet", href: "/wallet", isExternal: false, requiresAuth: true },
    ] : [])
  ];

  const handleMobileNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    navigate(href);
  };

  return (
    <header
      className={`fixed top-3.5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 rounded-full ${
        isScrolled 
          ? "h-14 bg-[#1B1B1B]/40 backdrop-blur-xl border border-white/10 scale-95 w-[90%] max-w-2xl" 
          : "h-14 bg-[#1B1B1B] w-[95%] max-w-3xl"
      }`}
    >
      <div className="mx-auto h-full px-6">
        <nav className="flex items-center justify-between h-full">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/a2c0bb3a-a47b-40bf-ba26-d79f2f9e741b.png" 
              alt="PROMPTO TRADING" 
              className="w-8 h-8"
            />
            <span className="font-bold text-base">PROMPTO TRADING</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300"
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => navigate('/profile')} 
                  size="sm"
                  variant="outline"
                  className="glass"
                >
                  <User className="w-4 h-4 mr-1" />
                  Profile
                </Button>
                <Button 
                  onClick={handleSignOut}
                  size="sm"
                  variant="outline"
                  className="glass"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => navigate('/login')}
                  size="sm"
                  variant="outline"
                  className="glass"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  size="sm"
                  className="button-gradient"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="glass">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#1B1B1B]">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className="text-lg text-muted-foreground hover:text-foreground justify-start"
                      onClick={() => handleMobileNavClick(item.href)}
                    >
                      {item.name}
                    </Button>
                  ))}
                  
                  {user ? (
                    <div className="flex flex-col gap-2 mt-4">
                      <Button 
                        onClick={() => handleMobileNavClick('/profile')}
                        variant="outline"
                        className="glass"
                      >
                        <User className="w-4 h-4 mr-1" />
                        Profile
                      </Button>
                      <Button 
                        onClick={handleSignOut}
                        variant="outline"
                        className="glass"
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-4">
                      <Button 
                        onClick={() => handleMobileNavClick('/login')}
                        variant="outline"
                        className="glass"
                      >
                        Login
                      </Button>
                      <Button 
                        onClick={() => handleMobileNavClick('/register')}
                        className="button-gradient"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
