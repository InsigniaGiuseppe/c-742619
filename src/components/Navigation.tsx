
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Menu, X, Shield } from 'lucide-react';

const Navigation = () => {
  const {
    user,
    signOut
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const navLinks = [{
    path: '/dashboard',
    label: 'Dashboard'
  }, {
    path: '/trading',
    label: 'Trade'
  }, {
    path: '/wallet',
    label: 'Wallet'
  }, {
    path: '/lending',
    label: 'Lending'
  }, {
    path: '/messages',
    label: 'Messages'
  }];
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <nav className="container mx-auto rounded-xl bg-black/80 backdrop-blur-md border border-gray-700">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 md:gap-3">
              <img src="/lovable-uploads/3765d287-ffd3-40d5-8628-4f8191064138.png" alt="COINS Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-slate-50">
                COINS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {user && navLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`text-sm font-medium transition-colors ${isActive(link.path) ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              {user ? <div className="flex items-center space-x-3 lg:space-x-4">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/admin/login')} className="text-orange-400 hover:text-orange-300">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div> : <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="button-gradient">
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && <div className="md:hidden border-t border-gray-800 pt-4 pb-4">
              <div className="flex flex-col space-y-2">
                {user &&
                  navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${isActive(link.path) ? 'text-blue-400 bg-blue-400/10' : 'text-gray-300 hover:text-white hover:bg-gray-800'} rounded-md`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                
                {user ? (
                  <div className="border-t border-gray-800 pt-2 mt-2">
                    <Link to="/admin/login" className="flex items-center px-3 py-2 text-sm font-medium text-orange-400 hover:text-orange-300 hover:bg-gray-800 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Portal
                    </Link>
                    <Link to="/profile" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    <button onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }} className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-800 pt-2 mt-2 space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md" onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md" onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>}
        </div>
      </nav>
    </header>
  );
};
export default Navigation;
