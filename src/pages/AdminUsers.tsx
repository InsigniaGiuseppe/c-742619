
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, ArrowLeft, AlertCircle, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: users, isLoading, isError, error } = useAdminUsers(debouncedSearchTerm);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'frozen': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'blocked': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getKycStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'not_started': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
          <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
        </TableRow>
      ));
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={8}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Fetching Users</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'An unknown error occurred.'}
              </AlertDescription>
            </Alert>
          </TableCell>
        </TableRow>
      );
    }

    if (!users || users.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-10">
            No users found.
          </TableCell>
        </TableRow>
      );
    }

    return users.map((user) => (
      <TableRow key={user.id} className="hover:bg-muted/5">
        <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          <Badge className={getStatusColor(user.account_status)}>{user.account_status}</Badge>
        </TableCell>
        <TableCell>{user.account_type}</TableCell>
        <TableCell>
          <Badge className={getKycStatusColor(user.kyc_status || 'not_started')}>
            {user.kyc_status ? user.kyc_status.replace(/_/g, ' ') : 'Not Started'}
          </Badge>
        </TableCell>
        <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</TableCell>
        <TableCell>{user.last_login_date ? new Date(user.last_login_date).toLocaleDateString() : 'Never'}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="glass"
              onClick={() => navigate(`/admin/users/${user.id}`)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="glass text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
            >
              <UserX className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-20 pt-24">
        <div className="mb-8">
          <Button 
            onClick={() => navigate('/admin')}
            variant="outline" 
            className="glass mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Button>

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
              <h1 className="text-4xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage user accounts, KYC status, and permissions</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass glass-hover mb-8">
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
            <CardDescription>Find users by name, email, or user ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/80"
                />
              </div>
              <Button className="button-gradient" onClick={() => setDebouncedSearchTerm(searchTerm)}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="glass glass-hover">
          <CardHeader>
            <CardTitle>All Users ({isLoading ? '...' : users?.length ?? 0})</CardTitle>
            <CardDescription>Click on a user to view detailed information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Registered At</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTableContent()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;
