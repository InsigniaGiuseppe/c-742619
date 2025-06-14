
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Wrench } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Login attempt:', formData.email);
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login Error",
          description: error.message || "Failed to sign in",
          variant: "destructive",
        });
      } else if (data?.user) {
        console.log('Login successful:', data.user);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login catch error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = () => {
    setFormData({
      email: 'test@prompto.trading',
      password: 'password123'
    });
  };

  const handleAdminLogin = () => {
    setFormData({
      email: 'admin@prompto.trading',
      password: 'admin123'
    });
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24 flex items-center justify-center">
        <div className="glass glass-hover rounded-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <img 
              src="/lovable-uploads/a2c0bb3a-a47b-40bf-ba26-d79f2f9e741b.png" 
              alt="PROMPTO TRADING" 
              className="w-16 h-16 mx-auto mb-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your PROMPTO TRADING account</p>
          </div>

          {/* Development Bypass Section */}
          <div className="mb-6 p-4 border border-yellow-600/30 rounded-lg bg-yellow-600/10">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Development Mode</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Bypass authentication for development purposes
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/dev-dashboard')}
                size="sm"
                variant="outline"
                className="flex-1 glass border-blue-500/30 text-blue-400"
              >
                <User className="w-3 h-3 mr-1" />
                User Mode
              </Button>
              <Button
                onClick={() => navigate('/dev-admin')}
                size="sm"
                variant="outline"
                className="flex-1 glass border-orange-500/30 text-orange-400"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin Mode
              </Button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="you@example.com" 
                className="mt-1 bg-background/80"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                placeholder="••••••••" 
                className="mt-1 bg-background/80"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleTestLogin}
                  className="text-xs"
                >
                  Test User
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAdminLogin}
                  className="text-xs text-orange-400"
                >
                  Admin Login
                </Button>
              </div>
              <Link to="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button 
              type="submit" 
              className="w-full button-gradient"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Test User: test@prompto.trading / password123
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Admin User: admin@prompto.trading / admin123
            </p>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
