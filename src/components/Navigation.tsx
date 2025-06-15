import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "See you later 👋",
    })
  };

  return (
    <header className="bg-secondary text-secondary-foreground py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          Crypto Dashboard
        </Link>
        <nav>
          <ul className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className="hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
            {session ? (
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session?.user?.user_metadata?.avatar_url} alt={session?.user?.user_metadata?.full_name} />
                        <AvatarFallback>{session?.user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem><Link to="/profile">Profile</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                </li>
                <li>
                  <Link to="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
