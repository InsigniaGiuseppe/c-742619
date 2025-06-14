
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminLoginPage = () => {
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
      console.log('Admin login attempt:', formData.email);
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        console.error('Admin login error:', error);
        toast({
          title: "Login Error",
          description: error.message || "Failed to sign in",
          variant: "destructive",
        });
      } else if (data?.user) {
        console.log('Admin login successful:', data.user);
        
        // Check if user is admin via profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();
        
        if (profile?.is_admin) {
          toast({
            title: "Admin Access Granted",
            description: "Welcome, Administrator!",
          });
          navigate('/admin');
        } else {
          toast({
            title: "Access Denied",
            description: "Admin privileges required",
            variant: "destructive",
          });
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Admin login catch error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24 flex items-center justify-center">
        <div className="glass glass-hover rounded-xl p-8 w-full max-w-md border-orange-500/20">
          <div className="text-center mb-6">
            <img 
              src="/lovable-uploads/bf56a0c6-48e4-49f7-b286-8e3fda9a3385.png" 
              alt="PROMPTO TRADING" 
              className="w-16 h-16 mx-auto mb-4"
            />
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-orange-400" />
            </div>
            <h1 className="text-3xl font-bold text-orange-400">Admin Portal</h1>
            <p className="text-muted-foreground mt-2">Secure administrator access</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="admin@prompto.trading" 
                className="mt-1 bg-background/80 border-orange-500/30"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                placeholder="••••••••" 
                className="mt-1 bg-background/80 border-orange-500/30"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Link to="/login" className="text-sm text-primary hover:underline">
                Regular Login
              </Link>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Admin Sign In'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLoginPage;
