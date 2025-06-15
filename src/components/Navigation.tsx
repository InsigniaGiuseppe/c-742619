
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
import { Dice6 } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
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
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/3765d287-ffd3-40d5-8628-4f8191064138.png" 
                alt="PROMPTO TRADING Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-white">PROMPTO</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            {session && (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link to="/trading" className="text-gray-300 hover:text-white transition-colors">
                  Trading
                </Link>
                <Link to="/lending" className="text-gray-300 hover:text-white transition-colors">
                  Lending
                </Link>
                <Link to="/vaults" className="text-gray-300 hover:text-white transition-colors">
                  Vaults
                </Link>
                <Link to="/spin" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                  <Dice6 className="w-4 h-4" />
                  Spin & Win
                </Link>
                <Link to="/wallet" className="text-gray-300 hover:text-white transition-colors">
                  Wallet
                </Link>
                <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">
                  Profile
                </Link>
              </>
            )}
          </div>

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
                  <DropdownMenuItem className="hover:bg-white/10 transition-colors">
                    <Link to="/wallet" className="w-full">Wallet</Link>
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
                  to="/admin" 
                  className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors duration-300 story-link"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </nav>
  );
};

export default Navigation;
