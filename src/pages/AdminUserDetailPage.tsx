
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Wallet, Activity, Settings } from 'lucide-react';
import { useAdminUser } from '@/hooks/useAdminUser';
import UserActions from '@/components/admin/UserActions';
import UserActivityLog from '@/components/admin/UserActivityLog';
import UserFinancialControls from '@/components/admin/UserFinancialControls';
import AdminPortfolioOverview from '@/components/admin/AdminPortfolioOverview';
import { Skeleton } from '@/components/ui/skeleton';

const AdminUserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  console.log('[AdminUserDetailPage] Rendering with userId:', userId);
  
  const { data: user, isLoading, error } = useAdminUser(userId);

  console.log('[AdminUserDetailPage] Hook state:', { user, isLoading, error });

  if (isLoading) {
    console.log('[AdminUserDetailPage] Showing loading state');
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !user) {
    console.log('[AdminUserDetailPage] Showing error state:', { error, user });
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-400 mb-4">User Not Found</h1>
        <p className="text-muted-foreground mb-4">
          Could not load user with ID: {userId}
        </p>
        <p className="text-sm text-red-300 mb-4">
          Error: {error?.message || 'Unknown error'}
        </p>
        <Button onClick={() => navigate('/admin/users')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  console.log('[AdminUserDetailPage] Rendering main content for user:', user);

  return (
    <div className="space-y-6">
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
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${String(user.demo_balance_usd || '0.00')}</div>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{String(user.account_status || 'active')}</div>
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
          {userId && <AdminPortfolioOverview userId={userId} />}
        </TabsContent>
        
        <TabsContent value="financial" className="mt-6">
          {userId && <UserFinancialControls userId={userId} />}
        </TabsContent>
        
        <TabsContent value="actions" className="mt-6">
          <UserActions user={user} />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          {userId && <UserActivityLog userId={userId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserDetailPage;
