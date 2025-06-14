
import { useState, useEffect } from "react";
import { Command, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simplified nav items for multi-page app
  const navItems = [
    { name: "Home", href: "/", isExternal: false },
    { name: "Dashboard", href: "/dashboard", isExternal: false },
    { name: "Markets", href: "/trading", isExternal: false }, // Example, can be more dynamic later
    // Add more pages as needed, e.g. Wallet, Profile etc.
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
            <Command className="w-5 h-5 text-primary" />
            <span className="font-bold text-base">CryptoTrade</span>
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
            <Button 
              onClick={() => navigate('/login')} // Navigate to login page
              size="sm"
              variant="outline" // Changed from button-gradient for better contrast
              className="glass"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/register')} // Navigate to register page
              size="sm"
              className="button-gradient"
            >
              Sign Up
            </Button>
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
                  <Button 
                    onClick={() => handleMobileNavClick('/login')}
                    variant="outline"
                    className="glass mt-4"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => handleMobileNavClick('/register')}
                    className="button-gradient mt-2" // Adjusted margin
                  >
                    Sign Up
                  </Button>
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
