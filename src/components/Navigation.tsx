
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from '@/components/ui/use-toast';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/wallet', label: 'Wallet' },
  { href: '/trading', label: 'Trading' },
  { href: '/lending', label: 'Lending' },
  { href: '/vaults', label: 'Vaults' },
];

const Navigation: React.FC = () => {
  const { session, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "See you later 👋",
    })
  };

  return (
    <header className="w-full py-4">
      <div className="container px-4 md:px-6 lg:px-8">
        <div className="glass glass-hover rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 md:gap-3 group">
              <img 
                src="/lovable-uploads/3765d287-ffd3-40d5-8628-4f8191064138.png" 
                alt="PROMPTO TRADING Logo" 
                className="w-6 h-6 md:w-8 md:h-8 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-lg md:text-xl font-bold text-gradient">
                PROMPTO TRADING
              </span>
            </Link>
            
            <nav className="hidden lg:block">
              <ul className="flex items-center space-x-8">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href} 
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 story-link"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {isAdmin && (
                  <li>
                    <Link 
                      to="/admin/dashboard" 
                      className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors duration-300 story-link"
                    >
                      Admin
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            <div className="flex items-center space-x-4">
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-white/10 transition-colors duration-300">
                      <Avatar className="h-10 w-10 border-2 border-white/20">
                        <AvatarImage src={session?.user?.user_metadata?.avatar_url} alt={session?.user?.user_metadata?.full_name} />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                          {session?.user?.user_metadata?.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-lg border-white/10" align="end" forceMount>
                    <DropdownMenuLabel className="text-foreground">My Account</DropdownMenuLabel>
                    <DropdownMenuItem className="hover:bg-white/10 transition-colors">
                      <Link to="/profile" className="w-full">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-transparent border-white/20 text-foreground hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button 
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/25"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="lg:hidden mt-4 pt-4 border-t border-white/10">
            <ul className="flex flex-wrap items-center gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 story-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isAdmin && (
                <li>
                  <Link 
                    to="/admin/dashboard" 
                    className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors duration-300 story-link"
                  >
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
