
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DevRoute from '@/components/DevRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DevAdmin = () => {
  const navigate = useNavigate();

  return (
    <DevRoute mockUserType="admin">
      <div className="min-h-screen bg-black text-foreground flex flex-col">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-20 pt-32">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/lovable-uploads/a2c0bb3a-a47b-40bf-ba26-d79f2f9e741b.png" 
                alt="PROMPTO TRADING Logo" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-4xl font-bold">Development Admin</h1>
                <h2 className="text-xl text-muted-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-400" />
                  Testing admin functionality
                </h2>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="glass glass-hover border-orange-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <Shield className="w-5 h-5" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription>Admin view (current)</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/admin')}
                  className="w-full button-gradient"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Real Admin
                </Button>
              </CardContent>
            </Card>

            <Card className="glass glass-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Dashboard
                </CardTitle>
                <CardDescription>Switch to user view</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/dev-dashboard')}
                  variant="outline"
                  className="w-full glass"
                >
                  <User className="w-4 h-4 mr-2" />
                  Switch to User
                </Button>
              </CardContent>
            </Card>

            <Card className="glass glass-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Home Page
                </CardTitle>
                <CardDescription>Return to landing page</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full glass"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Admin Features Testing */}
          <Card className="glass glass-hover border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-orange-400">Admin Features</CardTitle>
              <CardDescription>Test admin functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  className="glass border-orange-500/30 text-orange-400"
                >
                  Admin Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/admin/users')}
                  variant="outline"
                  className="glass border-orange-500/30 text-orange-400"
                >
                  User Management
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Features Available to Admin */}
          <Card className="glass glass-hover mt-6">
            <CardHeader>
              <CardTitle>User Features (Admin Access)</CardTitle>
              <CardDescription>Test user features as admin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate('/wallet')}
                  variant="outline"
                  className="glass"
                >
                  Wallet
                </Button>
                <Button 
                  onClick={() => navigate('/trading')}
                  variant="outline"
                  className="glass"
                >
                  Trading
                </Button>
                <Button 
                  onClick={() => navigate('/lending')}
                  variant="outline"
                  className="glass"
                >
                  Lending
                </Button>
                <Button 
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  className="glass"
                >
                  Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </DevRoute>
  );
};

export default DevAdmin;
