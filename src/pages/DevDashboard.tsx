
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DevRoute from '@/components/DevRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DevDashboard = () => {
  const navigate = useNavigate();

  return (
    <DevRoute mockUserType="user">
      <div className="min-h-screen bg-black text-foreground flex flex-col">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-20 pt-32">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Development Dashboard</h1>
            <p className="text-muted-foreground">Testing regular user functionality</p>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="glass glass-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Dashboard
                </CardTitle>
                <CardDescription>Regular user view (current)</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full button-gradient"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Real Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card className="glass glass-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-400" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription>Switch to admin view</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/dev-admin')}
                  variant="outline"
                  className="w-full glass border-orange-500/30 text-orange-400"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Switch to Admin
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

          {/* User Features Testing */}
          <Card className="glass glass-hover">
            <CardHeader>
              <CardTitle>User Features</CardTitle>
              <CardDescription>Test regular user functionality</CardDescription>
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
                <Button 
                  onClick={() => navigate('/referrals')}
                  variant="outline"
                  className="glass"
                >
                  Referrals
                </Button>
                <Button 
                  onClick={() => navigate('/messages')}
                  variant="outline"
                  className="glass"
                >
                  Messages
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

export default DevDashboard;
