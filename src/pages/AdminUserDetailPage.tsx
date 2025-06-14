
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Wallet, Activity, Settings } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAdminUser } from '@/hooks/useAdminUser';
import UserActions from '@/components/admin/UserActions';
import UserActivityLog from '@/components/admin/UserActivityLog';
import UserFinancialControls from '@/components/admin/UserFinancialControls';
import PortfolioOverview from '@/components/PortfolioOverview';
import { Skeleton } from '@/components/ui/skeleton';

const AdminUserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useAdminUser(userId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-foreground flex flex-col">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-20 pt-24">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black text-foreground flex flex-col">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-20 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">User Not Found</h1>
            <Button onClick={() => navigate('/admin/users')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/users')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">User Details</h1>
              <p className="text-muted-foreground">Manage user account and portfolio</p>
            </div>
          </div>
        </div>

        {/* User Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass glass-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{String(user.email || 'N/A')}</div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demo Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${String(user.demo_balance || '0.00')}</div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{String(user.status || 'active')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Financial Controls
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              User Actions
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolio" className="mt-6">
            <PortfolioOverview />
          </TabsContent>
          
          <TabsContent value="financial" className="mt-6">
            <UserFinancialControls userId={userId!} />
          </TabsContent>
          
          <TabsContent value="actions" className="mt-6">
            <UserActions user={user} />
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <UserActivityLog userId={userId!} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUserDetailPage;
