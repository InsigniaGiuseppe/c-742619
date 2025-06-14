
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-32">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your PROMPTO TRADING dashboard!</p>
        </div>
        
        {/* Development Helper */}
        <Card className="glass glass-hover border-yellow-600/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Wrench className="w-5 h-5" />
              Development Helper
            </CardTitle>
            <CardDescription>Quick access to development modes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/dev-dashboard')}
                variant="outline"
                className="glass border-blue-500/30 text-blue-400"
              >
                Dev User Mode
              </Button>
              <Button 
                onClick={() => navigate('/dev-admin')}
                variant="outline"
                className="glass border-orange-500/30 text-orange-400"
              >
                Dev Admin Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main dashboard content will go here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass glass-hover">
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>Your trading portfolio overview</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$0.00</p>
              <p className="text-muted-foreground">Total Value</p>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardHeader>
              <CardTitle>Active Trades</CardTitle>
              <CardDescription>Current open positions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-muted-foreground">Open Positions</p>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardHeader>
              <CardTitle>P&L Today</CardTitle>
              <CardDescription>Today's profit and loss</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-400">+$0.00</p>
              <p className="text-muted-foreground">Daily Change</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
